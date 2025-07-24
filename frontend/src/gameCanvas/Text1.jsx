// Game1.jsx
import { useCallback, useEffect, useRef, useState } from "react";
import GameCanvas from "./GameCanvas";

const Text1 = ({ gameInfos }) => {
  const { gameData, setDead, mousePosition, playerId, playersInfos } =
    gameInfos;
  const playerInfos = playersInfos.find((obj) => obj.id === playerId);

  useEffect(() => {
    if (playerInfos) {
      if (playerInfos.text.includes(gameData.infos.mot)) {
        setDead(false);
      }
    }
  }, [playerInfos]);

  const handleCanvasReady = useCallback((canvas, windowSize) => {
    const ctx = canvas.getContext("2d");
    ctx.font = "100px Dongle";
    ctx.textAlign = "center";
    ctx.fillText(gameData.infos.mot, windowSize.width / 2, 110);
  }, []);

  return (
    <GameCanvas
      onReady={handleCanvasReady}
      title="Écrivez le mot :"
      gameData={gameData}
    />
  );
};

export default Text1;
