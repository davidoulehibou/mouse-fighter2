const express = require("express");
const cors = require("cors");
const WebSocket = require("ws");

const game1 = require("./games/game1");
const game2 = require("./games/game2");

const app = express();
const port = 3000;

const memoryPositions = new Map();

const rooms = new Map();

app.use(cors());
const wss = new WebSocket.Server({ port: 8080 });

//========== JOUEURS ====================

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
        message.click,
        message.room
      );
    }
    if (message.type === "update-dead") {
      updateJoueurDead(message.playerId, message.dead, message.room);
    }

    if (message.type === "update-click") {
      updateJoueurClick(message.playerId, message.click, message.room);
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
      rooms.delete(roomCode);
    }
  }
};

// récupérer les infos de la room avant l'envoi

setInterval(() => {
  for (const [roomCode, playersMap] of memoryPositions.entries()) {
    const players = Array.from(playersMap.entries()).map(([id, pos]) => pos);

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
    nom: name,
    color,
    text: "",
    x: 0,
    y: 0,
    score: 0,
    dead: false,
    click: false,
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

  return res.json({ success: true });
});

// modifier les positions d'un joueur

const updateJoueurPositions = (playerId, x, y, click, roomCode) => {
  if (!memoryPositions.has(roomCode)) return;

  const roomPlayers = memoryPositions.get(roomCode);
  const player = roomPlayers.get(playerId);

  if (player) {
    player.x = x;
    player.y = y;
    player.click = click;
  }
};

// changer la valeur dead d'un joueur

const updateJoueurDead = (playerId, dead, roomCode) => {
  if (!memoryPositions.has(roomCode)) return;

  const roomPlayers = memoryPositions.get(roomCode);
  const player = roomPlayers.get(playerId);

  if (player) {
    player.dead = dead;
  }
};


//==============  Rooom ==================

const getRoomData = async (roomCode) => {
  if (!rooms.has(roomCode)) return null;
  return { room: rooms.get(roomCode) };
};

// envoyer les infos à la room

const broadcastRoomToRoom = async (roomCode) => {
  const roomData = await getRoomData(roomCode);

  wss.clients.forEach((client) => {
    if (client.readyState !== WebSocket.OPEN || client.roomCode !== roomCode)
      return;

    if (!roomData) {
      client.send(
        JSON.stringify({ type: "error", error: "room doesn't exist" })
      );
    } else {
      client.send(JSON.stringify({ type: "room-update", roomData }));
    }
  });
};

// Créer une room

const createDefaultRoom = (roomCode) => ({
  roomcode: roomCode,
  status: "pause",
  countdown: 3,
  time: 5,
  type: "",
  infos: {},
});

app.get("/api/createRoom", (req, res) => {
  const { room } = req.query;

  if (!room) {
    return res
      .status(400)
      .json({ success: false, message: "Room code required" });
  }

  if (!rooms.has(room)) {
    rooms.set(room, createDefaultRoom(room));
  }

  return res.json({ success: true });
});

//Boucle gameplay

setInterval(() => {
  for (const [roomcode, room] of rooms.entries()) {
    let newCountdown = room.countdown - 1;
    let newStatus = room.status;

    if (newCountdown < 0 && room.status === "pause") {
      newStatus = "play";
      newCountdown = 5;
      newGame(roomcode);
    } else if (newCountdown < 0 && room.status === "play") {
      checkWin(roomcode);
      newStatus = "pause";
      newCountdown = 3;
      rooms.set(roomcode, {
        ...room,
        status: newStatus,
        countdown: newCountdown,
      });
    } else {
      rooms.set(roomcode, {
        ...room,
        status: newStatus,
        countdown: newCountdown,
      });
    }

    broadcastRoomToRoom(roomcode);
  }
}, 1000);

// choix du jeu

function newGame(roomcode) {
  const gamelist = [game1, game2];
  const game = gamelist[Math.floor(Math.random() * gamelist.length)];

  game(roomcode, updateRoom, setAllDead);
}

const updateRoom = (roomCode, updates = {}) => {
  const room = rooms.get(roomCode);
  if (!room) return;
  rooms.set(roomCode, { ...room, ...updates });
};

function setAllDead(roomCode) {
  const roomPlayers = memoryPositions.get(roomCode);
  roomPlayers.forEach((joueur) => {
    joueur.dead = true;
  });
}

// jeux

// attribuer les points

function checkWin(roomCode) {
  const room = rooms.get(roomCode);
  const roomPlayers = memoryPositions.get(roomCode);

  if (!room || !roomPlayers) {
    return;
  }
  roomPlayers.forEach((joueur) => {
    if (!joueur.dead) {
      joueur.score++;
    }
    updateJoueurDead(joueur.id, false, roomCode);
  });
}

app.listen(port, () => {
  console.log(`Backend running on http://localhost:${port}`);
});
