const express = require("express");
const cors = require("cors"); // ✅ importer cors
const fs = require("fs");
const WebSocket = require("ws");

const app = express();
const port = 3000;

app.use(cors()); // ✅ autorise toutes les origines (par défaut)

// WebSocket
const wss = new WebSocket.Server({ port: 8080 });

// Fonction pour lire/écrire le JSON
let isWriting = false;

function updateContentByX(joueur, x, y, status) {
  if (isWriting) {
    return;
  }

  isWriting = true;

  fs.readFile("./data.json", "utf8", (err, data) => {
    if (err) {
      console.error("Erreur de lecture:", err);
      isWriting = false;
      return;
    }

    let jsonData;
    try {
      jsonData = JSON.parse(data);
    } catch (parseErr) {
      console.error("Erreur de parsing JSON:", parseErr);
      isWriting = false;
      return;
    }

    if (jsonData[joueur]) {
      jsonData[joueur].x = x;
      jsonData[joueur].y = y;
      jsonData[joueur].status = status;
    } else {
      console.warn(`Le joueur "${joueur}" n'existe pas dans le fichier.`);
      isWriting = false;
      return;
    }

    fs.writeFile(
      "./data.json",
      JSON.stringify(jsonData, null, 2),
      "utf8",
      (writeErr) => {
        if (writeErr) {
          console.error("Erreur d'écriture:", writeErr);
        }
        isWriting = false;
      }
    );
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
  fs.readFile("./data.json", "utf8", (err, data) => {
    if (!err) {
      try {
        ws.send(data);
      } catch {}
    }
    ws.on("close", (code, reason) => {
      console.log("deconnexion:", reason.toString());
      deconnect(reason.toString(), 0, 0, "off");
    });
  });
});

function deconnect(id, x, y, status) {
  isWriting = true;

  fs.readFile("./data.json", "utf8", (err, data) => {
    if (err) {
      console.error("Erreur de lecture:", err);
      isWriting = false;
      return;
    }

    let jsonData;
    try {
      jsonData = JSON.parse(data);
    } catch (parseErr) {
      console.error("Erreur de parsing JSON:", parseErr);
      isWriting = false;
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
    console.log(joueursInfos);
    if (joueursInfos) {
      jsonData[joueursInfos.nom].status = "off";
      jsonData[joueursInfos.nom].x = 0;
      jsonData[joueursInfos.nom].y = 0;
    }

    console.log(jsonData);

    fs.writeFile(
      "./data.json",
      JSON.stringify(jsonData, null, 2),
      "utf8",
      (writeErr) => {
        if (writeErr) {
          console.error("Erreur d'écriture:", writeErr);
        }
        isWriting = false;
      }
    );
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

app.listen(port, () => {
  console.log(`Serveur HTTP sur http://localhost:${port}`);
});
