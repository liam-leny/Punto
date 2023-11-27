CREATE DATABASE punto;
USE punto;

-- Désactive les contraintes de clé étrangère
SET foreign_key_checks = 0;

CREATE TABLE IF NOT EXISTS Game (
    id INT AUTO_INCREMENT PRIMARY KEY,
    creation_date DATETIME NOT NULL,
    round_number INT NOT NULL,
    winner INT,
    end_date DATETIME,
    FOREIGN KEY (winner) REFERENCES Player(id)
);

CREATE TABLE IF NOT EXISTS Round (
    id INT AUTO_INCREMENT PRIMARY KEY,
    creation_date DATETIME NOT NULL,
    current_round_number INT NOT NULL,
    game_id INT NOT NULL,
    winner INT,
    end_date DATETIME,
    FOREIGN KEY (winner) REFERENCES Player(id),
    FOREIGN KEY (game_id) REFERENCES Game(id)
);

CREATE TABLE IF NOT EXISTS Player (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pseudo VARCHAR(255),
    game_id INT,
    FOREIGN KEY (game_id) REFERENCES Game(id)
);

CREATE TABLE IF NOT EXISTS CardMove (
    id INT AUTO_INCREMENT PRIMARY KEY,
    moment DATETIME NOT NULL,
    point_number INT NOT NULL CHECK (point_number BETWEEN 0 AND 9),
    color VARCHAR(255) NOT NULL CHECK (color IN ('green', 'yellow', 'red', 'blue')),
    coord_x INT NOT NULL CHECK (coord_x BETWEEN 0 AND 5),
    coord_y INT NOT NULL CHECK (coord_y BETWEEN 0 AND 5),
    round_id INT NOT NULL,
    player_id INT NOT NULL,
    FOREIGN KEY (player_id) REFERENCES Player(id),
    FOREIGN KEY (round_id) REFERENCES Round(id)
);

-- Réactive les contraintes de clé étrangère
SET foreign_key_checks = 1;
