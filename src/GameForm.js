import React, { useState, useRef, useEffect } from 'react';
import GameBoard from './GameBoard';
import "./Form.css"

import axios from 'axios';
import io from 'socket.io-client';
import distributeCards from './gameUtils';


import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';

function GameForm(props) {
  const [tabCreate, setTabCreate] = useState(false);
  const [tabJoin, setTabJoin] = useState(false);
  const [roundNumber, setRoundNumber] = useState(2);
  const [players, setPlayers] = useState(new Array());
  const [id, setId] = useState(undefined);
  const [gameLaunch, setGameLaunch] = useState(false);
  const [cards, setCards] = useState(new Array(players.length));
  const [currentCard, setCurrentCard] = useState(null);
  const [currentPlayer, setCurrentPlayer] = useState(null);



  const toastRef = useRef();
  const socket = useRef(null);

  useEffect(() => {
    socket.current = io('http://localhost:5000');
    socket.current.on('newPlayer', (pseudo) => {
      console.log(`Nouveau joueur rejoint : ${pseudo}`);
      addNewPlayer(pseudo)
      console.log(players)
    });

    socket.current.on('gameStarted', (data) => {
      setCards(data.cards)
      setPlayers(data.players)
      setCurrentCard(data.currentCard)
      setCurrentPlayer(data.currentPlayer)
      setGameLaunch(true);
    });

    return () => {
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, []);


  const tabCreateGame = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/partie', {
        pseudo: props.pseudo,
        nombre_de_manches: roundNumber,
        duree: null,
      });
      const partieId = response.data.partie_id;
      socket.current.emit('joinRoom', partieId);
      setId(partieId)
      setTabJoin(false);
      setTabCreate(true);
    } catch (error) {
      console.error('Erreur lors de la création de la partie :', error);
    }
  };


  const addNewPlayer = (pseudo) => {
    console.log(pseudo)
    setPlayers(prevPlayers => [...prevPlayers, pseudo]);
  };

  const tabJoinGame = () => {
    setTabCreate(false);
    setTabJoin(true);
  };

  const joinGame = async () => {
    if (id) {
      // toastRef.current.show({ severity: 'info', summary: 'Recherche', detail: `Vérification de l'existence de la partie` });
      try {
        socket.current.emit('joinRoom', Number(id));
        const response = await axios.post(`http://localhost:5000/api/partie/${id}/join`, {
          pseudo: props.pseudo,
        });
        socket.current.emit('newPlayer', { id: Number(id), pseudo: props.pseudo });
      } catch (error) {
        console.error('Erreur lors de la participation à la partie :', error);
      }
    } else {
      toastRef.current.show({ severity: 'error', summary: 'Erreur', detail: 'Merci de saisir un code de partie' });
    }
  };

  const launchGame = () => {
    // Erreur si l'hôte tente de lancer une partie à 1 joueur
    console.log(players)
    if (players.length === 0) {
      toastRef.current.show({ severity: 'info', summary: 'Partie impossible', detail: 'Le jeu ne possède pas de version solo' });
    } else {
      console.log('launchGame', id)
      const cards = distributeCards(players.length + 1)
      if (id) {
        console.log(cards)
        console.log(players)
        console.log(id)
        const tempPlayers = [...players].concat(props.pseudo)
        socket.current.emit('startGame', { id: id, cards: cards, players: tempPlayers });
      } else {
        console.error('Erreur: id n\'est pas défini');
      }
    }
  };

  if (gameLaunch) {
    return <GameBoard players={players} pseudo={props.pseudo} roundNumber={roundNumber} partie_id={id} cards={cards} currentCard={currentCard} currentPlayer={currentPlayer} />;
  }

  return (
    <div className="player-form">
      <Toast ref={toastRef} />
      <h1>Jeu du punto</h1>
      <h2>Bienvenue {props.pseudo} !</h2>
      {tabCreate ? (
        <Button className='button' type="button" label="Créer une partie" disabled />
      ) : (
        <Button className='button' type="button" label="Créer une partie" onClick={tabCreateGame} />
      )}
      {tabJoin ? (
        <Button className='button' type="button" label="Rejoindre une partie" disabled />
      ) : (
        <Button className='button' type="button" label="Rejoindre une partie" onClick={tabJoinGame} />
      )}
      <div>
        {tabCreate &&
          <div>
            <h3>Choisissez le nombre de manche de la partie </h3>
            <InputNumber value={roundNumber} onValueChange={(e) => setRoundNumber(e.value)} mode="decimal" showButtons min={2} max={10} />
            <h3>Partagez ce code avec vos amis :  </h3>
            <h1>{id}</h1>
            <h3>Liste des joueurs présents dans cette partie : {players.join(', ')} </h3>
            <Button className='button' type="button" label="Lancer la partie" onClick={launchGame} />
          </div>
        }
        {tabJoin &&
          <div>
            <h3>Saisissez le code de la partie :  </h3>
            <span className="p-float-label">
              <InputText id="id" value={id} onChange={(e) => setId(e.target.value)} />
              <label htmlFor="id"></label>
            </span>
            <h3>Merci d'attendre que l'hôte lance la partie</h3>
            <Button className='button' type="button" label="Rejoindre la partie" onClick={joinGame} />
          </div>
        }
      </div>
    </div>
  );
}

export default GameForm;
