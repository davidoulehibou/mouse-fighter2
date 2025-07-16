import { useState, useEffect } from "react";
import Connect from "./Connect";
import CanvasMouses from "./CanvasMouses";
import Overlay from "./utils/Overlay";
import "./App.css";
import PlayerList from "./PlayerList";
import Game1 from "./gameCanvas/Game1";

function Index() {
  const [pseudo, setPseudo] = useState(null);
  const [error, setError] = useState(null);
  const [positions, setPositions] = useState({
    joueur1: {
      status: "off",
      x: 0,
      y: 0,
    },
  });
  const [gameData, setGameData] = useState({});

  useEffect(() => {
    const cookies = document.cookie.split("; ");
    const pseudoCookie = cookies.find((row) => row.startsWith("pseudo="));
    if (pseudoCookie) {
      const savedPseudo = pseudoCookie.split("=")[1];
      setPseudo(decodeURIComponent(savedPseudo));
    }
  }, []);

  useEffect(() => {
    const socket = new WebSocket(import.meta.env.VITE_WEB_SOCKET);

    socket.onopen = () => {
      console.log("WebSocket connecté");
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        setPositions(data.positions);
        if (data.game) {
          setGameData(data.game);
        }
      } catch (e) {
        console.error("Erreur lors du parsing WebSocket :", e);
      }
    };

    socket.onerror = (err) => {
      console.error("WebSocket erreur:", err);
    };

    socket.onclose = (event) => {
      console.log("WebSocket fermé", event.code, event.reason);
    };

    const handleBeforeUnload = () => {
      if (pseudo) {
        socket.close(4000, pseudo);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      socket.close(4000, pseudo);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [pseudo]);

  useEffect(() => {
    if (!pseudo) return;
    setError(null);

    const checkIfPlayerExists = async () => {
      try {
        const response = await fetch(
          `${
            import.meta.env.VITE_URL
          }/api/isplayerexist?name=${pseudo.toLowerCase()}`
        );
        const text = await response.text();
        console.log("Contenu brut de la réponse :", text);

        const result = JSON.parse(text);
        if (result.exists) {
          setError("exists");
        } else {
          createPlayer(pseudo);
        }
      } catch (err) {
        console.error("Erreur lors de l'appel API:", err);
      }
    };

    checkIfPlayerExists();
  }, [pseudo]);

  async function createPlayer(pseudoName) {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_URL}/api/createPlayer?name=${pseudoName}`
      );
      const text = await response.text();
      console.log("Contenu brut de la réponse :", text);

      const result = JSON.parse(text);

      console.log(result);
      if (!result.success) {
        setError("full");
      }
    } catch (err) {
      console.error("Erreur lors de l'appel API:", err);
    }
  }

  const handlePseudo = (pseudo) => {
    setPseudo(pseudo);
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
    clearPseudo();
  };

  const clearPseudo = () => {
    document.cookie = "pseudo=; max-age=0";
    setPseudo(null);
  };

  const gamesMap = {
    game1: <Game1 gameData={gameData ? gameData : null}/>,
  };

  return (
    <>
    {gameData.status == "play" && gamesMap[gameData.gameCanvas.type]}
    
      <CanvasMouses positions={positions} playerId={pseudo} gameStatus={gameData.status}/>
      <PlayerList positions={positions} pseudo={pseudo} />
      
      {!error && pseudo ? (
        <Overlay handleNewPseudo={handleNewPseudo} gameData={gameData} />
      ) : (
        <Connect handlePseudo={handlePseudo} error={error} />
      )}
    </>
  );
}

export default Index;
