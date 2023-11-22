const socketIO = require('socket.io');


function initializeSocket(server) {
    io = socketIO(server, {
        cors: {
            origin: "http://localhost:3000",
        },
    });

    io.on('connection', (socket) => {
        console.log('Nouvelle connexion socket :', socket.id);

        socket.on('joinRoom', (partie_id) => {
            console.log(`${socket.id} rejoint la salle ${partie_id}`);
            socket.join(partie_id);
            console.log(socket.rooms);
        });

        socket.on('newPlayer', (data) => {
            io.to(data.id).emit('newPlayer', data.pseudo);
        });

        socket.on('newCardPlaced', (data) => {
            const players = data.players;
            const cards = data.cards;
            const currentPlayer = data.currentPlayer;
            const currentPlayerIndex = players.indexOf(currentPlayer)
            console.log('playerIndex', currentPlayerIndex)
            console.log('currentCard', data.currentCard)
            const currentCardIndex = data.currentCardIndex;
            let newPlayerIndex = currentPlayerIndex + 1
            let newCardIndex = currentCardIndex;
            // Si c'est le dernier joueur qui a joué alors c'est de nouveau au premier de jouer
            if (currentPlayerIndex === players.length - 1) {
                newPlayerIndex = 0;
                newCardIndex = currentCardIndex + 1;
            }
            console.log('currentCardIndex', currentCardIndex)
            console.log('newPlayerIndex', newPlayerIndex)

            const newCurrentCard = cards[newPlayerIndex][newCardIndex];
            console.log(newCurrentCard)

            io.emit('newCard', { x: data.x, y: data.y, newCurrentCard: newCurrentCard, newCardIndex: newCardIndex, currentCard: data.currentCard, newCurrentPlayer: players[newPlayerIndex] })
        });

        socket.on('startGame', (data) => {
            const cards = data.cards;
            const players = data.players;
            console.log('startGame, players', players)
            console.log('startGame, currentPlayer', players[0])
            io.emit('gameStarted', { cards: cards, currentCard: cards[0][0], currentPlayer: players[0], players: players });
        });

        socket.on('winner', (currentPlayer) => {
            io.emit('roundFinished', currentPlayer);
        });
    });

    return io;
}


module.exports = {
    initializeSocket,
};
