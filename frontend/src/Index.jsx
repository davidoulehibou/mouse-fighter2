import { useState, useEffect } from "react";
import App from "./App";
import Connect from "./Connect";

function Index() {
  const [pseudo, setPseudo] = useState(null);
  const [existe, setExiste] = useState(false)

  // ✅ Lire le cookie au chargement
  useEffect(() => {
    const cookies = document.cookie.split("; ");
    const pseudoCookie = cookies.find((row) => row.startsWith("pseudo="));
    if (pseudoCookie) {
      const savedPseudo = pseudoCookie.split("=")[1];
      setPseudo(decodeURIComponent(savedPseudo));
    }
  }, []);

useEffect(() => {
  if (!pseudo) return;

  const checkIfPlayerExists = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_URL}/api/isplayerexist?name=${pseudo.toLowerCase()}`
      );
      const text = await response.text();
      console.log("Contenu brut de la réponse :", text);

      const result = JSON.parse(text);
      if (result.exists) {
        setExiste(true)
      }
    } catch (err) {
      console.error("Erreur lors de l'appel API:", err);
    }
  };

  checkIfPlayerExists();
}, [pseudo]);

  const handlePseudo = (pseudo) => {
    setPseudo(pseudo);

    // ✅ Stocker le pseudo en cookie pendant 7 jours
    document.cookie = `pseudo=${encodeURIComponent(pseudo)}; path=/; max-age=${
      60 * 60 * 24 * 7
    }`;
  };

  const handleNewPseudo = async (numJoueur) => {
    try {
      await fetch(
        `${
          import.meta.env.VITE_URL
        }/api/set-x?joueur=${numJoueur}&x=0&y=0&status=off`
      );
    } catch (err) {
      console.error("Erreur appel HTTP:", err);
    }
    document.cookie = "pseudo=; max-age=0";
    setPseudo(null);
  };

  return (
    <>
    {existe ?<h1>Tu es déjà connecté dans une autre fenêtre</h1> : <>{pseudo ? (
        <App pseudo={pseudo} handleNewPseudo={handleNewPseudo} />
      ) : (
        <Connect handlePseudo={handlePseudo} />
      )}</>}
      
    </>
  );
}

export default Index;
