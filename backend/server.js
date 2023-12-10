require("dotenv").config(); // Charge les variables d'environnement depuis le fichier .env
const express = require("express");
const cors = require("cors");
const http = require("http");
const mongoose = require("mongoose");
const fs = require("fs");
const mysqldump = require("mysqldump");
const sqlite3 = require("better-sqlite3");

const { initializeSocket } = require("./socket");
const dbMySQL = require("./mysql/mysql");
const { query } = require("./sqlite/sqlite");
const { dbMongo } = require("./mongo/mongo");
const neo4j = require("./neo4j/neo4j");
const { Game } = require("./mongo/script_creation");
const GenerateFakeData = require("./generateData");
const generateFakeMongoData = require("./generateMongoData");

const app = express();
const server = http.createServer(app);
const io = initializeSocket(server);

let db;

app.use(express.json());
app.use(cors());

app.post("/api/database-choice", (req, res) => {
  console.log(req.body);
  const database = req.body.database;

  if (database === "MySQL") {
    db = dbMySQL;
  } else if (database === "SQLite") {
    db = { query };
  } else if (database === "MongoDB") {
    db = dbMongo;
  } else if (database === "Neo4j") {
    db = neo4j;
  }
  res.json({ success: true });
});

// Route pour créer une nouvelle partie
app.post("/api/game", (req, res) => {
  const creation_date = new Date();
  const round_number = req.body.round_number;

  // Insérer une nouvelle partie
  db.query(
    "INSERT INTO Game (creation_date, round_number) VALUES (?, ?)",
    [creation_date, round_number],
    (err, result) => {
      if (err) {
        console.error("Erreur lors de la création de la partie :", err);
        res
          .status(500)
          .json({ error: "Erreur lors de la création de la partie" });
        return;
      }

      const game_id = result.insertId;

      // Insérer le joueur créateur dans la table Player avec l'id de la partie
      db.query(
        "INSERT INTO Player (pseudo, game_id) VALUES (?, ?)",
        [req.body.pseudo, game_id],
        (err, result) => {
          if (err) {
            console.error(
              "Erreur lors de l'inscription du joueur à la partie :",
              err
            );
            res.status(500).json({
              error: "Erreur lors de l'inscription du joueur à la partie",
            });
            return;
          }

          const player_id = result.insertId;

          res.json({ game_id, player_id });
        }
      );
    }
  );
});

// Route pour rejoindre une partie
app.post("/api/game/:id/join", (req, res) => {
  const game_id = Number(req.params.id);
  const pseudo = req.body.pseudo;

  // Insérer le joueur dans la table Player avec l'id de la partie
  db.query(
    "INSERT INTO Player (pseudo, game_id) VALUES (?, ?)",
    [pseudo, game_id],
    (err, result) => {
      if (err) {
        console.error(
          "Erreur lors de l'inscription du joueur à la partie :",
          err
        );
        res.status(500).json({
          error: "Erreur lors de l'inscription du joueur à la partie",
        });
        return;
      }

      const player_id = result.insertId;

      res.json({ player_id });
    }
  );
});

// Route pour mettre à jour une partie
app.patch("/api/game/:id", (req, res) => {
  const id = req.params.id;
  const winner = req.body.winner;
  const end_date = new Date();

  // Mettre à jour la manche avec le vainqueur et le moment de fin
  db.query(
    "UPDATE Game SET winner = ?, end_date = ? WHERE id = ?",
    [winner, end_date, id],
    (err, result) => {
      if (err) {
        console.error("Erreur lors de la mise à jour de la partie :", err);
        res
          .status(500)
          .json({ error: "Erreur lors de la mise à jour de la partie" });
        return;
      }
      res.json({ success: true });
    }
  );
});

// Route pour créer une nouvelle manche
app.post("/api/round", (req, res) => {
  const creation_date = new Date();
  const current_round_number = req.body.current_round_number;
  const game_id = req.body.game_id;

  // Insérer une nouvelle manche
  db.query(
    "INSERT INTO Round (creation_date, current_round_number, game_id) VALUES (?, ?, ?)",
    [creation_date, current_round_number, game_id],
    (err, result) => {
      if (err) {
        console.error("Erreur lors de la création de la manche :", err);
        res
          .status(500)
          .json({ error: "Erreur lors de la création de la manche" });
        return;
      }

      const round_id = result.insertId;
      res.json({ round_id });
    }
  );
});

// Route pour mettre à jour une manche
app.patch("/api/round/:id", (req, res) => {
  const id = req.params.id;
  const winner = req.body.winner;
  const end_date = new Date();

  // Mettre à jour la manche avec le vainqueur et le moment de fin
  db.query(
    "UPDATE Round SET winner = ?, end_date = ? WHERE id = ?",
    [winner, end_date, id],
    (err, result) => {
      if (err) {
        console.error("Erreur lors de la mise à jour de la manche :", err);
        res
          .status(500)
          .json({ error: "Erreur lors de la mise à jour de la manche" });
        return;
      }

      res.json({ success: true });
    }
  );
});

// Route pour créer une nouveau coup
app.post("/api/cardmove", (req, res) => {
  const moment = new Date();
  const point_number = req.body.point_number;
  const color = req.body.color;
  const coord_x = req.body.coord_x;
  const coord_y = req.body.coord_y;
  const round_id = req.body.round_id;
  const player_id = req.body.player_id;
  // Insérer une nouvelle manche
  db.query(
    "INSERT INTO CardMove (moment, point_number, color, coord_x, coord_y, round_id, player_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [moment, point_number, color, coord_x, coord_y, round_id, player_id],
    (err, result) => {
      if (err) {
        console.error("Erreur lors de la création du coup :", err);
        res.status(500).json({ error: "Erreur lors de la création du coup" });
        return;
      }
      res.json({ success: true });
    }
  );
});

// Route pour créer une nouvelle partie
app.post("/api/mongo/game", async (req, res) => {
  try {
    const creation_date = new Date();
    const round_number = req.body.round_number;

    // Créer un nouvel objet Game avec les données reçues
    const newGame = new Game({
      creation_date,
      round_number,
    });

    // Enregistrer la nouvelle partie dans la base de données
    const savedGame = await newGame.save();
    res.json(savedGame._id);
  } catch (error) {
    console.error("Erreur lors de la création de la partie :", error);
    res.status(500).json({ error: "Erreur lors de la création de la partie" });
  }
});

// Route pour insérer des mouvement de carte à une partie
app.post("/api/mongo/cardmove/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const moment = new Date();
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
    console.error("Erreur lors de l'insertion du mouvement de carte :", error);
    res
      .status(500)
      .json({ error: "Erreur lors de l'insertion du mouvement de carte" });
  }
});

// Route pour créer une nouvelle partie
app.post("/api/neo4j/game", async (req, res) => {
  const creation_date = new Date().toISOString();
  const pseudo = req.body.pseudo;
  const round_number = req.body.round_number;

  try {
    const result = await db.query(
      "CREATE (g:Game {creation_date: $creation_date, round_number: $round_number})-[:HAS_ROUND]->(r:Round) RETURN id(g) AS game_id, id(r) AS round_id",
      { creation_date, round_number }
    );
    const game_id = result[0].game_id.low;
    const round_id = result[0].round_id.low;

    const resultPlayer = await db.query(
      "MATCH (g:Game) WHERE id(g) = $game_id CREATE (p:Player {pseudo: $pseudo})-[:PARTICIPATES_IN]->(g) RETURN id(p) AS player_id",
      { game_id, pseudo }
    );

    const player_id = resultPlayer[0].player_id.low;

    res.json({ game_id, round_id, player_id });
  } catch (error) {
    console.error("Erreur lors de la création de la partie :", error);
    res.status(500).json({ error: "Erreur lors de la création de la partie" });
  }
});

// Route pour rejoindre une partie
app.post("/api/neo4j/game/:id/join", async (req, res) => {
  const game_id = Number(req.params.id);
  const pseudo = req.body.pseudo;

  try {
    const result = await db.query(
      "MATCH (g:Game) WHERE id(g) = $game_id CREATE (p:Player {pseudo: $pseudo})-[:PARTICIPATES_IN]->(g) RETURN id(p) AS player_id",
      { game_id, pseudo }
    );

    console.log(result);
    const player_id = result[0].player_id.low;
    res.json({ player_id });
  } catch (error) {
    console.error(
      "Erreur lors de l'inscription du joueur à la partie :",
      error
    );
    res
      .status(500)
      .json({ error: "Erreur lors de l'inscription du joueur à la partie" });
  }
});

// Route pour mettre à jour une partie
app.patch("/api/neo4j/game/:id", async (req, res) => {
  const game_id = Number(req.params.id);
  const winner = req.body.winner;
  const end_date = new Date().toISOString();

  try {
    await db.query(
      "MATCH (g:Game) WHERE id(g) = $game_id SET g.end_date = $end_date",
      { game_id, end_date }
    );

    await db.query(
      "MATCH (g:Game), (p:Player) WHERE id(g) = $game_id AND id(p) = $winner CREATE (p)-[:WINNER_OF]->(g)",
      { game_id, winner }
    );

    res.json({ success: true });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la partie :", error);
    res
      .status(500)
      .json({ error: "Erreur lors de la mise à jour de la partie" });
  }
});

// Route pour créer une nouvelle manche
app.post("/api/neo4j/round", async (req, res) => {
  const creation_date = new Date().toISOString();
  const current_round_number = req.body.current_round_number;
  const game_id = Number(req.body.game_id);

  try {
    const result = await db.query(
      "MATCH (g:Game) WHERE id(g) = $game_id CREATE (r:Round {creation_date: $creation_date, current_round_number: $current_round_number})-[:BELONGS_TO]->(g) RETURN id(r) AS round_id",
      { creation_date, current_round_number, game_id }
    );

    const round_id = result[0].round_id.low;
    res.json({ round_id });
  } catch (error) {
    console.error("Erreur lors de la création de la manche :", error);
    res.status(500).json({ error: "Erreur lors de la création de la manche" });
  }
});

// Route pour mettre à jour une manche
app.patch("/api/neo4j/round/:id", async (req, res) => {
  const round_id = Number(req.params.id);
  const winner = req.body.winner;
  const end_date = new Date().toISOString();

  try {
    await db.query(
      "MATCH (r:Round) WHERE id(r) = $round_id SET r.end_date = $end_date",
      { round_id, end_date }
    );

    await db.query(
      "MATCH (r:Round), (p:Player) WHERE id(r) = $round_id AND id(p) = $winner CREATE (p)-[:WINNER_OF]->(r)",
      { round_id, winner }
    );

    res.json({ success: true });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la manche :", error);
    res
      .status(500)
      .json({ error: "Erreur lors de la mise à jour de la manche" });
  }
});

// Route pour créer une nouveau coup
app.post("/api/neo4j/cardmove/", async (req, res) => {
  console.log(req.body);
  const moment = new Date().toISOString();
  const point_number = req.body.point_number;
  const color = req.body.color;
  const coord_x = req.body.coord_x;
  const coord_y = req.body.coord_y;
  const round_id = req.body.round_id;
  const player_id = req.body.player_id;

  try {
    await db.query(
      "MATCH (r:Round) WHERE id(r) = $round_id MATCH (p:Player) WHERE id(p) = $player_id CREATE (cm:CardMove {moment: $moment, point_number: $point_number, color: $color, coord_x: $coord_x, coord_y: $coord_y})-[:MADE_MOVE]->(p)-[:MOVE_IN]->(r)",
      { moment, point_number, color, coord_x, coord_y, round_id, player_id }
    );

    res.json({ success: true });
  } catch (error) {
    console.error("Erreur lors de la création du coup :", error);
    res.status(500).json({ error: "Erreur lors de la création du coup" });
  }
});

//  Route pour vider toutes les données de la base (MySQL/SQLite)
app.delete("/api/reset-database", (req, res) => {
  // Désactiver temporairement les contraintes de clés étrangères
  db.query("SET foreign_key_checks = 0", (err) => {
    if (err) {
      console.error(
        "Erreur lors de la désactivation des contraintes de clés étrangères :",
        err
      );
      res.status(500).json({
        error:
          "Erreur lors de la désactivation des contraintes de clés étrangères",
      });
      return;
    }
  });

  const tables = ["Game", "Round", "Player", "CardMove"];

  // Supprimer toutes les données de chaque table
  tables.forEach((table) => {
    db.query(`DELETE FROM ${table}`, (err, result) => {
      if (err) {
        console.error(
          `Erreur lors de la suppression des données de la table ${table} :`,
          err
        );
        res.status(500).json({
          error: `Erreur lors de la suppression des données de la table ${table}`,
        });
        return;
      }
    });
  });

  res.json({ success: true, message: "Base de données vidée avec succès" });
});

// Route pour vider toutes les données de la base (MongoDB)
app.delete("/api/mongo/reset-database", async (req, res) => {
  try {
    // Supprimer tous les documents de la collection Game
    await Game.deleteMany();

    res.json({
      success: true,
      message: "Base de données MongoDB vidée avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de la suppression des données MongoDB :", error);
    res
      .status(500)
      .json({ error: "Erreur lors de la suppression des données MongoDB" });
  }
});

// Route pour vider toutes les données de la base (Neo4j)
app.delete("/api/neo4j/reset-database", async (req, res) => {

  try {
    await db.query(
      "MATCH (n) DETACH DELETE n",
    );

    res.json({
      success: true,
      message: "Base de données Neo4j vidée avec succès",
    });
  } catch (error) {
    console.error(
      "Erreur lors de la suppression des données Neo4j :",
      error
    );
    res
      .status(500)
      .json({ error: "Erreur lors de la suppression des données Neo4j" });
  }
});

// Route pour exporter les données depuis MySQL
app.get("/api/mysql/export", async (req, res) => {
  try {
    await mysqldump({
      connection: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
      },
      dumpToFile: "./backend//mysql/mysql-export.sql",
    });

    res.download(
      "./backend/mysql/mysql-export.sql",
      "mysql-export.sql",
      (err) => {
        if (err) {
          console.error("Erreur lors du téléchargement du fichier :", err);
          res
            .status(500)
            .json({ error: "Erreur lors du téléchargement du fichier" });
        }
      }
    );
  } catch (error) {
    console.error("Erreur lors de l'export MySQL :", error);
    res.status(500).json({ error: "Erreur lors de l'export MySQL" });
  }
});

// Route pour exporter les données depuis SQLite
app.get("/api/sqlite/export", (req, res) => {
  const fileName = "sqlite-export.sql";
  const db = new sqlite3("./backend/sqlite/punto.db");
  const data = db.serialize();
  const buffer = Buffer.from(data);
  fs.writeFileSync(fileName, buffer);

  res.download(fileName, (err) => {
    if (err) {
      console.error("Erreur lors du téléchargement du fichier :", err);
      res
        .status(500)
        .json({ error: "Erreur lors du téléchargement du fichier" });
    } else {
      fs.unlink(fileName, (err) => {
        if (err) {
          console.error("Erreur lors de la suppression du fichier :", err);
        }
      });
    }
  });
});

// Route pour exporter les données depuis MongoDB
app.get("/api/mongo/export", async (req, res) => {
  try {
    const data = await Game.find({}).lean();

    const jsonString = JSON.stringify(
      data,
      (key, value) => {
        if (value instanceof mongoose.Types.ObjectId) {
          return value.toString();
        }
        return value;
      },
      2
    );

    const fileName = "mongo-export.json";
    fs.writeFileSync(fileName, jsonString);
    res.setHeader("Content-Type", "application/json");

    res.download(fileName, (err) => {
      if (err) {
        console.error("Erreur lors du téléchargement du fichier :", err);
        res
          .status(500)
          .json({ error: "Erreur lors du téléchargement du fichier" });
      } else {
        fs.unlink(fileName, (err) => {
          if (err) {
            console.error("Erreur lors de la suppression du fichier :", err);
          }
        });
      }
    });
  } catch (error) {
    console.error("Erreur lors de l'export depuis MongoDB :", error);
    res.status(500).json({ error: "Erreur lors de l'export depuis MongoDB" });
  }
});

// Route pour générer des données aléatoires dans les bases (mysql/sqlite)
app.post("/api/fakedata", async (req, res) => {
  try {
    GenerateFakeData();
  } catch (error) {
    console.error(
      "Erreur lors de la génération de données aléatoires :",
      error
    );
    res
      .status(500)
      .json({ error: "Erreur lors de la génération de données aléatoires " });
  }
});

// Route pour générer des données aléatoires dans la base MongoDB
app.post("/api/mongo/fakedata", async (req, res) => {
  try {
    generateFakeMongoData();
  } catch (error) {
    console.error(
      "Erreur lors de la génération de données aléatoires :",
      error
    );
    res
      .status(500)
      .json({ error: "Erreur lors de la génération de données aléatoires " });
  }
});

// Démarrer le serveur Express
const port = 5000;
server.listen(port, () => {
  console.log(`Serveur Express écoutant sur le port ${port}`);
});
