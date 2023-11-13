CREATE DATABASE punto;
USE punto;

CREATE TABLE Partie (
    id INT AUTO_INCREMENT PRIMARY KEY,
    date_creation DATE,
    nombre_de_manches INT,
    duree TIME
);

CREATE TABLE Joueur (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pseudo VARCHAR(255),
    partie_id INT,
    FOREIGN KEY (partie_id) REFERENCES Partie(id)
);

CREATE TABLE Carte (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_de_points INT,
    couleur VARCHAR(255),
    position_x INT,
    position_y INT,
    joueur_id INT,
    FOREIGN KEY (joueur_id) REFERENCES Joueur(id)
);
