import React, { useState, useEffect, useRef } from "react";
import "./Cards.css";

import { Toast } from 'primereact/toast';


function Square(props) {
  const [isCardVisible, setIsCardVisible] = useState(false);
  const toastRef = useRef();


  useEffect(() => {
    if (isCardVisible) {
      updateBoard();
    }
  }, [isCardVisible]);

  const addCard = () => {
    console.log(props.board)
    const x = props.i;
    const y = props.j;
    const board = props.board;
    console.log('x : ', x, 'y : ', y)
    console.log(board)

    if (props.playerTurn === 0) {
      setIsCardVisible(true)
    } else {
      // Vérifier si la carte est bien superposée à une carte de valeur inférieur
      if (board[x][y] !== undefined) {
        const cardOnBoard = board[x][y];
        if (props.currentCard[1] > cardOnBoard[1]) {
          setIsCardVisible(true);
        } else {
          toastRef.current.show({ severity: 'error', summary: 'Superposition impossible', detail: 'Votre carte doit avoir une valeur supérieur à celle déjà présente sur le board' });
        }
      }
      // Vérifier si la carte est bien juxtaposée à une autre carte
      else if ((x > 0 && (board[x - 1][y] !== undefined)) || // Juxtaposée à gauche
        (x < board.length - 1 && (board[x + 1][y] !== undefined)) || // Juxtaposée à droite
        (y > 0 && (board[x][y - 1] !== undefined)) || // Juxtaposée en dessous
        (y < board.length - 1 && (board[x][y + 1] !== undefined)) || // Juxtaposée au dessus
        ((x < board.length - 1 && y < board.length - 1) && (board[x + 1][y + 1] !== undefined)) || // Juxtaposée dans le coin supérieur droit
        ((x < board.length - 1 && y > 0) && (board[x + 1][y - 1] !== undefined)) || // Juxtaposée dans le coin inférieur gauche
        ((x > 0 && y >= 0) && (board[x - 1][y + 1] !== undefined)) || // Juxtaposée dans le coin inférieur gauche
        ((x > 0 && y < board.length) && (board[x - 1][y - 1] !== undefined)) // Juxtaposée dans le coin inférieur droit
      ) {
        setIsCardVisible(true);
      } else {
        toastRef.current.show({ severity: 'error', summary: 'Mouvement impossible', detail: 'Votre carte doit être juxtaposée ou superposée à une autre carte' });
      }
    }
    props.handlePlayerTurnChange()
  };

  const updateBoard = () => {
    const tempPlateau = [...props.board]
    tempPlateau[props.i][props.j] = props.currentCard;
    props.setBoard(tempPlateau)
    props.checkVictory(props.i, props.j)
  }

  return (
    <div
      className={`square number-board ${isCardVisible ? props.currentCard[0] : ""}`}
      onClick={addCard}
    >
      <Toast ref={toastRef} />
      {isCardVisible && props.currentCard[1]}
    </div>
  );
}

export default Square;
