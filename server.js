const fs = require("fs");
const path = require("path");
const http = require("http");
const { WebSocketServer, WebSocket } = require("ws");

const PORT = Number(process.env.PORT || 3000);
const ROOT = process.cwd();
const WS_PATH = "/ws";
const ROOM_RE = /^[A-Z0-9]{6}$/;
const PLAYER_RE = /^[A-Z0-9]{8,20}$/;
const ROOM_IDLE_MS = 10 * 60 * 1000;
const CLEANUP_MS = 60 * 1000;
const HEARTBEAT_MS = 30000;
const MAX_PLAYERS_PER_ROOM = 4;
// Multiplayer gameplay can emit frequent aim updates and large snapshots.
// Keep limits protective but high enough for real matches.
const MAX_MSG_PER_SEC = 240;
const MAX_MSG_SIZE = 512 * 1024;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2"
};

const rooms = new Map();
const clients = new Set();

function nowMs() {
  return Date.now();
}

function randomCode(len = 6) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < len; i += 1) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

function createRoom() {
  for (let i = 0; i < 2000; i += 1) {
    const code = randomCode(6);
    if (!rooms.has(code)) {
      const room = {
        code,
        players: new Map(),
        hostId: "",
        started: false,
        lastActivity: nowMs()
      };
      rooms.set(code, room);
      return room;
    }
  }
  return null;
}

function touchRoom(room) {
  if (room) {
    room.lastActivity = nowMs();
  }
}

function playerList(room) {
  const list = [];
  let idx = 0;
  for (const id of room.players.keys()) {
    list.push({ id, index: idx });
    idx += 1;
  }
  return list;
}

function sendJson(ws, payload) {
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    return;
  }
  ws.send(JSON.stringify(payload));
}

function broadcastRoom(room, payload) {
  const raw = JSON.stringify(payload);
  for (const ws of room.players.values()) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(raw);
    }
  }
}

function broadcastLobbyState(room) {
  touchRoom(room);
  broadcastRoom(room, {
    t: "lobbyState",
    room: room.code,
    hostId: room.hostId,
    players: playerList(room),
    started: room.started
  });
}

function cleanupRoomIfEmpty(room) {
  if (!room || room.players.size > 0) {
    return;
  }
  rooms.delete(room.code);
}

function removePlayerFromRoom(room, playerId, ws) {
  if (!room || !playerId) {
    return;
  }
  const existing = room.players.get(playerId);
  if (existing !== ws) {
    return;
  }

  room.players.delete(playerId);
  if (room.hostId === playerId) {
    const nextHost = room.players.keys().next();
    room.hostId = nextHost.done ? "" : nextHost.value;
  }

  touchRoom(room);

  if (room.players.size === 0) {
    rooms.delete(room.code);
    return;
  }

  broadcastLobbyState(room);
}

function handleCreate(ws) {
  const room = createRoom();
  if (!room) {
    sendJson(ws, { t: "err", code: "room_create_failed", msg: "could_not_create_room" });
    return;
  }
  sendJson(ws, { t: "created", room: room.code });
}

function handleJoinGame(ws, msg) {
  const roomCode = `${msg.room || ""}`.toUpperCase();
  const playerId = `${msg.playerId || ""}`.toUpperCase();

  if (!ROOM_RE.test(roomCode) || !PLAYER_RE.test(playerId)) {
    sendJson(ws, { t: "err", code: "invalid_join", msg: "invalid_room_or_player" });
    return;
  }

  const room = rooms.get(roomCode);
  if (!room) {
    sendJson(ws, { t: "err", code: "room_not_found", msg: "room_not_found" });
    return;
  }

  if (room.started && !room.players.has(playerId)) {
    sendJson(ws, { t: "err", code: "match_started", msg: "match_started" });
    return;
  }

  if (!room.players.has(playerId) && room.players.size >= MAX_PLAYERS_PER_ROOM) {
    sendJson(ws, { t: "err", code: "room_full", msg: "room_full" });
    return;
  }

  const previousWs = room.players.get(playerId);
  if (previousWs && previousWs !== ws) {
    try {
      previousWs.close(1000, "replaced");
    } catch (_err) {
      // ignore
    }
  }

  room.players.set(playerId, ws);
  if (!room.hostId || !room.players.has(room.hostId)) {
    room.hostId = playerId;
  }

  ws._roomCode = room.code;
  ws._playerId = playerId;

  touchRoom(room);

  sendJson(ws, {
    t: "gameJoined",
    room: room.code,
    hostId: room.hostId,
    players: playerList(room),
    started: room.started
  });

  broadcastLobbyState(room);
}

function handleStartGame(ws, msg) {
  const roomCode = ws._roomCode;
  const playerId = ws._playerId;
  const room = roomCode ? rooms.get(roomCode) : null;

  if (!room || !playerId || room.hostId !== playerId) {
    sendJson(ws, { t: "err", code: "host_only", msg: "host_only" });
    return;
  }

  if (room.players.size < 2) {
    sendJson(ws, { t: "err", code: "need_players", msg: "need_at_least_two_players" });
    return;
  }

  const requestedRoom = `${msg.room || room.code || ""}`.toUpperCase();
  if (!ROOM_RE.test(requestedRoom) || requestedRoom !== room.code) {
    sendJson(ws, { t: "err", code: "room_mismatch", msg: "room_mismatch" });
    return;
  }

  room.started = true;
  touchRoom(room);
  sendJson(ws, { t: "startAck", room: room.code });
  broadcastRoom(room, { t: "gameStart", room: room.code });
  broadcastLobbyState(room);
}

function handleInput(ws, msg) {
  const room = ws._roomCode ? rooms.get(ws._roomCode) : null;
  const fromId = ws._playerId;
  if (!room || !fromId) {
    sendJson(ws, { t: "err", code: "not_joined", msg: "not_joined" });
    return;
  }

  const allowedActions = new Set(["aim", "weapon", "drive", "teleport", "fire", "endTurn"]);
  const action = `${msg.action || ""}`;
  if (!allowedActions.has(action)) {
    sendJson(ws, { t: "err", code: "bad_action", msg: "bad_action" });
    return;
  }

  const hostWs = room.players.get(room.hostId);
  if (!hostWs || hostWs.readyState !== WebSocket.OPEN) {
    return;
  }

  touchRoom(room);
  sendJson(hostWs, {
    t: "input",
    room: room.code,
    from: fromId,
    action,
    payload: msg.payload && typeof msg.payload === "object" ? msg.payload : {}
  });
}

function handleState(ws, msg) {
  const room = ws._roomCode ? rooms.get(ws._roomCode) : null;
  const fromId = ws._playerId;
  if (!room || !fromId || room.hostId !== fromId) {
    return;
  }

  touchRoom(room);
  const packet = JSON.stringify({
    t: "state",
    room: room.code,
    snapshot: msg.snapshot && typeof msg.snapshot === "object" ? msg.snapshot : null
  });

  for (const [pid, client] of room.players) {
    if (pid === fromId || client.readyState !== WebSocket.OPEN) {
      continue;
    }
    client.send(packet);
  }
}

function overRateLimit(ws) {
  const stamp = nowMs();
  if (!ws._rateWindowStart || stamp - ws._rateWindowStart > 1000) {
    ws._rateWindowStart = stamp;
    ws._rateCount = 0;
  }
  ws._rateCount += 1;
  return ws._rateCount > MAX_MSG_PER_SEC;
}

function handleSocketMessage(ws, raw) {
  if (typeof raw !== "string" || raw.length > MAX_MSG_SIZE) {
    sendJson(ws, { t: "err", code: "bad_message", msg: "bad_message" });
    return;
  }

  if (overRateLimit(ws)) {
    sendJson(ws, { t: "err", code: "rate_limited", msg: "rate_limited" });
    try {
      ws.close(1008, "rate_limited");
    } catch (_err) {
      // ignore
    }
    return;
  }

  let msg = null;
  try {
    msg = JSON.parse(raw);
  } catch (_err) {
    sendJson(ws, { t: "err", code: "bad_json", msg: "bad_json" });
    return;
  }

  if (!msg || typeof msg !== "object") {
    sendJson(ws, { t: "err", code: "bad_payload", msg: "bad_payload" });
    return;
  }

  const t = `${msg.t || ""}`;
  if (t === "create") {
    handleCreate(ws);
    return;
  }
  if (t === "joinGame") {
    handleJoinGame(ws, msg);
    return;
  }
  if (t === "startGame") {
    handleStartGame(ws, msg);
    return;
  }
  if (t === "input") {
    handleInput(ws, msg);
    return;
  }
  if (t === "state") {
    handleState(ws, msg);
    return;
  }

  sendJson(ws, { t: "err", code: "unknown_type", msg: "unknown_type" });
}

function expireIdleRooms() {
  const now = nowMs();
  for (const room of rooms.values()) {
    if (now - room.lastActivity < ROOM_IDLE_MS) {
      continue;
    }

    broadcastRoom(room, { t: "expired", room: room.code });
    for (const ws of room.players.values()) {
      try {
        ws.close(1000, "expired");
      } catch (_err) {
        // ignore
      }
    }
    rooms.delete(room.code);
  }
}

setInterval(expireIdleRooms, CLEANUP_MS).unref();

function heartbeatClients() {
  for (const ws of clients) {
    if (ws.readyState !== WebSocket.OPEN) {
      continue;
    }
    if (ws._alive === false) {
      try {
        ws.terminate();
      } catch (_err) {
        // ignore
      }
      continue;
    }
    ws._alive = false;
    try {
      ws.ping();
    } catch (_err) {
      // ignore
    }
  }
}

setInterval(heartbeatClients, HEARTBEAT_MS).unref();

const server = http.createServer((req, res) => {
  try {
    const reqUrl = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
    let pathname = decodeURIComponent(reqUrl.pathname || "/");
    if (pathname === "/") {
      pathname = "/index.html";
    }
    if (pathname === "/healthz") {
      res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" });
      res.end("ok");
      return;
    }

    let filePath = path.resolve(ROOT, `.${pathname}`);
    if (!filePath.startsWith(ROOT)) {
      res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Forbidden");
      return;
    }

    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
      filePath = path.join(filePath, "index.html");
    }

    fs.readFile(filePath, (err, data) => {
      if (err) {
        if (!path.extname(pathname)) {
          const fallback = path.join(ROOT, "index.html");
          fs.readFile(fallback, (fbErr, fbData) => {
            if (fbErr) {
              res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
              res.end("Not Found");
              return;
            }
            res.writeHead(200, {
              "Content-Type": MIME[".html"],
              "Cache-Control": "no-store"
            });
            res.end(fbData);
          });
          return;
        }
        res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
        res.end("Not Found");
        return;
      }
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, {
        "Content-Type": MIME[ext] || "application/octet-stream",
        "Cache-Control": "no-store"
      });
      res.end(data);
    });
  } catch (_err) {
    res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Server Error");
  }
});

const wss = new WebSocketServer({ noServer: true });

server.on("upgrade", (req, socket, head) => {
  const reqUrl = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
  if (reqUrl.pathname !== WS_PATH) {
    socket.destroy();
    return;
  }

  wss.handleUpgrade(req, socket, head, (ws) => {
    wss.emit("connection", ws, req);
  });
});

wss.on("connection", (ws) => {
  clients.add(ws);
  ws._roomCode = "";
  ws._playerId = "";
  ws._rateWindowStart = 0;
  ws._rateCount = 0;
  ws._alive = true;

  ws.on("pong", () => {
    ws._alive = true;
  });

  ws.on("message", (data) => {
    const raw = Buffer.isBuffer(data) ? data.toString("utf8") : `${data}`;
    handleSocketMessage(ws, raw);
  });

  ws.on("close", () => {
    clients.delete(ws);
    if (!ws._roomCode || !ws._playerId) {
      return;
    }
    const room = rooms.get(ws._roomCode);
    removePlayerFromRoom(room, ws._playerId, ws);
  });
});

server.listen(PORT, () => {
  // Keep startup output minimal.
  console.log(`Doodle Tanks server running on http://localhost:${PORT}`);
});

function shutdown() {
  for (const ws of clients) {
    try {
      ws.close(1001, "shutdown");
    } catch (_err) {
      // ignore
    }
  }
  server.close(() => {
    process.exit(0);
  });
  setTimeout(() => process.exit(0), 1500).unref();
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
