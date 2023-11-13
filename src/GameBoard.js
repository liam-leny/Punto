import React, { useState } from "react";
import "./GameBoard.css"

import Lignes from "./Lignes";

function GameBoard(props) {
  const [plateau, setPlateau] = useState(new Array(6).fill(new Array(6)));
  const [PlayerNumber] = useState(2);
  const [cards, setCards] = useState(new Array(2).fill(new Array(18)));
  const [ colors ] = useState(['red', 'yellow', 'blue', 'green']);



  /**
   * Permet de distribuer aléatoirement la couleur des cartes 
   * @returns Un tableau contenant toutes les lignes du plateau
   */
    const colorDistribution = () => {
      let rows = [];
      for (let i = 0; i < 6; i++) {
        rows.push(<Lignes key={i} i={i} ligneTableau={plateau[i]} tT={6} />)
      }
      return rows;
    }

  /**
   * Permet d'afficher le plateau 
   * @returns Un tableau contenant toutes les lignes du plateau
   */
    const affichagePlateau = () => {
      let rows = [];
      for (let i = 0; i < 6; i++) {
        rows.push(<Lignes key={i} i={i} ligneTableau={plateau[i]} tT={6} />)
      }
      return rows;
    }


    return (
      <div className="container">
        <div className="board">
        {affichagePlateau()}
      </div>
      </div>
    );
}

export default GameBoard;
