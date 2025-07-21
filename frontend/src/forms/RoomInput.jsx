// Home.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function RoomInput({error}) {
  const [inputValue, setInputValue] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      navigate(`/${inputValue}`);
    }
  };

  const createRandomRoom = async() => {
    const randomId = Math.floor(100000 + Math.random() * 900000);
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_URL
        }/api/createRoom?room=${randomId}`
      );
      let result = await response.text();
    } catch (err) {
      console.error("Erreur lors de l'appel API:", err);
    }

    navigate(`/${randomId}`);
  };

  return (
    <form onSubmit={handleSubmit}>
      <button type="button" onClick={createRandomRoom}>
        Créer une Room
      </button>
      <p>ou</p>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Code de la room"
      />
      <input type="submit" value="Entrer" />
      {error && <p>{error}</p>}
    </form>
  );
}

export default RoomInput;
