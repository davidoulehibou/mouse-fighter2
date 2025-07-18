import { useState } from "react";

function Connect({ handlePseudo, error }) {
  const [pseudo, setPseudo] = useState("");

  const handleChange = (e) => {
    const input = e.target.value;
    const validInput = input.replace(/[^a-zA-ZÀ-ÿ0-9]/g, "");
    setPseudo(validInput);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pseudo.trim()) return;
    handlePseudo(pseudo.toLowerCase());
  };

  return (
    <div className="from-fond">
      <form onSubmit={handleSubmit}>
        <h1>Connexion</h1>
        <input
          className="pseudo"
          type="text"
          value={pseudo}
          onChange={handleChange}
          placeholder="Entrez votre pseudo"
          maxLength="20"
        />
        <button type="submit">
          Se connecter
        </button>
        {error === "exists" && <p className="error">Le joueur existe déjà</p>}
        {error === "full" && <p className="error">Il y a déjà trop de monde</p>}
      </form>
    </div>
  );
}

export default Connect;
