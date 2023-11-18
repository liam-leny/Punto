import React, { useState, useEffect, useRef } from "react";
import "./Cards.css";

import { Toast } from 'primereact/toast';


function Cases(props) {
  const [isCardVisible, setIsCardVisible] = useState(false);
  const toastRef = useRef();


  useEffect(() => {
    if (isCardVisible) {
      updatePlateau();
    }
  }, [isCardVisible]);

  const addCard = () => {
    console.log(props.plateau)
    const x = props.i;
    const y = props.j;
    const plateau = props.plateau;
    console.log('x : ', x, 'y : ', y)
    console.log(plateau)

    if (props.playerTurn === 0) {
      setIsCardVisible(true)
    } else {
      // Vérifier si la carte est bien superposée à une carte de valeur inférieur
      if (plateau[x][y] !== undefined) {
        const cardsOnBoard = plateau[x][y];
        if (props.currentCard[1] > cardsOnBoard[1]) {
          setIsCardVisible(true);
        } else {
          toastRef.current.show({ severity: 'error', summary: 'Superposition impossible', detail: 'Votre carte doit avoir une valeur supérieur à celle déjà présente sur le plateau' });
        }
      }
      // Vérifier si la carte est bien juxtaposée à une autre carte
      else if ((x > 0 && (plateau[x - 1][y] !== undefined)) || // Juxtaposée à gauche
        (x < plateau.length - 1 && (plateau[x + 1][y] !== undefined)) || // Juxtaposée à droite
        (y > 0 && (plateau[x][y - 1] !== undefined)) || // Juxtaposée en dessous
        (y < plateau.length - 1 && (plateau[x][y + 1] !== undefined)) || // Juxtaposée au dessus
        ((x < plateau.length - 1 && y < plateau.length - 1) && (plateau[x + 1][y + 1] !== undefined)) || // Juxtaposée dans le coin supérieur droit
        ((x < plateau.length - 1 && y > 0) && (plateau[x + 1][y - 1] !== undefined)) || // Juxtaposée dans le coin inférieur gauche
        ((x > 0 && y >= 0) && (plateau[x - 1][y + 1] !== undefined)) || // Juxtaposée dans le coin inférieur gauche
        ((x > 0 && y < plateau.length) && (plateau[x - 1][y - 1] !== undefined)) // Juxtaposée dans le coin inférieur droit
      ) {
        setIsCardVisible(true);
      } else {
        toastRef.current.show({ severity: 'error', summary: 'Mouvement impossible', detail: 'Votre carte doit être juxtaposée ou superposée à une autre carte' });
      }
    }
    props.handlePlayerTurnChange()
  };

  const updatePlateau = () => {
    const tempPlateau = [...props.plateau]
    tempPlateau[props.i][props.j] = props.currentCard;
    props.setPlateau(tempPlateau)
    props.checkVictory(props.i, props.j)
  }

  return (
    <div
      className={`case number-board ${isCardVisible ? props.currentCard[0] : ""}`}
      onClick={addCard}
    >
      <Toast ref={toastRef} />
      {isCardVisible && props.currentCard[1]}
    </div>
  );
}

export default Cases;
