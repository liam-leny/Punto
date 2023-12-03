const socketIO = require("socket.io");
const distributeCards = require("../src/gameUtils");

function initializeSocket(server) {
  io = socketIO(server, {
    cors: {
      origin: "http://localhost:3000",
    },
  });

  io.on("connection", (socket) => {
    console.log("Nouvelle connexion socket :", socket.id);

    socket.on("joinRoom", (partie_id) => {
      console.log(`${socket.id} rejoint la salle ${partie_id}`);
      socket.join(partie_id);
      console.log(socket.rooms);
    });

    socket.on("newPlayer", (data) => {
      io.to(data.id).emit("newPlayer", {
        pseudo: data.pseudo,
        playerId: data.playerId,
      });
    });

    socket.on("newCardPlaced", (data) => {
      const players = data.players;
      const cards = data.cards;
      const currentPlayer = data.currentPlayer;
      const currentPlayerIndex = players.indexOf(currentPlayer);
      const currentCardIndex = data.currentCardIndex;
      let newPlayerIndex = currentPlayerIndex + 1;
      let newCardIndex = currentCardIndex;
      // Si c'est le dernier joueur qui a joué alors c'est de nouveau au premier de jouer
      if (currentPlayerIndex === players.length - 1) {
        newPlayerIndex = 0;
        newCardIndex = currentCardIndex + 1;
      }
      const newCurrentCard = cards[newPlayerIndex][newCardIndex];
      io.emit("newCard", {
        x: data.x,
        y: data.y,
        newCurrentCard: newCurrentCard,
        newCardIndex: newCardIndex,
        currentCard: data.currentCard,
        newCurrentPlayer: players[newPlayerIndex],
        newPlayerIndex: newPlayerIndex,
      });
    });

    socket.on("startGame", (data) => {
      const cards = data.cards;
      const players = data.players;
      const indexFirstPlayer = Math.floor(Math.random() * players.length); // Entier compris [0, players.length]
      console.log("startGame, players", players);
      io.emit("gameStarted", {
        cards: cards,
        currentCard: cards[indexFirstPlayer][0],
        currentPlayer: players[indexFirstPlayer],
        players: players,
        playersId: data.playersId,
        roundId: data.roundId,
        roundNumber: data.roundNumber,
      });
    });

    socket.on("newRound", async (data) => {
      const newCurrentRound = data.currentRound + 1;
      console.log(newCurrentRound);
      const players = data.players;
      const roundWinner = data.roundWinner;
      const cards = distributeCards(players.length);
      let indexFirstPlayer = Math.floor(Math.random() * players.length); // Entier compris [0, players.length]
      const indexRoundWinner = players.indexOf(roundWinner);
      // Le joueur qui commence la nouvelle manche ne peut pas être le vainqueur de la précédente
      if (indexFirstPlayer === indexRoundWinner) {
        if (indexFirstPlayer === players.length) {
          indexFirstPlayer++;
        } else {
          indexFirstPlayer = 0;
        }
      }
      console.log("players", players);
      console.log("roundWinner", roundWinner);
      console.log("newRound, currentPlayer", players[0]);
      console.log("newRound, indexFirstPlayer", indexFirstPlayer);
      console.log("newRound, cards", cards);
      await new Promise((resolve) => setTimeout(resolve, 5000));
      io.emit("newRound", {
        cards: cards,
        currentCard: cards[indexFirstPlayer][0],
        currentPlayer: players[indexFirstPlayer],
        roundId: data.roundId,
        newCurrentRound: newCurrentRound,
      });
    });

    socket.on("winner", (currentPlayer) => {
      io.emit("roundFinished", currentPlayer);
    });
  });

  return io;
}

module.exports = {
  initializeSocket,
};
