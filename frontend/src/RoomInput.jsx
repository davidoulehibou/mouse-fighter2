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

  const createRandomRoom = () => {
    const randomId = Math.floor(100000 + Math.random() * 900000); // 6 chiffres
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
