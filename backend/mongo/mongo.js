const mongoose = require('mongoose');

const mongoURL = `mongodb://localhost:27017/punto`;

const mongoOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

// Connexion à MongoDB
mongoose.connect(mongoURL, mongoOptions);

const dbMongo = mongoose.connection;

dbMongo.on('error', (err) => {
  console.error('Erreur de connexion à la base de données MongoDB :', err);
});

dbMongo.once('open', () => {
  console.log('Connecté à la base de données MongoDB');
});

module.exports = dbMongo;
