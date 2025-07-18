import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Connect from "./Connect";
import { useRef } from "react";
import CanvasMouses from "./CanvasMouses";

const Room = ({ handleError }) => {
  const { param } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [players, setPlayers] = useState([]);
  const [pseudo, setPseudo] = useState(null);
  const [playerId, setPlayerId] = useState(null)
  const [error, setError] = useState(null);

  const ws = useRef(null);

  useEffect(() => {
    ws.current = new WebSocket(`ws://localhost:8080/?room=${param}`);

    ws.current.onopen = () => {
      console.log("WebSocket connecté");
      ws.current.send(JSON.stringify({ type: "get-room" }));
    };

    ws.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "room-update") {
        const roomData = message.roomData;
        setRoom(roomData.room);
        setPlayers(roomData.players);
      } else if (message.type === "error") {
        handleError(message.error);
        navigate("/");
      }
    };

    ws.current.onerror = (err) => console.error("Erreur WebSocket :", err);
    ws.current.onclose = () => console.warn("WebSocket fermé");

    return () => {
      ws.current.close(); // Clean up à la sortie du composant
    };
  }, [param]);

  const handlePseudo = async (pseudo) => {

    try {
      const response = await fetch(
        `${import.meta.env.VITE_URL}/api/createPlayer?room=${param}&name=${pseudo}`
      );
      let result = await response.text();
      let message = JSON.parse(result)

      if (!message.success) {
        console.log("ça a pas marché");
        setError("full");
      } else {
        console.log(message.playerId);
        setPlayerId(message.playerId);
        setPseudo(pseudo)
      }
    } catch (err) {
      console.error("Erreur lors de l'appel API:", err);
    }

  };

  if (!room) return <p>Chargement...</p>;



  return (
    <>
      <CanvasMouses gameData={room} pseudo={pseudo} playerId={playerId} positions={players} />
      <ul>
        {pseudo && <li>{pseudo}</li>}
        <li>Room : {room.roomcode || "sans nom"} </li>
        <li>status: {room.status}</li>
        <li>countdown : {room.countdown}</li>
        {!playerId && <Connect handlePseudo={handlePseudo} error={error}/>}
      </ul>
    </>
  );
};

export default Room;
