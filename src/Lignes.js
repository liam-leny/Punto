import React from "react";
import Cases from "./Cases";
import "./GameBoard.css"


function Lignes(props) {

  const generationCases = () => {
    let cases = [];
    for (let numCase = 0; numCase < props.tT; numCase++) {
      cases.push(<Cases key={numCase} i={props.i} j={numCase} tT={props.tT} currentCard={props.currentCard}  plateau={props.plateau} setPlateau={props.setPlateau} checkVictory={props.checkVictory} playerTurn={props.playerTurn} handlePlayerTurnChange={props.handlePlayerTurnChange} />)
    }
    return cases;
  }

  return (
    <div className="ligne">
      {generationCases()}
    </div>
  );
}
export default Lignes;
