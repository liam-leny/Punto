import React, { useState, useRef, useEffect } from "react";
import GameBoard from "./GameBoard";
import "./Form.css";

import axios from "axios";
import io from "socket.io-client";
import distributeCards from "./gameUtils";

import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";

function GameForm(props) {
  const [tabCreate, setTabCreate] = useState(false);
  const [tabJoin, setTabJoin] = useState(false);
  const [roundNumber, setRoundNumber] = useState(2);
  const [roundId, setRoundId] = useState(null);
  const [playersId, setPlayersId] = useState([]);
  const [players, setPlayers] = useState([]);
  const [id, setId] = useState(undefined);
  const [gameLaunch, setGameLaunch] = useState(false);
  const [cards, setCards] = useState([players.length]);
  const [currentCard, setCurrentCard] = useState(null);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [dbType] = useState(
    props.database === "MongoDB"
      ? "NoSQL"
      : props.database === "Neo4j"
      ? "Graph"
      : "Relationnel"
  );

  const toastRef = useRef();
  const socket = useRef(null);

  useEffect(() => {
    socket.current = io("http://localhost:5000");
    socket.current.on("newPlayer", (data) => {
      console.log(`Nouveau joueur rejoint : ${data.pseudo}`);
      addNewPlayer(data.playerId, data.pseudo);
      console.log(players);
    });

    socket.current.on("gameStarted", (data) => {
      setCards(data.cards);
      setPlayers(data.players);
      setCurrentCard(data.currentCard);
      setCurrentPlayer(data.currentPlayer);
      setPlayersId(data.playersId);
      setRoundId(data.roundId);
      setRoundNumber(data.roundNumber);
      setGameLaunch(true);
    });

    return () => {
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, []);

  /**
   * Permet de modifier la page lorsque l'utilisateur va cliquer sur le bouton permettant de créer une partie
   * Une clé primaire sera générée par la bdd et affichée pour que l'hôte puisse la communiquer aux autres joueurs souhaitant rejoindre la partie
   */
  const tabCreateGame = async () => {
    let gameId;
    if (dbType === "Relationnel") {
      try {
        const response = await axios.post("http://localhost:5000/api/game", {
          pseudo: props.pseudo,
          round_number: roundNumber,
        });
        gameId = response.data.game_id;
        const playerId = response.data.player_id;
        addNewPlayer(playerId, props.pseudo);
      } catch (error) {
        console.error("Erreur lors de la création de la partie :", error);
      }
    } else if (dbType === "NoSQL") {
      const response = await axios.post(
        "http://localhost:5000/api/mongo/game",
        {
          round_number: roundNumber,
        }
      );
      gameId = response.data;
      addNewPlayer(undefined, props.pseudo);
    } else {
      try {
        const response = await axios.post(
          "http://localhost:5000/api/neo4j/game",
          {
            pseudo: props.pseudo,
            round_number: roundNumber,
          }
        );
        gameId = response.data.game_id;
        setRoundId(response.data.round_id)
        const playerId = response.data.player_id;
        addNewPlayer(playerId, props.pseudo);
      } catch (error) {
        console.error("Erreur lors de la requête Axios :", error);
      }
    }
    socket.current.emit("joinRoom", gameId);
    setId(gameId);
    setTabJoin(false);
    setTabCreate(true);
  };

  /**
   * Ajoute un nouveau joueur dans le tableau stockant tous les pseudos et dans celui stockant tous les id
   * @param {*} playerId Id du nouveau joueur
   * @param {*} pseudo Pseudo du nouveau joueur
   */
  const addNewPlayer = (playerId, pseudo) => {
    console.log(pseudo);
    setPlayers((prevPlayers) => [...prevPlayers, pseudo]);
    setPlayersId((prevPlayersId) => [...prevPlayersId, playerId]);
  };

  /**
   * Permet de modifier la page lorsque l'utilisateur va cliquer sur le bouton permettant de rejoindre une partie
   */
  const tabJoinGame = () => {
    setTabCreate(false);
    setTabJoin(true);
  };

  /**
   * Permet à un joueur de rejoindre une partie
   */
  const joinGame = async () => {
    if (id) {
      // toastRef.current.show({ severity: 'info', summary: 'Recherche', detail: `Vérification de l'existence de la partie` });
      if (dbType === "Relationnel") {
        try {
          socket.current.emit("joinRoom", Number(id));
          const response = await axios.post(
            `http://localhost:5000/api/game/${id}/join`,
            {
              pseudo: props.pseudo,
            }
          );
          const playerId = response.data.player_id;
          socket.current.emit("newPlayer", {
            id: Number(id),
            pseudo: props.pseudo,
            playerId: playerId,
          });
        } catch (error) {
          console.error("Erreur lors de la participation à la partie :", error);
        }
      } else if (dbType === "Graph") {
        try {
          socket.current.emit("joinRoom", Number(id));
          const response = await axios.post(
            `http://localhost:5000/api/neo4j/game/${id}/join`,
            {
              pseudo: props.pseudo,
            }
          );
          const playerId = response.data.player_id;
          socket.current.emit("newPlayer", {
            id: Number(id),
            pseudo: props.pseudo,
            playerId: playerId,
          });
        } catch (error) {
          console.error("Erreur lors de la participation à la partie :", error);
        }
      } else {
        socket.current.emit("joinRoom", id);
        socket.current.emit("newPlayer", {
          id: id,
          pseudo: props.pseudo,
          playerId: undefined,
        });
      }
    } else {
      toastRef.current.show({
        severity: "error",
        summary: "Erreur",
        detail: "Merci de saisir un code de partie",
      });
    }
  };

  /**
   * Permet à l'hôte de démarrer une partie
   */
  const launchGame = async () => {
    // Erreur si l'hôte tente de lancer une partie à 1 joueur
    if (players.length === 1) {
      toastRef.current.show({
        severity: "info",
        summary: "Partie impossible",
        detail: "Le jeu ne possède pas de version solo",
      });
    } else {
      console.log("launchGame", id);
      const cards = distributeCards(players.length);
      if (id) {
        if (dbType === "Relationnel") {
          const response = await axios.post(
            `http://localhost:5000/api/round/`,
            {
              current_round_number: 0,
              game_id: id,
            }
          );
          roundId = response.data.round_id;
          setRoundId(roundId)
        }
        socket.current.emit("startGame", {
          id: id,
          cards: cards,
          players: players,
          playersId: playersId,
          roundId: roundId,
          roundNumber: roundNumber,
        });
      } else {
        console.error("Erreur: id n'est pas défini");
      }
    }
  };

  if (gameLaunch) {
    return (
      <GameBoard
        players={players}
        playersId={playersId}
        pseudo={props.pseudo}
        roundNumber={roundNumber}
        roundId={roundId}
        gameId={id}
        cards={cards}
        currentCard={currentCard}
        currentPlayer={currentPlayer}
        dbType={dbType}
      />
    );
  }

  return (
    <div className="player-form">
      <Toast ref={toastRef} />
      <h1>Jeu du punto</h1>
      <h2>Bienvenue {props.pseudo} !</h2>
      {tabCreate ? (
        <Button
          className="button"
          type="button"
          label="Créer une partie"
          disabled
        />
      ) : (
        <Button
          className="button"
          type="button"
          label="Créer une partie"
          onClick={tabCreateGame}
        />
      )}
      {tabJoin ? (
        <Button
          className="button"
          type="button"
          label="Rejoindre une partie"
          disabled
        />
      ) : (
        <Button
          className="button"
          type="button"
          label="Rejoindre une partie"
          onClick={tabJoinGame}
        />
      )}
      <div>
        {tabCreate && (
          <div>
            <h3>Choisissez le nombre de manche de la partie </h3>
            <InputNumber
              value={roundNumber}
              onValueChange={(e) => setRoundNumber(e.value)}
              mode="decimal"
              showButtons
              min={2}
              max={10}
            />
            <h3>Partagez ce code avec vos amis : </h3>
            <h1>{id}</h1>
            <h3>
              Liste des joueurs présents dans cette partie :{" "}
              {players.join(", ")}{" "}
            </h3>
            <Button
              className="button"
              type="button"
              label="Lancer la partie"
              onClick={launchGame}
            />
          </div>
        )}
        {tabJoin && (
          <div>
            <h3>Saisissez le code de la partie : </h3>
            <span className="p-float-label">
              <InputText
                id="id"
                value={id}
                onChange={(e) => setId(e.target.value)}
              />
              <label htmlFor="id"></label>
            </span>
            <h3>Merci d'attendre que l'hôte lance la partie</h3>
            <Button
              className="button"
              type="button"
              label="Rejoindre la partie"
              onClick={joinGame}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default GameForm;
