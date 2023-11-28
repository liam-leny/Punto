require('dotenv').config(); // Charge les variables d'environnement depuis le fichier .env
const mysql = require('mysql2');

const dbMySQL = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

dbMySQL.connect((err) => {
  if (err) {
    console.error('Erreur de connexion à la base de données MySQL :', err);
    return;
  }
  console.log('Connecté à la base de données MySQL');
});

module.exports = dbMySQL;
