import React, { useRef } from "react";
import "./Cards.css";

import { Toast } from 'primereact/toast';

/**
 * Correspond à chaque case du plateau
 * @param {*} props 
 * @returns 
 */
function Square(props) {
  const toastRef = useRef();


  /**
   * Fonction qui est appelée à chaque fois qu'un joueur pose une carte
   * Permet de vérifier si le placement d'une carte est valide
   * 
   */
  const addCard = () => {
    if (props.isRoundFinished === true) {
      toastRef.current.show({ severity: 'error', summary: 'Mouvement impossible', detail: 'La manche est terminée' });
    }
    else if (props.pseudo !== props.currentPlayer) {
      toastRef.current.show({ severity: 'error', summary: 'Mouvement impossible', detail: 'Ce n\'est pas votre tour de jouer' });
    } else {
      console.log('addCard', props.currentCard, props.board)
      const x = props.i;
      const y = props.j;
      const board = props.board;
      console.log('x : ', x, 'y : ', y)
      if (props.playerTurn === 0) {
        if ((x === 2 && y === 2) || (x === 2 && y === 3) || (x === 3 && y === 2) || (x === 3 && y === 3)) {
          validCard()
        } else {
          toastRef.current.show({ severity: 'error', summary: 'Premier coup non valide', detail: 'La première carte de la manche doit être placée au milieu du plateau' });
        }
      } else {
        // Vérifier si la carte est bien superposée à une carte de valeur inférieur
        if (board[x][y] !== undefined) {
          const cardOnBoard = board[x][y];
          if (props.currentCard[1] > cardOnBoard[1]) {
            validCard()
          } else {
            toastRef.current.show({ severity: 'error', summary: 'Superposition impossible', detail: 'Votre carte doit avoir une valeur supérieur à celle déjà présente sur le plateau' });
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
          validCard()
        } else {
          toastRef.current.show({ severity: 'error', summary: 'Mouvement impossible', detail: 'Votre carte doit être juxtaposée ou superposée à une autre carte' });
        }
      }
    }
  };

  const validCard = () => {
    props.handlePlayerTurnChange(props.i, props.j)
  }

  return (
    <div
      className={`square number-board ${props.board[props.i][props.j] === undefined ? "" : props.board[props.i][props.j][0]}`}
      onClick={addCard}
    >
      <Toast ref={toastRef} />
      {props.board[props.i][props.j] === undefined ? "" : props.board[props.i][props.j][1]}
    </div>
  );
}

export default Square;
