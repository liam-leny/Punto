require('dotenv').config(); // Charge les variables d'environnement depuis le fichier .env

const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIO = require('socket.io');
const mysql = require('mysql2');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, { cors: {
  origin: "http://localhost:3000"
}});

app.use(express.json());
app.use(cors());

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

db.connect(err => {
  if (err) {
    console.error('Erreur de connexion à la base de données :', err);
    return;
  }
  console.log('Connecté à la base de données MySQL');
});

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
  console.log(req.body)
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

    const partie_id = result.insertId; // Récupérer l'id de la partie nouvellement créée

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
  const partie_id = req.params.id;
  const pseudo = req.body.pseudo;

  // Insérer le joueur dans la table Joueur avec l'id de la partie
  db.query('INSERT INTO Joueur (pseudo, partie_id) VALUES (?, ?)', [pseudo, partie_id], (err, result) => {
    if (err) {
      console.error('Erreur lors de l\'inscription du joueur à la partie :', err);
      res.status(500).json({ error: 'Erreur lors de l\'inscription du joueur à la partie' });
      return;
    }

    io.emit('nouveauJoueur', pseudo);
    res.json({ success: true });
  });
});

io.on('connection', (socket) => {
  console.log('Nouvelle connexion socket :', socket.id);
});




// Démarrer le serveur Express
const port = 5000;
server.listen(port, () => {
  console.log(`Serveur Express écoutant sur le port ${port}`);
});