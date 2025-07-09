import React, { useState, useEffect, useRef } from "react";

const TextInput = ({ joueur, name }) => {
  const [text, setText] = useState("");
  const inputRef = useRef(null);
  

  useEffect(() => {
    const handleGlobalKeyDown = () => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);

    return () => {
      window.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, []);

  const handleKeyDown = async (event) => {
    if (event.key === "Enter") {
      console.log("Entrée pressée");
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
    <>{name && <input
    className="chat"
      ref={inputRef}
      type="text"
      value={text}
      
      placeholder={`parler en tant que ${name.charAt(0).toUpperCase() + String(name).slice(1)}`}
      onKeyDown={handleKeyDown}
      onChange={handleText}
    />}
    
    </>
  );
};

export default TextInput;
