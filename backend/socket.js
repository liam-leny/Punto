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

        socket.on('newCardPlaced', (data) => {
            io.emit('newCard', data)
        });

        socket.on('startGame', (data) => {
            const cards = data.cards;
            io.emit('gameStarted', cards);
        });

        socket.on('sendCards', (cards) => {
            cards = cards;
            socket.emit('nextCard', getNextCard(cards));
        });
    });

    return io;
}

function getSocket() {
    if (!io) {
        throw new Error('Le socket doit être initialisé en appelant initializeSocket d\'abord');
    }
    return io;
}

let nextCardIndex = 0;
const getNextCard = (cards) => {
    console.log(cards)
    const nextCard = cards[0][nextCardIndex];
    console.log('nextCard', nextCard)
    nextCardIndex++
    return nextCard;
};


module.exports = {
    initializeSocket,
    getSocket,
};
