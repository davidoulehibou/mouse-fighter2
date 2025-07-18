const express = require("express");
const cors = require("cors"); // ✅ importer cors
const fs = require("fs");
const path = require("path");
const dataFile = path.join(__dirname, "data.json");
const WebSocket = require("ws");
const pool = require("./db");

const app = express();
const port = 3000;

const memoryPositions = new Map();

app.use(cors());
const wss = new WebSocket.Server({ port: 8080 });

// Connexion d'un joueur dans une room

wss.on("connection", async (ws, req) => {
  const params = new URLSearchParams(req.url.replace(/^\/\?/, ""));
  const roomCode = params.get("room");

  ws.roomCode = roomCode;
  ws.isAlive = true;

  if (!roomCode) {
    ws.close(1008, "Code de room manquant");
    return;
  }

  ws.on("message", (data) => {
    let message;
    try {
      message = JSON.parse(data);
    } catch (err) {
      console.error("Message non JSON :", data);
      return;
    }

    if (message.type === "disconnect") {
      const playerId = message.playerId;
      console.log("Déconnexion du joueur :", playerId);
      console.log("szdfgzdfgzfrgsdfgsdfgsdfgsdfgsdfg",playerId);
      deconnectPlayer(playerId, roomCode);
      broadcastToRoom(roomCode);
    }

    if (message.type === "update-position") {
      updateJoueurPositions(
        message.playerId,
        message.x,
        message.y,
        message.room
      );
    }
  });

  ws.on("pong", () => (ws.isAlive = true));

  ws.on("close", (code, reason) => {
    console.log("Déconnexion socket : ", code);
  });

  broadcastToRoom(roomCode);
});

wss.on("close", () => clearInterval(interval));

// supprimer le joueur à la déconnexion

const deconnectPlayer = async (playerId, roomCode) => {
  const conn = await pool.getConnection();
  await conn.query("DELETE FROM joueurs WHERE id = ?", [playerId]);
  const result = await conn.query("SELECT * FROM joueurs WHERE roomcode = ?", [
    roomCode,
  ]);
  if (result.length === 0) {
    await conn.query("DELETE FROM rooms WHERE roomcode = ?", [roomCode]);
  }
  conn.release();

  // 🧼 Nettoyage mémoire
  if (memoryPositions.has(roomCode)) {
    memoryPositions.get(roomCode).delete(playerId);
  }

  broadcastToRoom(roomCode);
};

// récupérer les infos de la room avant l'envoi

const getRoomData = async (roomCode) => {
  try {
    const conn = await pool.getConnection();
    const result = await conn.query("SELECT * FROM rooms WHERE roomcode = ?", [
      roomCode,
    ]);
    const players = await conn.query(
      "SELECT * FROM joueurs WHERE roomcode = ?",
      [roomCode]
    );
    conn.release();

    if (result.length === 0) return null;

    return {
      room: result[0],
      players: players || [],
    };
  } catch (err) {
    console.error(
      "Erreur lors de la récupération des données de la room :",
      err
    );
    return null;
  }
};

// envoyer les infos à la room

const broadcastToRoom = async (roomCode) => {
  const roomData = await getRoomData(roomCode);

  if (!roomData) {
    wss.clients.forEach((client) => {
      if (
        client.readyState === WebSocket.OPEN &&
        client.roomCode === roomCode
      ) {
        client.send(
          JSON.stringify({ type: "error", error: "room doesn't exist " })
        );
      }
    });
  }

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN && client.roomCode === roomCode) {
      client.send(JSON.stringify({ type: "room-update", roomData }));
    }
  });
};

setInterval(() => {
  for (const [roomCode, playersMap] of memoryPositions.entries()) {
    const players = Array.from(playersMap.entries()).map(([id, pos]) => ({
      id,
      x: pos.x,
      y: pos.y,
    }));

    if (players.length === 0) {
      memoryPositions.delete(roomCode); 
      continue;
    }

    const message = JSON.stringify({
      type: "players-positions",
      players,
    });

    wss.clients.forEach((client) => {
      if (
        client.readyState === WebSocket.OPEN &&
        client.roomCode === roomCode
      ) {
        client.send(message);
      }
    });
  }
}, 33); 

// Créer une room

app.get("/api/createRoom", async (req, res) => {
  const { room } = req.query;

  try {
    const conn = await pool.getConnection();
    await conn.query("INSERT INTO rooms (roomcode) VALUES (?); ", [room]);
    conn.release();
  } catch (err) {
    console.error(err);
    return res.json({ success: false });
  }

  return res.json({ success: true });
});

//Créer un Joueur

app.get("/api/createPlayer", async (req, res) => {
  const { room, name } = req.query;
  let playerId = 0;

  function hslToHex(h, s, l) {
    l /= 100;
    const a = (s * Math.min(l, 1 - l)) / 100;
    const f = (n) => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color)
        .toString(16)
        .padStart(2, "0");
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  }

  let color = hslToHex(Math.floor(Math.random() * 255), 40, 60);

  try {
    console.log(room, name);
    const conn = await pool.getConnection();
    const okPacket = await conn.query(
      "INSERT INTO joueurs (nom, roomcode, color) VALUES (?, ?, ?); ",
      [name, room, color]
    );
    conn.release();
    playerId = Number(okPacket.insertId);
  } catch (err) {
    console.error(err);
    return res.json({ success: false, playerId: null });
  }

  return res.json({ success: true, playerId: playerId });
});

// modifier les positions d'un joueur

const updateJoueurPositions = (playerId, x, y, roomCode) => {
  if (!memoryPositions.has(roomCode)) {
    memoryPositions.set(roomCode, new Map());
  }

  const roomPlayers = memoryPositions.get(roomCode);
  roomPlayers.set(playerId, { x, y });
};

setInterval(async () => {
  const conn = await pool.getConnection();
  for (const [roomCode, playersMap] of memoryPositions.entries()) {
    for (const [playerId, { x, y }] of playersMap.entries()) {
      await conn.query("UPDATE joueurs SET x = ?, y = ? WHERE id = ?", [
        x,
        y,
        playerId,
      ]);
    }
  }
  conn.release();
}, 10000);

//==============  GAME ==================

//Boucle gameplay

setInterval(async () => {
  const conn = await pool.getConnection();
  const result = await conn.query(
    "SELECT roomcode,status, countdown FROM rooms "
  );
  conn.release();

  if (result.length > 0) {
    result.map(async (room) => {
      let newCountdown = room.countdown - 1;
      let newStatus = room.status;
      if (newCountdown < 0 && room.status == "pause") {
        newStatus = "play";
        newCountdown = 5;
      } else if (newCountdown < 0 && room.status == "play") {
        newStatus = "pause";
        newCountdown = 3;
      }
      try {
        const conn = await pool.getConnection();
        await conn.query(
          "UPDATE rooms SET status = ?, countdown = ? WHERE roomcode = ?",
          [newStatus, newCountdown, room.roomcode]
        );
        conn.release();
      } catch (err) {
        console.error(err);
      }
      broadcastToRoom(room.roomcode);
    });
  }
}, 1000);

app.listen(port, () => {
  console.log(`Backend running on http://localhost:${port}`);
});
