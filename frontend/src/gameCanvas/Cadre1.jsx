// Game1.jsx
import { useCallback, useEffect } from "react";
import GameCanvas from "./GameCanvas";
import { useState } from "react";

const Cadre1 = ({ gameInfos }) => {
  const { gameData, setDead, mousePosition, playerId, playersInfos } = gameInfos;
  const GameInfos = gameData.infos;
  const [infos, setInfos] = useState(GameInfos);
  const [directions, setDirections] = useState({
    x: gameData.infos.dir.x,
    y: gameData.infos.dir.y,
  });

  const [playersClicks, setPlayersClicks] = useState([]);

  const invertDirections = (dir) => {
    if (dir == "x") {
      setDirections((prev) => ({
        x: prev.x * -1,
        y: prev.y,
      }));
    } else if (dir == "y") {
      setDirections((prev) => ({
        x: prev.x,
        y: prev.y * -1,
      }));
    }
  };

  useEffect(() => {
    let tempPlayersClicks = playersInfos
      .filter((player) => player.click)
      .map((player) => ({ id: player.id, x: player.x, y: player.y }));
    setPlayersClicks(tempPlayersClicks);
  }, [playersInfos]);

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

      if (infos.carre1.x2 >= 1 || infos.carre1.x <= 0) {
        invertDirections("x");
        let newInfos = {
          ...infos,
          carre1: {
            x: infos.carre1.x - directions.x,
            x2: infos.carre1.x2 - directions.x,
            y: infos.carre1.y - directions.y,
            y2: infos.carre1.y2 - directions.y,
          },
        };
        setInfos(newInfos);
      } else if (infos.carre1.y2 >= 1 || infos.carre1.y <= 0) {
        invertDirections("y");
        let newInfos = {
          ...infos,
          carre1: {
            x: infos.carre1.x - directions.x,
            x2: infos.carre1.x2 - directions.x,
            y: infos.carre1.y - directions.y,
            y2: infos.carre1.y2 - directions.y,
          },
        };
        setInfos(newInfos);
      } else {
        let vitesse = playersClicks.length/playersInfos.length
        console.log(vitesse)
        let newInfos = {
          ...infos,
          carre1: {
            x: infos.carre1.x + directions.x * vitesse,
            x2: infos.carre1.x2 + directions.x * vitesse,
            y: infos.carre1.y + directions.y * vitesse,
            y2: infos.carre1.y2 + directions.y * vitesse,
          },
        };
        setInfos(newInfos);
      }

      ctx.fillStyle = color;
      ctx.fill();
    },
    [GameInfos, playersClicks]
  );

  return (
    <GameCanvas
      onReady={handleCanvasReady}
      title="Restez dans le cadre !"
      subTitle="Cliquez pour le faire bouger"
      gameData={gameData}
    />
  );
};

export default Cadre1;
