import React, { useState} from "react";

const TextInput = ({ joueur }) => {
  const [text, setText] = useState("");


  const handleKeyDown = async (event) => {

    

    if (event.key === "Enter") {
      console.log(`Entrée pressée`);
      setText("");
      try {
        await fetch(
          `${
            import.meta.env.VITE_URL
          }/api/settext?joueur=${joueur}&text=${text}`
        );
      } catch (err) {
        console.error("Erreur appel HTTP:", err);
      }
    }
  };

  const handleText = (event) => {
    setText(event.target.value);
  };

  return (
    <input
      type="text"
      value={text}
      placeholder={joueur}
      onKeyDown={handleKeyDown}
      onChange={handleText}
    />
  );
};

export default TextInput;
