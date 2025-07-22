// Game1.jsx
import { useCallback, useEffect } from "react";
import GameCanvas from "./GameCanvas";

const Game1 = ({ gameInfos }) => {
  const { gameData, setDead, mousePosition, playerId, positions } = gameInfos;
  const infos = gameData.infos;



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
        setDead(false);
      } else {
        setDead(true);
      }

      ctx.fillStyle = color;
      ctx.fill();
    },
    [infos, mousePosition]
  );

  return (
    <GameCanvas
      onReady={handleCanvasReady}
      title="Restez dans le cadre !"
      gameData={gameData}
    />
  );
};

export default Game1;
