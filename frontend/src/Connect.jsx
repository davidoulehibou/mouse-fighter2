import { useState } from "react";

function Connect({ handlePseudo, error }) {
  const [pseudo, setPseudo] = useState("");

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
          onChange={(e) => setPseudo(e.target.value)}
          placeholder="Entrez votre pseudo"
          maxlength="20"
        />
        <button type="submit" className="bouton">
          Se connecter
        </button>
        {error == "exists" && <p className="error">le joueur existe déjà</p>}
        {error == "full" && <p className="error">Il y a déjà trop de monde</p>}
        <p>En te connectant, tu acceptes les cookies mais bon ça va c'est juste le
        nom du joueur qu'est enregistré</p>
      </form>
    </div>
  );
}

export default Connect;
