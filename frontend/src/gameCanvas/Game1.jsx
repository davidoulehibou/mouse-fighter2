// Game1.jsx
import { useCallback, useState, useEffect } from "react";
import GameCanvas from "./GameCanvas";

const Game1 = ({ gameData }) => {
  const [mousePosition, setMousePosition] = useState({
    x: 0,
    y: 0,
  });

  const infos = gameData.gameCanvas.infos

  useEffect(() => {
    // Mettre à jour la position de la souris
    const handleMouseMove = (event) => {
      setMousePosition({
        x: event.clientX,
        y: event.clientY,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const handleCanvasReady = useCallback(
    (canvas, windowSize) => {
      const ctx = canvas.getContext("2d");

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      let radius = 15;

      ctx.beginPath();
      ctx.moveTo(
        infos.carre1.x * windowSize.width + radius,
        infos.carre1.y * windowSize.height
      );

      ctx.lineTo(
        infos.carre1.x2 * windowSize.width - radius,
        infos.carre1.y * windowSize.height
      );

      ctx.quadraticCurveTo(
        infos.carre1.x2 * windowSize.width,
        infos.carre1.y * windowSize.height,
        infos.carre1.x2 * windowSize.width,
        infos.carre1.y * windowSize.height + radius
      );

      ctx.lineTo(
        infos.carre1.x2 * windowSize.width,
        infos.carre1.y2 * windowSize.height - radius
      );

      ctx.quadraticCurveTo(
        infos.carre1.x2 * windowSize.width,
        infos.carre1.y2 * windowSize.height,
        infos.carre1.x2 * windowSize.width - radius,
        infos.carre1.y2 * windowSize.height
      );

      ctx.lineTo(
        infos.carre1.x * windowSize.width + radius,
        infos.carre1.y2 * windowSize.height
      );

      ctx.quadraticCurveTo(
        infos.carre1.x * windowSize.width,
        infos.carre1.y2 * windowSize.height,
        infos.carre1.x * windowSize.width,
        infos.carre1.y2 * windowSize.height - radius
      );

      ctx.lineTo(
        infos.carre1.x * windowSize.width,
        infos.carre1.y * windowSize.height + radius
      );

      ctx.quadraticCurveTo(
        infos.carre1.x * windowSize.width,
        infos.carre1.y * windowSize.height,
        infos.carre1.x * windowSize.width + radius,
        infos.carre1.y * windowSize.height 
      );

      ctx.closePath();

      let color = "#ff2e1350";

      if (
        mousePosition.x > infos.carre1.x * windowSize.width &&
        mousePosition.x < infos.carre1.x2 * windowSize.width &&
        mousePosition.y > infos.carre1.y * windowSize.height &&
        mousePosition.y < infos.carre1.y2 * windowSize.height
      ) {
        color = "#07ff8b50";
      }

      ctx.fillStyle = color;
      ctx.fill();
    },
    [infos, mousePosition]
  );

  return (
    <GameCanvas onReady={handleCanvasReady} title="Restez dans le cadre !" gameData={gameData} />
  );
};

export default Game1;
