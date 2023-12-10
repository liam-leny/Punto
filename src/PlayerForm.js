import React, { useState, useRef } from "react";
import GameForm from "./GameForm";
import "./Form.css";

import axios from "axios";

import { InputText } from "primereact/inputtext";
import { ListBox } from "primereact/listbox";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";

function PlayerForm(props) {
  const [pseudo, setPseudo] = useState("");
  const [database, setDatabase] = useState("");
  const [availableDatabases] = useState(["MySQL", "SQLite", "MongoDB", "Neo4j"]);
  const [playerRegistered, setPlayerRegistered] = useState(false);
  const toastRef = useRef();

  const onButtonClick = async () => {
    if (pseudo === "") {
      toastRef.current.show({
        severity: "error",
        summary: "Erreur",
        detail: "Merci de saisir un pseudo",
      });
    } else if (database === "") {
      toastRef.current.show({
        severity: "error",
        summary: "Erreur",
        detail: "Merci de sélectionner une base de donnée",
      });
    } else {
      await axios.post(`http://localhost:5000/api/database-choice`, {
        database: database,
      });
      setPlayerRegistered(true);
    }
  };

  if (playerRegistered) {
    return <GameForm pseudo={pseudo} database={database} />;
  }

  return (
    <div className="player-form">
      <Toast ref={toastRef} />
      <h1>Jeu du punto</h1>
      <span className="p-float-label">
        <InputText
          id="pseudo"
          value={pseudo}
          onChange={(e) => setPseudo(e.target.value)}
        />
        <label htmlFor="pseudo">Pseudo</label>
      </span>
      <br></br>
      <ListBox
        value={database}
        onChange={(e) => setDatabase(e.value)}
        options={availableDatabases}
        className="w-full md:w-14rem"
      />
      <Button
        className="button"
        type="button"
        label="Valider"
        onClick={onButtonClick}
      />
    </div>
  );
}

export default PlayerForm;
