import React from "react";
import Cases from "./Cases";
import "./GameBoard.css"


function Lignes(props) {

  const generationCases = () => {

    let cases = [];
    for (let numCase = 0; numCase < props.tT; numCase++) {
      cases.push(<Cases key={numCase} i={props.i} j={numCase} tT={props.tT}/>)
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
