import React, { useState, useEffect } from "react";
import "./GameBoard.css"
import "./Cards.css"
import Lignes from "./Lignes";

function GameBoard(props) {
  const [plateau, setPlateau] = useState(new Array(6).fill(new Array(6)));
  const [playerNumber] = useState(props.players.length);
  const [cards, setCards] = useState(new Array(playerNumber));
  const [currentCard, setCurrentCard] = useState(new Array(2).fill([]).map(() => []));
  const [colors, setColors] = useState(['red', 'yellow', 'blue', 'green']);
  const [playerTurn, setplayerTurn] = useState(0);
  const [cardsDistributionComplete, setCardsDistributionComplete] = useState(false);


  useEffect(() => {
    if (cardsDistributionComplete) {
      affichageCards();
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
   * Permet d'afficher le plateau 
   * @returns Un tableau contenant toutes les lignes du plateau
   */
  const affichagePlateau = () => {
    console.log(props.players)
    let rows = [];
    for (let i = 0; i < 6; i++) {
      rows.push(<Lignes key={i} i={i} ligneTableau={plateau[i]} tT={6} currentCard={currentCard} />)
    }
    return rows;
  }

  /**
   * Permet d'afficher la carte du joueur qui doit jouer
   * @returns La carte du joueur qui doit jouer
   */
  const affichageCards = () => {
    console.log(cards)
    const c = cards[playerTurn][0]
    setCurrentCard(c)
  }


  return (
    <div className="container">
      <div className="board">
        {affichagePlateau()}
      </div>
      <div className={`case number-cards ${currentCard[0]}`}>
        {currentCard[1]}
      </div>
    </div>
  );
}

export default GameBoard;
