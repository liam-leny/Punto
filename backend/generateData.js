const axios = require("axios");

const apiUrl = "http://localhost:5000/api";

/**
 * Génère un pseudo aléatoire qui n'existe pas déjà dans la liste fournie
 * @param {string} existingPseudos Liste des pseudos existants
 * @returnsNouveau pseudo généré
 */
function generateRandomPseudo(existingPseudos) {
  const adjectives = [
    "Red",
    "Blue",
    "Green",
    "Yellow",
    "Clever",
    "Brave",
    "Wise",
    "Happy",
    "Swift",
    "Mighty",
  ];
  const nouns = [
    "Wolf",
    "Eagle",
    "Tiger",
    "Lion",
    "Bear",
    "Hawk",
    "Panther",
    "Fox",
    "Deer",
    "Horse",
  ];

  let randomPseudo;
  do {
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    randomPseudo = `${adjective}${noun}`;
  } while (existingPseudos.includes(randomPseudo));

  return randomPseudo;
}

/**
 * Crée une partie factice avec un nombre spécifié de joueurs
 * @param {number} roundNumber Numéro de la manche
 * @param {number} numberOfPlayers Nombre de joueurs
 * @returns Informations sur la partie créée
 */
async function createFakeGame(roundNumber, numberOfPlayers) {
  try {
    let playersId = [];
    let existingPseudos = [];
    const newPseudo = generateRandomPseudo([]);
    existingPseudos.push(newPseudo);
    const responseNew = await axios.post(`${apiUrl}/game`, {
      round_number: roundNumber,
      pseudo: newPseudo,
    });
    const gameId = responseNew.data.game_id;
    playersId.push(responseNew.data.player_id);

    // Rejoindre la partie avec d'autres joueurs factices
    for (let i = 1; i < numberOfPlayers; i++) {
      const pseudo = generateRandomPseudo(existingPseudos);
      existingPseudos.push(pseudo);
      const responseJoin = await axios.post(`${apiUrl}/game/${gameId}/join`, {
        pseudo,
      });
      playersId.push(responseJoin.data.player_id);
    }

    return { gameId: gameId, playersId: playersId };
  } catch (error) {
    console.error("Erreur lors de la création de la partie factice :", error);
    throw error;
  }
}

/**
 * Crée une nouvelle manche factice pour une partie spécifiée.
 * @param {number} gameId Identifiant de la partie
 * @returns Informations sur la manche créée
 */
async function createFakeRound(gameId) {
  try {
    const response = await axios.post(`${apiUrl}/round`, {
      current_round_number: 1,
      game_id: gameId,
    });
    return { roundId: response.data.round_id };
  } catch (error) {
    console.error(
      "Erreur lors de la création de la manche factice :",
      error.message
    );
    throw error;
  }
}

/**
 * Génère des coordonnées valides pour une nouvelle carte sur un plateau donné
 * @param {Array} board Plateau du jeu
 * @returns Coordonnées générées.
 */
function generateValidCoordinates(board) {
  const gridSize = board.length;

  while (true) {
    const x = Math.floor(Math.random() * gridSize);
    const y = Math.floor(Math.random() * gridSize);

    if (
      board[x][y] !== undefined ||
      (x > 0 && board[x - 1][y] !== undefined) ||
      (x < gridSize - 1 && board[x + 1][y] !== undefined) ||
      (y > 0 && board[x][y - 1] !== undefined) ||
      (y < gridSize - 1 && board[x][y + 1] !== undefined) ||
      (x < gridSize - 1 &&
        y < gridSize - 1 &&
        board[x + 1][y + 1] !== undefined) ||
      (x < gridSize - 1 && y > 0 && board[x + 1][y - 1] !== undefined) ||
      (x > 0 && y >= 0 && board[x - 1][y + 1] !== undefined) ||
      (x > 0 && y < gridSize && board[x - 1][y - 1] !== undefined)
    ) {
      continue;
    }

    return { x, y };
  }
}

/**
 * Crée un nouveau coup factice pour une manche et un joueur spécifiés
 * @param {number} roundId Identifiant de la manche
 * @param {number} playerId Identifiant du joueur
 * @param {number} coord_x Coordonnée x de la carte
 * @param {number} coord_y Coordonnée y de la carte
 * @param {Array} board Plateau du jeu
 * @returns Plateau mis à jour après le coup
 */
async function createFakeCardMove(roundId, playerId, coord_x, coord_y, board) {
  try {
    const color = ["green", "yellow", "red", "blue"][
      Math.floor(Math.random() * 4)
    ];
    const point_number = Math.floor(Math.random() * 10);
    board[coord_x][coord_y] = [color, point_number];
    const response = await axios.post(`${apiUrl}/cardmove`, {
      point_number: point_number,
      color: color,
      coord_x: coord_x,
      coord_y: coord_y,
      round_id: roundId,
      player_id: playerId,
    });
    return board;
  } catch (error) {
    console.error(
      "Erreur lors de la création du coup factice :",
      error.message
    );
    throw error;
  }
}

/**
 * Met à jour une manche factice avec le vainqueur spécifié
 * @param {number} roundId Identifiant de la manche
 * @param {number} winner Identifiant du vainqueur
 * @returns Réponse de la mise à jour
 */
async function updateFakeRound(roundId, winner) {
  try {
    const response = await axios.patch(`${apiUrl}/round/${roundId}`, {
      winner: winner,
    });
    return response.data;
  } catch (error) {
    console.error(
      "Erreur lors de la mise à jour d'une manche factice :",
      error.message
    );
    throw error;
  }
}

/**
 * Met à jour une partie factice avec le vainqueur spécifié
 * @param {number} gameId - Identifiant de la partie
 * @param {number} winner - Identifiant du vainqueur
 * @returns- Réponse de la mise à jour
 */
async function updateFakeGame(gameId, winner) {
  try {
    const response = await axios.patch(`${apiUrl}/game/${gameId}`, {
      winner: winner,
    });
    return response.data;
  } catch (error) {
    console.error(
      "Erreur lors de la mise à jour d'une partie factice :",
      error.message
    );
    throw error;
  }
}

/**
 * Génère des données factices pour une partie avec plusieurs joueurs
 */
async function generateFakeData() {
  let board = new Array(6).fill([]).map(() => []);
  try {
    // Création d'une partie factice avec 4 joueurs
    const game = await createFakeGame(3, 4);

    // Création d'une nouvelle manche factice
    const round = await createFakeRound(game.gameId);

    // Création de coups factices pour chaque joueur
    for (let i = 0; i < Math.floor(Math.random() * 18); i++) {
      const { x, y } = generateValidCoordinates(board);
      for (const playerId of game.playersId) {
        board = await createFakeCardMove(round.roundId, playerId, x, y, board);
      }
    }

    // Mise à jour de la manche
    const updateRound = updateFakeRound(
      round.roundId,
      game.playersId[Math.floor(Math.random() * 4)]
    );

    // Mise à jour de la partie
    const updateGame = updateFakeGame(
      game.gameId,
      game.playersId[Math.floor(Math.random() * 4)]
    );
  } catch (error) {
    console.error("Erreur lors de la génération des données factices :", error);
  }
}

module.exports = generateFakeData;
