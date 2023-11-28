-- Utilise la base de données
ATTACH DATABASE 'punto' AS punto;

-- Désactive les contraintes de clé étrangère
PRAGMA foreign_keys = off;

CREATE TABLE IF NOT EXISTS punto.Game (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    creation_date DATETIME NOT NULL,
    round_number INTEGER NOT NULL,
    winner INTEGER,
    end_date DATETIME,
    FOREIGN KEY (winner) REFERENCES Player(id)
);

CREATE TABLE IF NOT EXISTS punto.Round (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    creation_date DATETIME NOT NULL,
    current_round_number INTEGER NOT NULL,
    game_id INTEGER NOT NULL,
    winner INTEGER,
    end_date DATETIME,
    FOREIGN KEY (winner) REFERENCES Player(id),
    FOREIGN KEY (game_id) REFERENCES Game(id)
);

CREATE TABLE IF NOT EXISTS punto.Player (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pseudo VARCHAR(255),
    game_id INTEGER,
    FOREIGN KEY (game_id) REFERENCES Game(id)
);

CREATE TABLE IF NOT EXISTS punto.CardMove (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    moment DATETIME NOT NULL,
    point_number INTEGER CHECK (point_number BETWEEN 0 AND 9),
    color VARCHAR(255) CHECK (color IN ('green', 'yellow', 'red', 'blue')),
    coord_x INTEGER CHECK (coord_x BETWEEN 0 AND 5),
    coord_y INTEGER CHECK (coord_y BETWEEN 0 AND 5),
    round_id INTEGER NOT NULL,
    player_id INTEGER NOT NULL,
    FOREIGN KEY (player_id) REFERENCES Player(id),
    FOREIGN KEY (round_id) REFERENCES Round(id)
);

-- Réactive les contraintes de clé étrangère
PRAGMA foreign_keys = on;
