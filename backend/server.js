const express = require("express");
const cors = require("cors"); // ✅ importer cors
const fs = require("fs");
const path = require("path");
const dataFile = path.join(__dirname, "data.json");
const WebSocket = require("ws");
const pool = require("./db");

const app = express();
const port = 3000;

app.use(cors());
const wss = new WebSocket.Server({ port: 8080 });

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

wss.on("connection", async (ws, req) => {
  const params = new URLSearchParams(req.url.replace(/^\/\?/, ""));
  const roomCode = params.get("room");

  ws.roomCode = roomCode;
  ws.isAlive = true;

  if (!roomCode) {
    ws.close(1008, "Code de room manquant");
    return;
  }

  ws.on("pong", () => (ws.isAlive = true));

  broadcastToRoom(roomCode);
});

const interval = setInterval(() => {
  wss.clients.forEach((ws) => {
    if (!ws.isAlive) return ws.terminate();
    ws.isAlive = false;
    ws.ping();
  });
}, 30000);

wss.on("message", async (message) => {
  try {
    const data = JSON.parse(message);
    if (data.type === "get-room") {
      const roomData = await getRoomData(ws.roomCode);
      if (roomData) {
        ws.send(JSON.stringify({ type: "room-update", roomData }));
      } else {
        ws.send(JSON.stringify({ type: "error", error: "Room non trouvée" }));
      }
    }
  } catch (err) {
    console.error("Erreur lors du traitement du message WebSocket :", err);
    ws.send(JSON.stringify({ type: "error", error: "Message invalide" }));
  }
});

wss.on("close", () => clearInterval(interval));

const broadcastToRoom = async (roomCode) => {
  const roomData = await getRoomData(roomCode);

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN && client.roomCode === roomCode) {
      client.send(JSON.stringify({ type: "room-update", roomData }));
    }
  });
};

app.get("/api/createPlayer", async (req, res) => {
  const { room, name } = req.query;
  let playerId = 0

  try {
    console.log(room, name);
    const conn = await pool.getConnection();
    const okPacket = await conn.query(
      "INSERT INTO joueurs (nom, roomcode) VALUES (?, ?); ",
      [name, room]
    );
    conn.release();
    playerId = Number(okPacket.insertId)
  } catch (err) {
    console.error(err);
    return res.json({ success: false, playerId: null });
  }

  return res.json({ success: true, playerId: playerId });
});

//game

setInterval(async () => {
  const conn = await pool.getConnection();
  const result = await conn.query(
    "SELECT roomcode,status, countdown FROM rooms "
  );
  conn.release();
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
}, 1000);

app.listen(port, () => {
  console.log(`Backend running on http://localhost:${port}`);
});
