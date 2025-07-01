import { useState, useEffect, useRef } from "react";
import "./App.css";
import Canvas from "./Canvas";

function App() {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const [mousePosition, setMousePosition] = useState({
    x: 0,
    y: 0,
  });

  const [randId, setRandId] = useState(
    Math.floor(Math.random() * 89999) + 10000
  );

  const [numJoueur, setNumJoueur] = useState(0);

  const [positions, setPositions] = useState({
    joueur1: {
      status: "off",
      x: 0,
      y: 0,
    },
  });

  const hasSetNumJoueur = useRef(false);

  useEffect(() => {
    const socket = new WebSocket(import.meta.env.VITE_WEB_SOCKET);

    socket.onopen = () => {
      console.log("WebSocket connecté");
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setPositions(data);
      if (!hasSetNumJoueur.current) {
        for (const key of Object.keys(data)) {
          if (data[key].status === "off") {
            setNumJoueur(key);
            hasSetNumJoueur.current = true;
            console.log("numJoueur défini:", key);
            handleSetX(key, 0, 0, randId);
            break;
          }
        }
      }
    };

    socket.onerror = (err) => {
      console.error("WebSocket erreur:", err);
    };

    socket.onclose = (event) => {
      console.log("WebSocket fermé", event.code, event.reason);
    };

    // Ajout pour gérer unload / refresh / fermeture d’onglet
    const handleBeforeUnload = () => {
      socket.close(4000, randId.toString());
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      socket.close(4000, randId.toString());
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    // Mettre à jour la taille de la fenêtre
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    // Mettre à jour la position de la souris
    const handleMouseMove = (event) => {
      setMousePosition({
        x: event.clientX,
        y: event.clientY,
      });
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  useEffect(() => {
    handleSetX(
      numJoueur,
      mousePosition.x / windowSize.width,
      mousePosition.y / windowSize.height,
      randId
    );
  }, [windowSize, mousePosition]);

  const handleSetX = async (joueur, x, y, status) => {
    if (numJoueur) {
      try {
        await fetch(
          `${
            import.meta.env.VITE_URL
          }/api/set-x?joueur=${joueur}&x=${x}&y=${y}&status=${status}`
        );
      } catch (err) {
        console.error("Erreur appel HTTP:", err);
      }
    }
  };

  return (
    <div style={{ position: "relative", height: "100vh", overflow: "hidden" }}>
      <Canvas positions={positions} windowSize={windowSize} />
      <div style={{ position: "relative", zIndex: 1, padding: "1rem" }}>
        <h1>{numJoueur}</h1>
        <p>
          joueurs en ligne :{" "}
          {Object.keys(positions)
            .filter((joueur) => positions[joueur].status !== "off")
            .map((joueur) => (
              <span key={joueur}>
                {joueur}: {positions[joueur].color}{" "}
              </span>
            ))}
        </p>

        <p>Largeur : {windowSize.width}px</p>
        <p>Hauteur : {windowSize.height}px</p>
        <p>
          Position souris : X = {mousePosition.x}px, Y = {mousePosition.y}px
        </p>
        <p>
          Position relatives : X = {mousePosition.x / windowSize.width}px, Y ={" "}
          {mousePosition.y / windowSize.height}px
        </p>
        <h1>
          x={positions.joueur1.x} y={positions.joueur1.y}
        </h1>
      </div>
    </div>
  );
}

export default App;
