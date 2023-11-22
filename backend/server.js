const express = require('express');
const cors = require('cors');
const http = require('http');
const { initializeSocket } = require('./socket');
const db = require('./mysql/mysql');

const app = express();
const server = http.createServer(app);
const io = initializeSocket(server);

app.use(express.json());
app.use(cors());
app.use(express.json());
app.use(cors());

// Route pour récupérer toutes les parties
app.get('/api/partie', (req, res) => {
  db.query('SELECT * FROM Partie', (err, results) => {
    if (err) {
      console.error('Erreur lors de la récupération des données :', err);
      res.status(500).json({ error: 'Erreur lors de la récupération des données' });
      return;
    }
    res.json(results);
  });
});

// Route pour créer une nouvelle partie
app.post('/api/partie', (req, res) => {
  const date_creation = new Date();
  const nombre_de_manches = req.body.nombre_de_manches;
  const duree = null;

  // Insérer une nouvelle partie
  db.query('INSERT INTO Partie (date_creation, nombre_de_manches, duree) VALUES (?, ?, ?)', [date_creation, nombre_de_manches, duree], (err, result) => {
    if (err) {
      console.error('Erreur lors de la création de la partie :', err);
      res.status(500).json({ error: 'Erreur lors de la création de la partie' });
      return;
    }

    const partie_id = result.insertId;

    // Insérer le joueur créateur dans la table Joueur avec l'id de la partie
    db.query('INSERT INTO Joueur (pseudo, partie_id) VALUES (?, ?)', [req.body.pseudo, partie_id], (err, result) => {
      if (err) {
        console.error('Erreur lors de l\'inscription du joueur à la partie :', err);
        res.status(500).json({ error: 'Erreur lors de l\'inscription du joueur à la partie' });
        return;
      }

      res.json({ partie_id });
    });
  });
});

// Route pour rejoindre une partie
app.post('/api/partie/:id/join', (req, res) => {
  const partie_id = Number(req.params.id);
  const pseudo = req.body.pseudo;

  // Insérer le joueur dans la table Joueur avec l'id de la partie
  db.query('INSERT INTO Joueur (pseudo, partie_id) VALUES (?, ?)', [pseudo, partie_id], (err, result) => {
    if (err) {
      console.error('Erreur lors de l\'inscription du joueur à la partie :', err);
      res.status(500).json({ error: 'Erreur lors de l\'inscription du joueur à la partie' });
      return;
    }

    res.json({ success: true });
  });
});



// Démarrer le serveur Express
const port = 5000;
server.listen(port, () => {
  console.log(`Serveur Express écoutant sur le port ${port}`);
});