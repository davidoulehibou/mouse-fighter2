// Game1.jsx
import { useCallback, useState, useEffect } from "react";
import GameCanvas from "./GameCanvas";

const Game2 = ({ gameData }) => {
  const handleCanvasReady = useCallback((canvas, windowSize) => {
    const ctx = canvas.getContext("2d");
    ctx.font = "100px Dongle";
    ctx.textAlign = "center";
    ctx.fillText(gameData.gameCanvas.infos.mot, windowSize.width / 2, 110);
  }, []);

  return (
    <GameCanvas
      onReady={handleCanvasReady}
      title="Écrivez le mot :"
      gameData={gameData}
    />
  );
};

export default Game2;
