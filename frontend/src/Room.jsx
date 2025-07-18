import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const Room = ({ handleError }) => {
  const { param } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [players, setPlayers] = useState([]);

  const ws = new WebSocket(`ws://localhost:8080/?room=${param}`);

  ws.onmessage = (event) => {
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

  if (!room) return <p>Chargement...</p>;

  return (
    <ul>
      <li>Room : {room.roomcode || "sans nom"} </li>
      <li>status: {room.status}</li>
      <li>countdown : {room.countdown}</li>
    </ul>
  );
};

export default Room;
