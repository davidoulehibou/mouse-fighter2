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

  const [joueur1, setJoueur1] = useState({x:0,y:0});

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8080");

    socket.onopen = () => {
      console.log("WebSocket connecté");
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.joueur1) {
        setJoueur1(data.joueur1);
      } else if (data.error) {
        console.error("Erreur du serveur:", data.error);
      }
    };

    socket.onerror = (err) => {
      console.error("WebSocket erreur:", err);
    };

    socket.onclose = () => {
      console.log("WebSocket fermé");
    };

    return () => {
      socket.close();
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

  useEffect(() =>{
    handleSetX(mousePosition.x/windowSize.width, mousePosition.y/windowSize.height)
  },[windowSize, mousePosition])


  

  const handleSetX = async (x, y) => {
    try {
      await fetch(`http://localhost:3000/set-x?x=${x}&y=${y}`);
    } catch (err) {
      console.error("Erreur appel HTTP:", err);
    }
  };


  return (
    <div style={{ position: "relative", height: "100vh", overflow: "hidden" }}>
      <Canvas positions={{joueur1:{x:joueur1.x, y:joueur1.y}}} windowSize={windowSize}/>
      <div style={{ position: "relative", zIndex: 1, padding: "1rem" }}>
        <h1>Test</h1>
        <p>Largeur : {windowSize.width}px</p>
        <p>Hauteur : {windowSize.height}px</p>
        <p>
          Position souris : X = {mousePosition.x}px, Y = {mousePosition.y}px
        </p>
        <p>
          Position relatives : X = {mousePosition.x / windowSize.width}px, Y ={" "}
          {mousePosition.y / windowSize.height}px
        </p>
        <h1>x={joueur1.x} y={joueur1.y}</h1>
      </div>
    </div>
  );
}

export default App;
