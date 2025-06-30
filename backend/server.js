const express = require('express');
const cors = require('cors'); // ✅ importer cors
const fs = require('fs');
const WebSocket = require('ws');

const app = express();
const port = 3000;

app.use(cors()); // ✅ autorise toutes les origines (par défaut)


// WebSocket
const wss = new WebSocket.Server({ port: 8080 });
console.log('WebSocket running on ws://localhost:8080');

// Fonction pour lire/écrire le JSON
function updateContentByX(x, y) {
  const newData = { joueur1: {x:x, y:y} };
  fs.writeFile('./data.json', JSON.stringify(newData, null, 2), 'utf8', (err) => {
    if (err) {
      console.error('Erreur d\'écriture:', err);
    }
  });
}

function broadcastJson() {
  fs.readFile('./data.json', 'utf8', (err, data) => {
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

wss.on('connection', (ws) => {
  fs.readFile('./data.json', 'utf8', (err, data) => {
    if (!err) {
      try {
        ws.send(data);
      } catch {}
    }
  });
});

fs.watch('./data.json', (eventType) => {
  if (eventType === 'change') broadcastJson();
});

// 🚀 Route HTTP pour changer le contenu selon x
app.get('/set-x', (req, res) => {
  const x = parseFloat(req.query.x);
  const y = parseFloat(req.query.y);
  if (isNaN(x)) {
    return res.status(400).send({ error: 'Paramètre "x" invalide' });
  }
  if (isNaN(y)) {
    return res.status(400).send({ error: 'Paramètre "y" invalide' });
  }

  updateContentByX(x,y);
  res.send({ success: true, x, y });
});

app.listen(port, () => {
  console.log(`Serveur HTTP sur http://localhost:${port}`);
});
