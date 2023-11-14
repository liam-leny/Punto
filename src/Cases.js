import React, { useState } from "react";
import "./Cards.css";

function Cases(props) {
  const [isCardVisible, setIsCardVisible] = useState(false);

  const addCard = () => {
    console.log(props.currentCard[1])
    setIsCardVisible(true);
  };

  return (

    <div
      className={`case number-board ${isCardVisible ? props.currentCard[0] : ""}`}
      onClick={addCard}
    >{isCardVisible && props.currentCard[1]}</div>
  );
}

export default Cases;