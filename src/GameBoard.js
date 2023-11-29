import React, { useState, useEffect, useRef } from "react";
import "./GameBoard.css"
import "./Cards.css"
import Row from "./Row";

import axios from 'axios';
import io from 'socket.io-client';
import { Toast } from 'primereact/toast';

function GameBoard(props) {
  const [board, setBoard] = useState(new Array(6).fill([]).map(() => []));
  const [pseudo] = useState(props.pseudo);
  const [currentPlayer, setCurrentPlayer] = useState(props.currentPlayer);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [playerNumber] = useState(props.players.length);
  const [playerTurn, setPlayerTurn] = useState(0);
  const [cards, setCards] = useState(props.cards);
  const [currentCard, setCurrentCard] = useState(props.currentCard);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [currentRound, setCurrentRound] = useState(0);
  const [roundNumber] = useState(props.roundNumber);
  const [roundId, setRoundId] = useState(props.roundId);
  const [isRoundFinished, setIsRoundFinished] = useState(false);
  const [roundWinners] = useState(new Array());
  const [isGameFinished, setIsGameFinished] = useState(false);
  const [dbType] = useState(props.dbType);


  const toastRef = useRef();
  const socket = useRef(null);

  useEffect(() => {
    socket.current = io('http://localhost:5000');

    socket.current.on('newCard', (data) => {
      addNewCard(data)
    });

    socket.current.on('roundFinished', (roundWinner) => {
      console.log('RoundWinner', roundWinner)
      roundWinners.push(roundWinner)
      setIsRoundFinished(true)
      checkEndGame(roundWinner)
    });


    socket.current.on('newRound', async (data) => {
      // Vider le tableau
      board.forEach((element, index) => {
        board[index] = [];
      });
      setBoard(new Array(6).fill([]).map(() => []))
      setCurrentPlayer(data.currentPlayer)
      setCards(data.cards)
      setCurrentCard(data.currentCard)
      setCurrentCardIndex(0)
      setPlayerTurn(0)
      setIsRoundFinished(false)
      // TO DO : current round won't update
      console.log('CURRENT ROUND', data.newCurrentRound)
      setCurrentRound(prevRound => prevRound + 1)
      setRoundId(data.roundId)
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
  async function checkVictory(x, y) {
    socket.current.emit('newCardPlaced', { x: x, y: y, players: props.players, cards: cards, currentPlayer: currentPlayer, currentCard: currentCard, currentCardIndex: currentCardIndex });
    if (dbType === 'Relationnel') {
      await axios.post('http://localhost:5000/api/cardmove', {
        point_number: currentCard[1],
        color: currentCard[0],
        coord_x: x,
        coord_y: y,
        round_id: roundId,
        player_id: props.playersId[currentPlayerIndex],
      });
    } else {
      await axios.patch(`http://localhost:5000/api/mongo/cardmove/${props.gameId}`, {
        pseudo: currentPlayer,
        point_number: currentCard[1],
        color: currentCard[0],
        coord_x: x,
        coord_y: y,
      });
    }
    const currentColor = currentCard[0];
    let nbCardsSeries = 4;
    if (playerNumber === 2) {
      nbCardsSeries = 2
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
    const tempBoard = [...board]
    tempBoard[data.x][data.y] = data.currentCard;
    setPlayerTurn(playerTurn + 1);
    setCurrentPlayerIndex(data.newPlayerIndex)
    setCurrentCard(data.newCurrentCard)
    setCurrentCardIndex(data.newCardIndex)
    setBoard(tempBoard)
  };

  const handlePlayerTurnChange = async (x, y) => {
    const victory = await checkVictory(x, y)
    if (victory) {
      if (dbType === 'Relationnel') {
        await axios.patch(`http://localhost:5000/api/round/${roundId}/`, {
          winner: props.playersId[currentPlayerIndex],
        });
      }
      socket.current.emit('winner', currentPlayer)
    }
  };


  const checkEndGame = async (roundWinner) => {
    // Nombre de partie gagnée par le gagnant de la dernière manche
    const NbWinGames = roundWinners.filter(winner => winner === roundWinner).length
    if (NbWinGames === roundNumber) {
      const indexGameWinner = props.players.indexOf(roundWinner)
      const winner = props.playersId[indexGameWinner]
      if (pseudo === currentPlayer) {
        if (dbType === 'Relationnel') {
          await axios.patch(`http://localhost:5000/api/game/${props.gameId}/`, {
            winner: winner,
          });
        }
      }
      setIsGameFinished(true)
    } else {
      if (pseudo === currentPlayer) {
        toastRef.current.show({ severity: 'info', summary: `Lancement de la manche ${currentRound + 2}`, detail: 'Dans 5s, la prochaine manche commencera' });
        let roundId;
        if (dbType === 'Relationnel') {
          const response = await axios.post(`http://localhost:5000/api/round/`, {
            current_round_number: currentRound,
            game_id: props.gameId
          });
          roundId = response.data.round_id;
        }
        socket.current.emit('newRound', { players: props.players, roundWinner: roundWinner, currentRound: currentRound, gameId: props.gameId, roundId: roundId })
      }
    }
  };




  /**
   * Permet d'afficher le plateau 
   * @returns Un tableau contenant toutes les lignes du plateau
   */
  const BoardDisplay = () => {
    let rows = [];
    for (let i = 0; i < 6; i++) {
      rows.push(<Row key={i} i={i} size={6} currentCard={currentCard} board={board} playerTurn={playerTurn} handlePlayerTurnChange={handlePlayerTurnChange} pseudo={pseudo} currentPlayer={currentPlayer} isRoundFinished={isRoundFinished} />)
    }
    return rows;
  }

  return (
    <div>
      <Toast ref={toastRef} />
      {
        isGameFinished === true && <h1>Partie terminé <br></br> {roundWinners[roundWinners.length -1]} a gagné la partie</h1>
      }
      {
        (isGameFinished === false && isRoundFinished === true) && <h1>Manche terminé <br></br> Le vainqueur de la manche est {roundWinners[roundWinners.length -1]}</h1>
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
