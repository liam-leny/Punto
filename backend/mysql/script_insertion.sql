USE punto;

INSERT INTO Partie (date_creation, nombre_de_manches, duree)
VALUES
    ('2023-01-15', 3, '02:30:00'),
    ('2023-02-20', 4, '03:45:00'),
    ('2023-03-10', 2, '01:15:00');


INSERT INTO Joueur (pseudo, partie_id)
VALUES
    ('Joueur1', 1),
    ('Joueur2', 1),
    ('Joueur3', 2),
    ('Joueur4', 3);

INSERT INTO Carte (nombre_de_points, couleur, position_x, position_y, joueur_id)
VALUES
    (2, 'Rouge', 1, 1, 1),
    (5, 'Bleu', 2, 5, 2),
    (3, 'Vert', 3, 3, 3),
    (8, 'Jaune', 2, 1, 4),
    (9, 'Rouge', 2, 2, 1);
