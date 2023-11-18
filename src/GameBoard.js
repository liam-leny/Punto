import React, { useState, useEffect } from "react";
import "./GameBoard.css"
import "./Cards.css"
import Row from "./Row";

function GameBoard(props) {
  const [board, setBoard] = useState(new Array(6).fill([]).map(() => []));
  const [playerNumber] = useState(props.players.length);
  const [cards, setCards] = useState(new Array(playerNumber));
  const [currentCard, setCurrentCard] = useState(new Array(2).fill([]).map(() => []));
  const [colors, setColors] = useState(['red', 'yellow', 'blue', 'green']);
  const [playerTurn, setPlayerTurn] = useState(0);
  const [cardsDistributionComplete, setCardsDistributionComplete] = useState(false);


  useEffect(() => {
    if (cardsDistributionComplete) {
      CardsDisplay();
    }
  }, [playerTurn, cardsDistributionComplete]);


  useEffect(() => {
    cardsDistribution()
  }, []);

  const getRandomInt = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1) + min); // The maximum is inclusive and the minimum is inclusive
  }

  /**
   * Permet de mélanger le tableau initial des couleurs
   */
  const mixColors = () => {
    const tempColors = [...colors]
    const randomColors = []
    for (let i = 3; i > -1; i--) {
      const random = getRandomInt(0, i)
      const color = tempColors[random]
      tempColors.splice(random, 1);
      randomColors.push(color)
    }
    setColors(randomColors);
  }


  /**
   * Permet de distribuer aléatoirement les cartes au début de la partie
   */
  const cardsDistribution = () => {
    mixColors()
    const randomCards = []

    // Générer les cartes
    for (let i = 1; i <= 9; i++) {
      colors.forEach(color => {
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
      playersCards[0] = playersCards[0].concat(randomCards.filter(card => (card[0] === colors[0]) || (card[0] === colors[1])));
      playersCards[1] = playersCards[1].concat(randomCards.filter(card => (card[0] === colors[2]) || (card[0] === colors[3])));
    } else if (playerNumber === 3) {
      // Distribuer une couleur à chaque joueur
      for (let i = 0; i < playerNumber; i++) {
        playersCards[i] = playersCards[i].concat(randomCards.filter(card => card[0] === colors[i]));
      }
      // Distribuer 6 cartes de la quatrième couleur à chaque joueur
      playersCards[0] = playersCards[0].concat(randomCards.filter(card => card[0] === colors[3]).slice(0, 6));
      playersCards[1] = playersCards[1].concat(randomCards.filter(card => card[0] === colors[3]).slice(6, 12));
      playersCards[2] = playersCards[2].concat(randomCards.filter(card => card[0] === colors[3]).slice(12, 18));
      // Mélanger les cartes
      for (let i = 0; i < playersCards.length; i++) {
        for (let j = playersCards[0].length - 1; j > 0; j--) {
          const r = getRandomInt(0, j);
          [playersCards[i][j], playersCards[i][r]] = [playersCards[i][r], playersCards[i][j]]; // Échanger les cartes pour les mélanger
        }
      }
    } else if (playerNumber === 4) {
      // Distribuer une couleur à chaque joueur
      for (let i = 0; i < playerNumber; i++) {
        playersCards[i] = playersCards[i].concat(randomCards.filter(card => card[0] === colors[i]));
      }
    }

    setCards(playersCards)
    setCardsDistributionComplete(true)
  }

  /**
   * Permet de savoir si il y a un vainqueur
   * @param {*} x Coordonnée x de la dernière carte posée
   * @param {*} y Coordonnée y de la dernière carte posée
   * @returns false si il n'y a pas de gagnant, true sinon
   */
  function checkVictory(x, y) {
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

  const handlePlayerTurnChange = () => {
    setPlayerTurn(playerTurn + 1);
  };

  /**
   * Permet d'afficher le plateau 
   * @returns Un tableau contenant toutes les lignes du plateau
   */
  const BoardDisplay = () => {
    let rows = [];
    for (let i = 0; i < 6; i++) {
      rows.push(<Row key={i} i={i} size={6} currentCard={currentCard} board={board} setBoard={setBoard} checkVictory={checkVictory} playerTurn={playerTurn} handlePlayerTurnChange={handlePlayerTurnChange} />)
    }
    return rows;
  }

  /**
   * Permet d'afficher la carte du joueur qui doit jouer
   * @returns La carte du joueur qui doit jouer
   */
  const CardsDisplay = () => {
    console.log(cards)
    const c = cards[0][0]
    setCurrentCard(c)
  }

  return (
    <div className="container">
      <div className="board">
        {BoardDisplay()}
      </div>
      <div className={`square number-cards ${currentCard[0]}`}>
        {currentCard[1]}
      </div>
    </div>
  );
}

export default GameBoard;
