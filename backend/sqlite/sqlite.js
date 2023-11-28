const sqlite3 = require('sqlite3');
const path = require('path');

// Chemin vers le fichier SQLite
const dbPath = path.resolve(__dirname, 'punto.db');

const dbSQLite = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Erreur de connexion à la base de données SQLite :', err);
        return;
    }
    console.log('Connecté à la base de données SQLite');
});


function query(sql, params, callback) {
    dbSQLite.run(sql, params, function (err) {
        if (err) {
            console.error('Erreur lors de l\'exécution de la requête SQLite :', err);
            callback(err, null);
            return;
        }
        callback(null, { insertId: this.lastID });
    });
}

module.exports = {query};
