# Punto

Premier projet de la ressource R5.10 - Nouveaux paradigmes de base de données.

BUT3 (Réalisation d'applications : conception, développement, validation)


## Description

Le projet vise à créer une application mettant en œuvre le jeu de société Punto. L'objectif est de développer une application complète qui intègre la mécanique du jeu, le stockage des données dans quatre types de bases de données différentes, ainsi q'un outil de gestion des données.

Les quatre bases de données utilisées sont MySQL, SQLite, MongoDB et Neo4j.
L'outil de gestion de données permet de sélectionner une des quatre bases puis de : 
- supprimer toutes les données
- exporter les données (non disponible pour Neo4j)
- insérer des données factices (non disponible pour MongoDB et Neo4j)

## Règles du jeu

Pour télécharger les règles officielles du Punto, vous pouvez cliquer sur ce [lien]( https://www.atalia-jeux.com/index.php?controller=attachment&id_attachment=182 "Règles du jeu Punto").

Le jeu est disponible de 2 à 4 joueurs. 


### Règles du jeu non implémentées
- Le premier joueur de la partie est sélectionné aléatoirement, ce n'est pas forcément le plus jeune.
- La couleur neutre n'est pas prise en compte dans la version 3 joueurs.
- Le plateau de jeu est fixe et est composé de 6 lignes de 6 cases. Les joueurs ne peuvent donc pas définir eux-mêmes leur propre carré de jeu de 6×6 cartes.
- Le gagnant n'enlève pas la carte avec le plus de points dans sa série. Il peut donc de nouveau l'utiliser à la prochaine manche.
- La fonction de jeu par équipe pour 4 joueurs.

## Installation

Pour installer toutes les dépendances nécessaires : 
```npm i```

Pour lancer le serveur (Express et les quatre bases de données en local) :
- Ajoute un fichier .env à la racine du projet :
    ```
    DB_HOST=<mysql_url>
    DB_USER=<mysql_host>
    DB_PASSWORD=<mysql_password>
    DB_DATABASE=<mysql_database>
    ```
- Crée une base de données nommée "punto" sur votre serveur MongoDB
- Crée une base de données nommée "punto" avec le mot de passe "puntopunto" sur votre serveur Neo4j
- Lance le serveur (express et les quatre bases de données) :
    ```node backend/server.js```

Pour lancer le jeu :
```npm run start```

Vous arriverez sur la page d'accueil du jeu. Pour pouvoir accéder à l'outil de gestion de données, vous ajoutez "/admin" à l'url.


## Utilisation de WebSockets et restriction d'accès

Le jeu utilise des WebSockets pour assurer une communication en temps réel entre les joueurs. Chaque joueur doit jouer sur un onglet différent, permettant ainsi une expérience de jeu collaborative et interactive.

Il est à noter qu'un joueur ne peut rejoindre la partie que d'un hôte ayant sélectionné la même base de données.


## Améliorations futures
Voici quelques pistes d'amélirations du projet : 
- Déploiement du jeu : mettre en place un déploiement complet de l'application, permettant un accès en ligne facile et une expérience utilisateur sans heurts.
- Rendu des cartes authentique : améliorer le rendu visuel des cartes pour les rendre plus fidèles à celles du jeu officiel, offrant ainsi une esthétique plus immersive et plaisante.
- Équilibre de la partie à 3 joueurs : introduire la notion de couleur neutre pour garantir une équité dans les parties à 3 joueurs. Ceci permettra d'éviter des situations inattendues et d'assurer une expérience de jeu équilibrée.


## Auteur 
Liam Le Ny
