import { useState } from "react";

function Connect({ handlePseudo }) {
  const [pseudo, setPseudo] = useState("");
  const [exists, setExists] = useState(null); // null = pas encore testé
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pseudo.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_URL
        }/api/isplayerexist?name=${pseudo.toLowerCase()}`
      );
      const text = await response.text();
      console.log("Contenu brut de la réponse :", text);

      const result = JSON.parse(text);
      if(!result.exists){
        handlePseudo(pseudo.toLowerCase())
      }
      setExists(true);
    } catch (err) {
      console.error("Erreur lors de l'appel API:", err);
      setExists(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
      className="pseudo"
        type="text"
        value={pseudo}
        onChange={(e) => setPseudo(e.target.value)}
        placeholder="Entrez votre pseudo"
      />
      <button type="submit" className="connecter">Se connecter</button>
      {loading && <>Chargement</>}
      {exists == true && <p>le joueur existe déjà</p>}
    </form>
  );
}

export default Connect;
