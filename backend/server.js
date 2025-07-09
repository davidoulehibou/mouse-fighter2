const express = require("express");
const cors = require("cors"); // ✅ importer cors
const fs = require("fs");
const path = require("path");
const WebSocket = require("ws");
const { json } = require("stream/consumers");

const app = express();
const port = 3000;

app.use(cors()); // ✅ autorise toutes les origines (par défaut)

// WebSocket
const wss = new WebSocket.Server({ port: 8080 });

setInterval(() => {
  wss.clients.forEach((ws) => {
    if (ws.isAlive === false) {
      console.log("Client inactif, fermeture forcée");
      return ws.terminate();
    }

    ws.isAlive = false;
    ws.ping();
  });
}, 30000);

const writeQueue = [];
let isWriting = false;

function processQueue() {
  if (isWriting || writeQueue.length === 0) return;

  isWriting = true;
  const { data, resolve, reject } = writeQueue.shift();

  fs.writeFile(
    path.join(__dirname, "data.json"),
    JSON.stringify(data, null, 2),
    "utf8",
    (err) => {
      isWriting = false;

      if (err) {
        console.error("Erreur d'écriture:", err);
        reject(err);
      } else {
        resolve();
      }

      // Appel récursif pour traiter le prochain élément
      processQueue();
    }
  );
}

function writeData(data) {
  return new Promise((resolve, reject) => {
    writeQueue.push({ data, resolve, reject });
    processQueue(); // Lance le traitement si ce n'est pas déjà en cours
  });
}

function updateContentByX(joueur, x, y, status) {
  fs.readFile("./data.json", "utf8", (err, data) => {
    if (err) {
      console.error("Erreur de lecture:", err);

      return;
    }

    let jsonData;
    try {
      jsonData = JSON.parse(data);
    } catch (parseErr) {
      console.error("Erreur de parsing JSON:", parseErr);

      return;
    }

    if (jsonData[joueur]) {
      jsonData[joueur].x = x;
      jsonData[joueur].y = y;
      jsonData[joueur].status = status;
    } else {
      console.warn(`Le joueur "${joueur}" n'existe pas dans le fichier.`);

      return;
    }

    writeData(jsonData);
  });
}

function updateText(joueur, text) {
  fs.readFile("./data.json", "utf8", (err, data) => {
    if (err) {
      console.error("Erreur de lecture:", err);
      return;
    }

    let jsonData;

    try {
      jsonData = JSON.parse(data);
    } catch (parseErr) {
      console.error("Erreur de parsing JSON:", parseErr);
      return;
    }

    if (jsonData[joueur]) {
      jsonData[joueur].text = text;
    } else {
      console.warn(`Le joueur "${joueur}" n'existe pas dans le fichier.`);
      return;
    }

    writeData(jsonData);
  });
}

function broadcastJson() {
  fs.readFile("./data.json", "utf8", (err, data) => {
    if (err) return;
    try {
      const jsonData = JSON.parse(data);
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(jsonData));
        }
      });
    } catch {}
  });
}

wss.on("connection", (ws) => {
  ws.isAlive = true;

  ws.on("pong", () => {
    ws.isAlive = true;
  });

  // ton code existant ici :
  fs.readFile("./data.json", "utf8", (err, data) => {
    if (!err) {
      try {
        ws.send(data);
      } catch {}
    }

    ws.on("close", (code, reason) => {
      console.log("deconnexion:", reason.toString());
      resetPlayerStatusByName(reason.toString(), 0, 0, "off");
    });
  });
});

function resetPlayerStatusByName(id) {
  fs.readFile("./data.json", "utf8", (err, data) => {
    if (err) {
      console.error("Erreur de lecture:", err);
      return;
    }

    let jsonData;
    try {
      jsonData = JSON.parse(data);
    } catch (parseErr) {
      console.error("Erreur de parsing JSON:", parseErr);
      return;
    }

    function trouverJoueurParStatus(statusRecherche) {
      for (const [nomJoueur, info] of Object.entries(jsonData)) {
        if (info.status === statusRecherche) {
          return { nom: nomJoueur, ...info };
        }
      }
      return null; // Aucun joueur trouvé avec ce status
    }

    const joueursInfos = trouverJoueurParStatus(id);
    if (joueursInfos) {
      jsonData[joueursInfos.nom].status = "off";
      jsonData[joueursInfos.nom].x = 0;
      jsonData[joueursInfos.nom].y = 0;
    }

    writeData(jsonData);
  });
}

fs.watch("./data.json", (eventType) => {
  if (eventType === "change") broadcastJson();
});

// 🚀 Route HTTP pour changer le contenu selon x
app.get("/api/set-x", (req, res) => {
  const x = parseFloat(req.query.x);
  const y = parseFloat(req.query.y);
  const joueur = req.query.joueur;
  const status = req.query.status;
  if (isNaN(x)) {
    return res.status(400).send({ error: 'Paramètre "x" invalide' });
  }
  if (isNaN(y)) {
    return res.status(400).send({ error: 'Paramètre "y" invalide' });
  }

  updateContentByX(joueur, x, y, status);
  res.send({ success: true, x, y });
});

app.get("/api/isplayerexist", (req, res) => {
  const name = req.query.name;

  fs.readFile("./data.json", "utf8", (err, data) => {
    if (err) {
      console.error("Erreur de lecture:", err);
      return res.status(500).json({ error: "Erreur de lecture du fichier" });
    }

    let jsonData;
    try {
      jsonData = JSON.parse(data);
    } catch (parseErr) {
      console.error("Erreur de parsing JSON:", parseErr);
      return res.status(500).json({ error: "Erreur de parsing JSON" });
    }

    // Recherche d’un joueur dont le status est égal à name
    const matchingKey = Object.keys(jsonData).find(
      (key) => jsonData[key].status === name
    );

    if (matchingKey) {
      // Joueur trouvé
      res.json({
        exists: true,
        joueur: matchingKey,
        data: jsonData[matchingKey],
      });
    } else {
      // Aucun joueur avec ce status
      res.json({ exists: false });
    }
  });
});

app.get("/api/createPlayer", (req, res) => {
  const name = req.query.name;

  if (!name) {
    return res.status(400).json({ error: "Le nom du joueur est requis." });
  }

  fs.readFile("./data.json", "utf8", (err, data) => {
    if (err) {
      console.error("Erreur de lecture:", err);
      return res.status(500).json({ error: "Erreur de lecture du fichier" });
    }

    let jsonData;
    try {
      jsonData = JSON.parse(data);
    } catch (parseErr) {
      console.error("Erreur de parsing JSON:", parseErr);
      return res.status(500).json({ error: "Erreur de parsing JSON" });
    }

    // Cherche un joueur disponible (status = "off")
    const availableKey = Object.keys(jsonData).find(
      (key) => jsonData[key].status === "off"
    );

    if (!availableKey) {
      return res.json({ success: false, playerSlot: null });
    }

    // Attribue les infos au joueur libre
    jsonData[availableKey].status = name;
    jsonData[availableKey].x = 0;
    jsonData[availableKey].y = 0;
    jsonData[availableKey].text = "";

    // Sauvegarde
    writeData(jsonData)
      .then(() => {
        res.json({ success: true, playerSlot: availableKey });
      })
      .catch((writeErr) => {
        console.error("Erreur d'écriture:", writeErr);
        res.status(500).json({ error: "Erreur d'écriture" });
      });
  });
});

app.get("/api/settext", (req, res) => {
  const joueur = req.query.joueur;
  const text = req.query.text;

  if (text == "/reset") {
    resetPlayers().then(() => res.send({ success: true }));
    return;
  }

  updateText(joueur, text);

  console.log(text)

  setTimeout(() => {
    fs.readFile("./data.json", "utf8", (err, data) => {
      if (err) {
        console.error("Erreur de lecture:", err);
        return res.status(500).json({ error: "Erreur de lecture du fichier" });
      }

      let jsonData;
      try {
        jsonData = JSON.parse(data);
      } catch (parseErr) {
        console.error("Erreur de parsing JSON:", parseErr);
        return res.status(500).json({ error: "Erreur de parsing JSON" });
      }
      console.log(jsonData[joueur]);
      console.log(text)
      if (jsonData[joueur].text == text) {
        console.log("timeout");
        updateText(joueur, "");
      }
    });
  }, "5000");
});

function resetPlayers() {
  writeData({
    joueur1: {
      status: "off",
      color: "red",
      x: 0,
      y: 0,
      text: "",
    },
    joueur2: {
      status: "off",
      color: "blue",
      x: 0,
      y: 0,
      text: "",
    },
    joueur3: {
      status: "off",
      color: "yellow",
      x: 0,
      y: 0,
      text: "",
    },
    joueur4: {
      status: "off",
      color: "green",
      x: 0,
      y: 0,
      text: "",
    },
    joueur5: {
      status: "off",
      color: "white",
      x: 0,
      y: 0,
      text: "",
    },
    joueur6: {
      status: "off",
      color: "orange",
      x: 0,
      y: 0,
      text: "",
    },
    joueur7: {
      status: "off",
      color: "violet",
      x: 0,
      y: 0,
      text: "",
    },
    joueur8: {
      status: "off",
      color: "grey",
      x: 0,
      y: 0,
      text: "",
    },
  });
}

app.listen(port, () => {
  console.log(`Serveur HTTP sur http://localhost:${port}`);
});
