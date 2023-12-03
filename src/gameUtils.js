/**
 * Permet de générer un nombre entier aléatoire compris entre [min,max]
 * @param {*} min Borne inférieur
 * @param {*} max Borne supérieur
 * @returns un entier aléatoire inclus dans la plage spécifiée par les arguments min et max
 */
const getRandomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

/**
 * Permet de génerer un tableau composé de la couleur rouge, bleu, verte et jaune
 * @returns un tableau aléatoire de couleurs
 */
const mixColors = () => {
  const colors = ["red", "blue", "green", "yellow"];
  const randomColors = [];
  for (let i = 3; i > -1; i--) {
    const random = getRandomInt(0, i);
    const color = colors[random];
    colors.splice(random, 1);
    randomColors.push(color);
  }
  return randomColors;
};

/**
 * Permet de distribuer des cartes aléatoires en fonction du nombre de joueurs dans la partie
 * @param {*} playerNumber Nombre de joueurs dans la partie
 * @returns Un tableau de taille playerNumber.length qui contient les cartes de chaque joueurs
 */
const distributeCards = (playerNumber) => {
  const colors = mixColors();
  const randomCards = [];

  // Générer les cartes
  for (let i = 1; i <= 9; i++) {
    colors.forEach((color) => {
      randomCards.push([color, i]);
      randomCards.push([color, i]);
    });
  }

  // Mélanger les cartes
  for (let i = randomCards.length - 1; i > 0; i--) {
    const r = getRandomInt(0, i);
    [randomCards[i], randomCards[r]] = [randomCards[r], randomCards[i]];
  }

  const playersCards = new Array(playerNumber).fill([]).map(() => []);

  if (playerNumber === 2) {
    // Distribuer deux couleurs à chaque joueur
    playersCards[0] = playersCards[0].concat(
      randomCards.filter(
        (card) => card[0] === colors[0] || card[0] === colors[1]
      )
    );
    playersCards[1] = playersCards[1].concat(
      randomCards.filter(
        (card) => card[0] === colors[2] || card[0] === colors[3]
      )
    );
  } else if (playerNumber === 3) {
    // Distribuer une couleur à chaque joueur
    for (let i = 0; i < playerNumber; i++) {
      playersCards[i] = playersCards[i].concat(
        randomCards.filter((card) => card[0] === colors[i])
      );
    }
    // Distribuer 6 cartes de la quatrième couleur à chaque joueur
    playersCards[0] = playersCards[0].concat(
      randomCards.filter((card) => card[0] === colors[3]).slice(0, 6)
    );
    playersCards[1] = playersCards[1].concat(
      randomCards.filter((card) => card[0] === colors[3]).slice(6, 12)
    );
    playersCards[2] = playersCards[2].concat(
      randomCards.filter((card) => card[0] === colors[3]).slice(12, 18)
    );
    // Mélanger les cartes
    for (let i = 0; i < playersCards.length; i++) {
      for (let j = playersCards[0].length - 1; j > 0; j--) {
        const r = getRandomInt(0, j);
        [playersCards[i][j], playersCards[i][r]] = [
          playersCards[i][r],
          playersCards[i][j],
        ]; // Échanger les cartes pour les mélanger
      }
    }
  } else if (playerNumber === 4) {
    // Distribuer une couleur à chaque joueur
    for (let i = 0; i < playerNumber; i++) {
      playersCards[i] = playersCards[i].concat(
        randomCards.filter((card) => card[0] === colors[i])
      );
    }
  }

  return playersCards;
};

module.exports = distributeCards;
