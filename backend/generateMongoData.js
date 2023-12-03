const axios = require('axios');

const apiUrl = 'http://localhost:5000/api/mongo';

/**
 * Génère un pseudo aléatoire qui n'existe pas déjà dans la liste fournie
 * @param existingPseudos Liste des pseudos existants
 * @returnsNouveau pseudo généré
 */
function generateRandomPseudo(existingPseudos) {
    const adjectives = ['Red', 'Blue', 'Green', 'Yellow', 'Clever', 'Brave', 'Wise', 'Happy', 'Swift', 'Mighty'];
    const nouns = ['Wolf', 'Eagle', 'Tiger', 'Lion', 'Bear', 'Hawk', 'Panther', 'Fox', 'Deer', 'Horse'];

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
 * @param roundNumber Numéro de la manche
 * @param numberOfPlayers Nombre de joueurs
 * @returns Informations sur la partie créée
 */
async function createFakeGame(roundNumber, numberOfPlayers) {
    try {
        let existingPseudos = [];
        const newPseudo = generateRandomPseudo([]);
        existingPseudos.push(newPseudo)
        const response = await axios.post(`${apiUrl}/game`, { round_number: roundNumber });

        // Créer 'autres joueurs factices
        for (let i = 1; i < numberOfPlayers; i++) {
            const pseudo = generateRandomPseudo(existingPseudos);
            existingPseudos.push(pseudo)
        }
        const gameId = response.data;
        return { gameId: gameId, pseudos: existingPseudos };
    } catch (error) {
        console.error('Erreur lors de la création de la partie factice :', error);
        throw error;
    }
}

/**
 * Génère des coordonnées valides pour une nouvelle carte sur un plateau donné
 * @param board Plateau du jeu
 * @returns Coordonnées générées.
 */
function generateValidCoordinates(board) {
    const gridSize = board.length;

    while (true) {
        const x = Math.floor(Math.random() * gridSize);
        const y = Math.floor(Math.random() * gridSize);

        if (
            (board[x][y] !== undefined) ||
            ((x > 0 && board[x - 1][y] !== undefined) ||
                (x < gridSize - 1 && board[x + 1][y] !== undefined) ||
                (y > 0 && board[x][y - 1] !== undefined) ||
                (y < gridSize - 1 && board[x][y + 1] !== undefined) ||
                ((x < gridSize - 1 && y < gridSize - 1) && board[x + 1][y + 1] !== undefined) ||
                ((x < gridSize - 1 && y > 0) && board[x + 1][y - 1] !== undefined) ||
                ((x > 0 && y >= 0) && board[x - 1][y + 1] !== undefined) ||
                ((x > 0 && y < gridSize) && board[x - 1][y - 1] !== undefined))
        ) {
            continue;
        }

        return { x, y };
    }
}

/**
 * Crée un nouveau coup factice pour une partie et un joueur spécifiés
 * @param gameId Identifiant de la partie
 * @param pseudo Pseudo du joueur
 * @param coord_x Coordonnée x de la carte
 * @param coord_y Coordonnée y de la carte
 * @param board Plateau du jeu
 * @returns Plateau mis à jour après le coup
 */
async function createFakeCardMove(gameId, pseudo, coord_x, coord_y, board) {
    try {
        const color = ['green', 'yellow', 'red', 'blue'][Math.floor(Math.random() * 4)]
        const point_number = Math.floor(Math.random() * 10)
        board[coord_x][coord_y] = [color, point_number];
        const response = await axios.post(`${apiUrl}/cardmove/${gameId}`, {
            pseudo: pseudo,
            point_number: point_number,
            color: color,
            coord_x: coord_x,
            coord_y: coord_y,
        });
        return board;
    } catch (error) {
        console.error('Erreur lors de la création du coup factice :', error.message);
        throw error;
    }
}

/**
 * Génère des données factices pour une partie avec plusieurs joueurs
 */
async function generateFakeMongoData() {
    let board = new Array(6).fill([]).map(() => []);
    try {
        // Création d'une partie factice avec 4 joueurs
        const game = await createFakeGame(3, 4);

        // Création de coups factices pour chaque joueur
        const { x, y } = generateValidCoordinates(board);
        for (const pseudo of game.pseudos) {
            board = await createFakeCardMove(game.gameId, pseudo, x, y, board);
        }

    } catch (error) {
        console.error('Erreur lors de la génération des données factices :', error);
    }
}

module.exports = generateFakeMongoData;