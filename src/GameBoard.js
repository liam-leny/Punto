import React, { useState, useEffect, useRef } from "react";
import "./GameBoard.css"
import "./Cards.css"
import Row from "./Row";

import io from 'socket.io-client';

function GameBoard(props) {
  const [board, setBoard] = useState(new Array(6).fill([]).map(() => []));
  const [pseudo] = useState(props.pseudo);
  const [currentPlayer, setCurrentPlayer] = useState(props.currentPlayer);
  const [playerNumber] = useState(props.players.length);
  const [cards] = useState(props.cards);
  const [currentCard, setCurrentCard] = useState(props.currentCard);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [playerTurn, setPlayerTurn] = useState(0);
  const [isRoundFinished, setIsRoundFinished] = useState(false);
  const [roundWinner, setRoundWinner] = useState(undefined);
 
  const socket = useRef(null);

  useEffect(() => {
    console.log('PLAYERS', props.players)
    socket.current = io('http://localhost:5000');
    socket.current.on('newCard', (data) => {
      addNewCard(data)
    });

    socket.current.on('roundFinished', (currentPlayer) => {
      setIsRoundFinished(true)
      setRoundWinner(currentPlayer)
    });


    return () => {
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, []);

  /**
   * Permet de savoir si il y a un vainqueur
   * @param {*} x Coordonnée x de la dernière carte posée
   * @param {*} y Coordonnée y de la dernière carte posée
   * @returns false si il n'y a pas de gagnant, true sinon
   */
  function checkVictory(x, y) {
    socket.current.emit('newCardPlaced', { x: x, y: y, players: props.players, cards: cards, currentPlayer: currentPlayer, currentCard: currentCard, currentCardIndex:currentCardIndex});
    const currentColor = currentCard[0];
    let nbCardsSeries = 4;
    if (playerNumber === 2) {
      nbCardsSeries = 5
    }

    // Vérifier la ligne
    let rowCount = 1;
    for (let i = y - 1; i >= 0 && board[x][i] !== undefined && board[x][i][0] === currentColor; i--) {
      rowCount++;
    }
    for (let i = y + 1; i < board[x].length && board[x][i] !== undefined && board[x][i][0] === currentColor; i++) {
      rowCount++;
    }
    if (rowCount >= nbCardsSeries) {
      console.log('true')
      return true;
    }

    // Vérifier la colonne
    let columnCount = 1;
    for (let i = x - 1; i >= 0 && board[i][y] !== undefined && board[i][y][0] === currentColor; i--) {
      columnCount++;
    }
    for (let i = x + 1; i < board.length && board[i][y] !== undefined && board[i][y][0] === currentColor; i++) {
      columnCount++;
    }
    if (columnCount >= nbCardsSeries) {
      console.log('true')
      return true;
    }

    // Vérifier la diagonale principale (de gauche à droite)
    let mainDiagonal = 1;
    for (let i = 1; i < nbCardsSeries; i++) {
      const newRow = x - i;
      const newCol = y - i;
      if (newRow >= 0 && newCol >= 0 && board[newRow][newCol] !== undefined && board[newRow][newCol][0] === currentColor) {
        mainDiagonal++;
      } else {
        break;
      }
    }
    for (let i = 1; i < nbCardsSeries; i++) {
      const newRow = x + i;
      const newCol = y + i;
      if (newRow < board.length && newCol < board.length && board[newRow][newCol] !== undefined && board[newRow][newCol][0] === currentColor) {
        mainDiagonal++;
      } else {
        break;
      }
    }
    // console.log('mainDiagonal', mainDiagonal)
    if (mainDiagonal >= nbCardsSeries) {
      console.log('true')
      return true;
    }

    // Vérifier la diagonale secondaire (de droite à gauche)
    let secondaryDiagonal = 1;
    for (let i = 1; i < nbCardsSeries; i++) {
      const newRow = x - i;
      const newCol = y + i;
      if (newRow >= 0 && newCol < board.length && board[newRow][newCol] !== undefined && board[newRow][newCol][0] === currentColor) {
        secondaryDiagonal++;
      } else {
        break;
      }
    }
    for (let i = 1; i < nbCardsSeries; i++) {
      const newRow = x + i;
      const newCol = y - i;
      if (newRow < board.length && newCol >= 0 && board[newRow][newCol] !== undefined && board[newRow][newCol][0] === currentColor) {
        secondaryDiagonal++;
      } else {
        break;
      }
    }
    // console.log('secondaryDiagonal', secondaryDiagonal)
    if (secondaryDiagonal >= nbCardsSeries) {
      console.log('true')
      return true;
    }

    console.log('false')
    return false
  }


  const addNewCard = (data) => {
    setCurrentPlayer(data.newCurrentPlayer)
    const tempPlateau = [...board]
    tempPlateau[data.x][data.y] = data.currentCard;
    setCurrentCard(data.newCurrentCard)
    setCurrentCardIndex(data.newCardIndex)
    setBoard(tempPlateau)
    console.log(board)
  };

  const handlePlayerTurnChange = (x, y) => {
    const victory = checkVictory(x, y)
    if (victory) {
      socket.current.emit('winner', currentPlayer)
    }
    setPlayerTurn(playerTurn + 1);
  };



  /**
   * Permet d'afficher le plateau 
   * @returns Un tableau contenant toutes les lignes du plateau
   */
  const BoardDisplay = () => {
    let rows = [];
    for (let i = 0; i < 6; i++) {
      rows.push(<Row key={i} i={i} size={6} currentCard={currentCard} board={board} setBoard={setBoard} playerTurn={playerTurn} handlePlayerTurnChange={handlePlayerTurnChange}pseudo={pseudo} currentPlayer={currentPlayer} isRoundFinished={isRoundFinished}  />)
    }
    return rows;
  }

  return (
    <div>
      {
        isRoundFinished === true && <h1>Manche terminé <br></br> Le vainqueur est {roundWinner}</h1>
      }
      {
        isRoundFinished === false && (pseudo === currentPlayer ? <h1>C'est à votre tour de jouer</h1> : <h1>C'est au tour de {currentPlayer} de jouer</h1>)
      }
    <div className="container">
      <div className="board">
        {BoardDisplay()}
      </div>
      <div className={`square number-cards ${currentCard[0]}`}>
        {currentCard[1]}
      </div>
    </div>
    </div>

  );
}

export default GameBoard;
