import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Connect from "./Connect";
import { useRef } from "react";
import CanvasMouses from "./CanvasMouses";
import Timer from "./utils/Timer";
import PlayerList from "./PlayerList";
import TextInput from "./TextInput";

const Room = ({ handleError }) => {
  const { param } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [players, setPlayers] = useState([]);
  const [pseudo, setPseudo] = useState(null);
  const [playerId, setPlayerId] = useState(null);
  const [error, setError] = useState(null);

  const ws = useRef(null);

  useEffect(() => {
    ws.current = new WebSocket(
      `${import.meta.env.VITE_WEB_SOCKET}?room=${param}`
    );

    ws.current.onopen = () => {
      console.log("WebSocket connecté");
      ws.current.send(JSON.stringify({ type: "get-room" }));
    };

    ws.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "room-update") {
        const roomData = message.roomData;

        setRoom(roomData.room);

      } else if (message.type === "players-positions") {

        setPlayers(message.players)

      } else if (message.type === "error") {
        handleError(message.error);
        navigate("/");
      }
    };

    ws.current.onerror = (err) => console.error("Erreur WebSocket :", err);
    ws.current.onclose = () => console.warn("WebSocket fermé");

    const handleDisconnect = () => {
      if (playerId && ws.current?.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify({ type: "disconnect", playerId }));
      }
    };

    const handleBeforeUnload = (e) => {
      handleDisconnect();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      handleDisconnect();
      if (
        ws.current?.readyState === WebSocket.OPEN ||
        ws.current?.readyState === WebSocket.CONNECTING
      ) {
        ws.current.close(4000, playerId);
      }
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [param, playerId]);

  const handleMouseMove = (x, y) => {
    if (ws.current?.readyState === WebSocket.OPEN && playerId) {
      ws.current.send(
        JSON.stringify({
          type: "update-position",
          playerId,
          x,
          y,
          room: param,
        })
      );
    }
  };

  const handlePseudo = async (pseudo) => {
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_URL
        }/api/createPlayer?room=${param}&name=${pseudo}`
      );
      let result = await response.text();
      let message = JSON.parse(result);

      if (!message.success) {
        console.log("ça a pas marché");
        setError("full");
      } else {
        console.log(message.playerId);
        setPlayerId(message.playerId);
        setPseudo(pseudo);
      }
    } catch (err) {
      console.error("Erreur lors de l'appel API:", err);
    }
  };

  if (!room) return <p>Chargement...</p>;

  return (
    <>
      <CanvasMouses
        gameData={room}
        pseudo={pseudo}
        playerId={playerId}
        positions={players}
        handleMouseMove={handleMouseMove}
      />
      <PlayerList positions={players} pseudo={pseudo} />
      <Timer gameData={room} />
      {!playerId && <Connect handlePseudo={handlePseudo} error={error} />}
      {playerId && <TextInput joueur={playerId} roomCode={param} />}
    </>
  );
};

export default Room;
