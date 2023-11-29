const express = require('express');
const cors = require('cors');
const http = require('http');
const { initializeSocket } = require('./socket');
const dbMySQL = require('./mysql/mysql');
const { query } = require('./sqlite/sqlite');
const { dbMongo } = require('./mongo/mongo');
const { Game } = require('./mongo/script_creation');


const app = express();
const server = http.createServer(app);
const io = initializeSocket(server);

let db;

app.use(express.json());
app.use(cors());

app.post('/api/database-choice', (req, res) => {
  console.log(req.body)
  const database = req.body.database;

  if (database === 'MySQL') {
    db = dbMySQL;
  } else if (database === 'SQLite') {
    db = { query };
  } else if (database === 'MongoDB') {
    db = dbMongo
  }
  res.json({ success: true });

});




// Route pour créer une nouvelle partie
app.post('/api/game', (req, res) => {
  const creation_date = new Date();
  const round_number = req.body.round_number;

  // Insérer une nouvelle partie
  db.query('INSERT INTO Game (creation_date, round_number) VALUES (?, ?)', [creation_date, round_number], (err, result) => {
    if (err) {
      console.error('Erreur lors de la création de la partie :', err);
      res.status(500).json({ error: 'Erreur lors de la création de la partie' });
      return;
    }

    const game_id = result.insertId;

    // Insérer le joueur créateur dans la table Player avec l'id de la partie
    db.query('INSERT INTO Player (pseudo, game_id) VALUES (?, ?)', [req.body.pseudo, game_id], (err, result) => {
      if (err) {
        console.error('Erreur lors de l\'inscription du joueur à la partie :', err);
        res.status(500).json({ error: 'Erreur lors de l\'inscription du joueur à la partie' });
        return;
      }

      const player_id = result.insertId;

      res.json({ game_id, player_id });
    });
  });
});

// Route pour rejoindre une partie
app.post('/api/game/:id/join', (req, res) => {
  const game_id = Number(req.params.id);
  const pseudo = req.body.pseudo;

  // Insérer le joueur dans la table Player avec l'id de la partie
  db.query('INSERT INTO Player (pseudo, game_id) VALUES (?, ?)', [pseudo, game_id], (err, result) => {
    if (err) {
      console.error('Erreur lors de l\'inscription du joueur à la partie :', err);
      res.status(500).json({ error: 'Erreur lors de l\'inscription du joueur à la partie' });
      return;
    }

    const player_id = result.insertId;

    res.json({ player_id });
  });
});

// Route pour mettre à jour une partie
app.patch('/api/game/:id', (req, res) => {
  const id = req.params.id;
  const winner = req.body.winner;
  const end_date = new Date();

  // Mettre à jour la manche avec le vainqueur et le moment de fin
  db.query('UPDATE Game SET winner = ?, end_date = ? WHERE id = ?', [winner, end_date, id], (err, result) => {
    if (err) {
      console.error('Erreur lors de la mise à jour de la partie :', err);
      res.status(500).json({ error: 'Erreur lors de la mise à jour de la partie' });
      return;
    }
    res.json({ success: true });
  });
});

// Route pour créer une nouvelle manche
app.post('/api/round', (req, res) => {
  const creation_date = new Date();
  const current_round_number = req.body.current_round_number;
  const game_id = req.body.game_id;

  // Insérer une nouvelle manche
  db.query('INSERT INTO Round (creation_date, current_round_number, game_id) VALUES (?, ?, ?)', [creation_date, current_round_number, game_id], (err, result) => {
    if (err) {
      console.error('Erreur lors de la création de la manche :', err);
      res.status(500).json({ error: 'Erreur lors de la création de la manche' });
      return;
    }

    const round_id = result.insertId;
    res.json({ round_id });

  });
});

// Route pour mettre à jour une manche
app.patch('/api/round/:id', (req, res) => {
  const id = req.params.id;
  const winner = req.body.winner;
  const end_date = new Date();

  // Mettre à jour la manche avec le vainqueur et le moment de fin
  db.query('UPDATE Round SET winner = ?, end_date = ? WHERE id = ?', [winner, end_date, id], (err, result) => {
    if (err) {
      console.error('Erreur lors de la mise à jour de la manche :', err);
      res.status(500).json({ error: 'Erreur lors de la mise à jour de la manche' });
      return;
    }

    res.json({ success: true });
  });
});


// Route pour créer une nouveau coup
app.post('/api/cardmove', (req, res) => {
  const moment = new Date();
  const point_number = req.body.point_number;
  const color = req.body.color;
  const coord_x = req.body.coord_x;
  const coord_y = req.body.coord_y;
  const round_id = req.body.round_id;
  const player_id = req.body.player_id;
  // Insérer une nouvelle manche
  db.query('INSERT INTO CardMove (moment, point_number, color, coord_x, coord_y, round_id, player_id) VALUES (?, ?, ?, ?, ?, ?, ?)', [moment, point_number, color, coord_x, coord_y, round_id, player_id], (err, result) => {
    if (err) {
      console.error('Erreur lors de la création du coup :', err);
      res.status(500).json({ error: 'Erreur lors de la création du coup' });
      return;
    }
    res.json({ success: true });
  });
});


// Route pour créer une nouvelle partie
app.post('/api/mongo/game', async (req, res) => {
  try {
    const creation_date = new Date()
    const round_number = req.body.round_number;

    // Créer un nouvel objet Game avec les données reçues
    const newGame = new Game({
      creation_date,
      round_number,
    });

    // Enregistrer la nouvelle partie dans la base de données
    const savedGame = await newGame.save();
    console.log(savedGame)
    res.json(savedGame._id); // Renvoyer la partie créée en réponse
  } catch (error) {
    console.error('Erreur lors de la création de la partie :', error);
    res.status(500).json({ error: 'Erreur lors de la création de la partie' });
  }
});

// Route pour insérer des mouvement de carte à une partie
app.patch('/api/mongo/cardmove/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const moment = new Date()
    const pseudo = req.body.pseudo;
    const point_number = req.body.point_number;
    const color = req.body.color;
    const coord_x = req.body.coord_x;
    const coord_y = req.body.coord_y;

    // Créer un nouvel objet CardMove avec les données reçues
    const newCardMove = {
      moment,
      pseudo,
      point_number: point_number,
      color,
      coord_x: coord_x,
      coord_y: coord_y,
    };

    const game = await Game.findById(id);
    game.card_moves.push(newCardMove);
    const updatedGame = await game.save();

    res.json(updatedGame);
  } catch (error) {
    console.error('Erreur lors de l\'insertion du mouvement de carte :', error);
    res.status(500).json({ error: 'Erreur lors de l\'insertion du mouvement de carte' });
  }
});

// Démarrer le serveur Express
const port = 5000;
server.listen(port, () => {
  console.log(`Serveur Express écoutant sur le port ${port}`);
});