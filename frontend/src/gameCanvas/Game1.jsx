// Game1.jsx
import { useCallback } from "react";
import GameCanvas from "./GameCanvas";

const Game1 = ({ infos }) => {
  const handleCanvasReady = useCallback((canvas, windowSize) => {
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height); // Nettoyage

    ctx.beginPath();
    ctx.moveTo(
      infos.carre1.lt.x * windowSize.width,
      infos.carre1.lt.y * windowSize.height
    );
    ctx.lineTo(
      infos.carre1.rt.x * windowSize.width,
      infos.carre1.rt.y * windowSize.height
    );
    ctx.lineTo(
      infos.carre1.rb.x * windowSize.width,
      infos.carre1.rb.y * windowSize.height
    );
    ctx.lineTo(
      infos.carre1.lb.x * windowSize.width,
      infos.carre1.lb.y * windowSize.height
    );
    ctx.closePath();

    ctx.fillStyle = infos.carre1.color;
    ctx.fill();
  }, [infos]);

  return <GameCanvas onReady={handleCanvasReady} />;
};

export default Game1;
