import React, { useState, useRef } from 'react';
import GameForm from './GameForm';
import "./Form.css"


import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';

function PlayerForm(props) {
  const [pseudo, setPseudo] = useState('');
  const [playerRegistered, setPlayerRegistered] = useState(false);
  const toastRef = useRef();

  const onButtonClick = () => {
    if (pseudo) {
      toastRef.current.show({ severity: 'info', summary: 'Succès', detail: `Joueur ${pseudo} enregistré` });
      setPlayerRegistered(true);
    } else {
      toastRef.current.show({ severity: 'error', summary: 'Erreur', detail: 'Merci de saisir un pseudo' });
    }
  };

  if (playerRegistered) {
    return <GameForm pseudo={pseudo} />;
  }

  return (
    <div className="player-form">
      <Toast ref={toastRef} />
      <h1>Jeu du punto</h1>
      <span className="p-float-label">
        <InputText id="pseudo" value={pseudo} onChange={(e) => setPseudo(e.target.value)} />
        <label htmlFor="pseudo">Pseudo</label>
        </span>
        <Button className='button' type="button" label="Valider" onClick={onButtonClick} />
    </div>
  );
}

export default PlayerForm;
