import React from "react";
import Square from "./Square";
import "./GameBoard.css"

/**
 * Correspond à chaque ligne du plateau de jeu
 * @param {*} props 
 * @returns 
 */
function Row(props) {

  /**
   * Permet d'insérer des cases à l'intérieur de chaque ligne
   * @returns 
   */
  const squareCreation = () => {
    let squares = [];
    for (let squareNum = 0; squareNum < props.size; squareNum++) {
      squares.push(<Square key={squareNum} i={props.i} j={squareNum} currentCard={props.currentCard} board={props.board} playerTurn={props.playerTurn} handlePlayerTurnChange={props.handlePlayerTurnChange} pseudo={props.pseudo} currentPlayer={props.currentPlayer} isRoundFinished={props.isRoundFinished} />)
    }
    return squares;
  }

  return (
    <div className="row">
      {squareCreation()}
    </div>
  );
}
export default Row;
