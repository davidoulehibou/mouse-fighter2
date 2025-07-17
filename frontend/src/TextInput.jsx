import React, { useState, useEffect, useRef } from "react";

const TextInput = ({ joueur }) => {
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
      const currentText = text;
      setText("");
      try {
        await fetch(
          `${
            import.meta.env.VITE_URL
          }/api/settext?joueur=${joueur}&text=${encodeURIComponent(
            currentText
          )}`
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
      className="chat"
      ref={inputRef}
      type="text"
      value={text}
      placeholder={joueur}
      onKeyDown={handleKeyDown}
      onChange={handleText}
    />
  );
};

export default TextInput;
