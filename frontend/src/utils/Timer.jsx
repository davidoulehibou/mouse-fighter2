const Timer = ({ gameData }) => {
    const progress = gameData.countdown / gameData.gameCanvas.time;
  return (
    <>
      <svg viewBox="0 0 300 1" className="gameTimer">
        <rect
          width={(gameData.countdown / gameData.gameCanvas.time) * 300}
          height="1"
          fill={`hsl(${progress * 120}, 80%, 60%)`}
        />
      </svg>
    </>
  );
};

export default Timer;
