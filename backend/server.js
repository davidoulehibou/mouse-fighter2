const express = require("express");
const cors = require("cors"); 
const WebSocket = require("ws");
require("dotenv").config();

const app = express();
const port = 3000;

const memoryPositions = new Map();

const rooms = new Map();

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
      deconnectPlayer(playerId, roomCode);
      broadcastRoomToRoom(roomCode);
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

  broadcastRoomToRoom(roomCode);
});

wss.on("close", () => clearInterval(interval));

// supprimer le joueur à la déconnexion

const deconnectPlayer = async (playerId, roomCode) => {
  if (memoryPositions.has(roomCode)) {
    const roomPlayers = memoryPositions.get(roomCode);
    roomPlayers.delete(playerId);

    if (roomPlayers.size === 0) {
      memoryPositions.delete(roomCode);
    }
  }
};


// récupérer les infos de la room avant l'envoi

const getRoomData = async (roomCode) => {
  if (!rooms.has(roomCode)) return null;
  return { room: rooms.get(roomCode) };
};

// envoyer les infos à la room

const broadcastRoomToRoom = async (roomCode) => {
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
      nom: pos.nom,
      color: pos.color,
      text: pos.text,
      score: pos.score,
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
}, 20); 

// Créer une room

app.get("/api/createRoom", (req, res) => {
  const { room } = req.query;

  if (!room) {
    return res
      .status(400)
      .json({ success: false, message: "Room code required" });
  }

  if (!rooms.has(room)) {
    rooms.set(room, {
      roomcode: room,
      status: "pause",
      countdown: 3,
    });
  }

  return res.json({ success: true });
});
//Créer un Joueur

app.get("/api/createPlayer", async (req, res) => {
  const { room, name } = req.query;

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

  const color = hslToHex(
    Math.floor(Math.random() * 360),
    80,
    Math.floor(Math.random() * 10) + 40
  );
  const playerId = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  if (!memoryPositions.has(room)) {
    memoryPositions.set(room, new Map());
  }

  memoryPositions.get(room).set(playerId, {
    id: playerId,
    nom:name,
    color,
    text:"",
    x: 0,
    y: 0,
    score:0,
  });

  return res.json({ success: true, playerId });
});

// ecrire un text

app.get("/api/settext", async (req, res) => {
  const { joueur, text, roomCode } = req.query;

  console.log(joueur, text, roomCode);

  if (!memoryPositions.has(roomCode)) return;

  const roomPlayers = memoryPositions.get(roomCode);

  const player = roomPlayers.get(joueur);

  if (player) {
    player.text = text;
    
  }

  setTimeout(() => {
      
        if (player.text === text) {
          player.text = "";
        }
      
    }, 7000);

  return res.json({ success: true});
});


// modifier les positions d'un joueur

const updateJoueurPositions = (playerId, x, y, roomCode) => {
  if (!memoryPositions.has(roomCode)) return;

  const roomPlayers = memoryPositions.get(roomCode);
  const player = roomPlayers.get(playerId);

  if (player) {
    player.x = x;
    player.y = y;
  }
};



//==============  GAME ==================

//Boucle gameplay

setInterval(() => {
  for (const [roomcode, room] of rooms.entries()) {
    let newCountdown = room.countdown - 1;
    let newStatus = room.status;

    if (newCountdown < 0 && room.status === "pause") {
      newStatus = "play";
      newCountdown = 5;
    } else if (newCountdown < 0 && room.status === "play") {
      newStatus = "pause";
      newCountdown = 3;
    }

    rooms.set(roomcode, {
      ...room,
      status: newStatus,
      countdown: newCountdown,
    });

    broadcastRoomToRoom(roomcode);
  }
}, 1000);

app.listen(port, () => {
  console.log(`Backend running on http://localhost:${port}`);
});
