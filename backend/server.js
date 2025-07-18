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

  ws.on("pong", () => (ws.isAlive = true));

  broadcastToRoom(roomCode);
});

const broadcastToRoom = async (roomCode) => {
  const roomData = await getRoomData(roomCode);

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN && client.roomCode === roomCode) {
      client.send(JSON.stringify({ type: "room-update", roomData }));
    }
  });
};

//game

setInterval(async () => {
  const conn = await pool.getConnection();
  const result = await conn.query(
    "SELECT roomcode,status, countdown FROM rooms "
  );
  conn.release();
  console.log(result);
  result.map(async (room) => {
    let newCountdown = room.countdown - 1;
    let newStatus = room.status;
    if (newCountdown < 0 && room.status == "pause") {
      newStatus = "play";
      newCountdown = 10;
    } else if (newCountdown < 0 && room.status == "play") {
      newStatus = "pause";
      newCountdown = 5;
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
