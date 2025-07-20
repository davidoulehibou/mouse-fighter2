const Timer = ({ gameData }) => {
  const progress = gameData.countdown / gameData.time;
  return (
    <>
      <svg viewBox="0 0 300 1" className="gameTimer">
        {gameData.status == "play" && (
          <rect
            width={(gameData.countdown / gameData.time) * 300}
            height="1"
            fill={
              progress == 1 ? "#00FF0000" : `hsl(${progress * 120}, 80%, 60%)`
            }
          />
        )}
      </svg>
    </>
  );
};

export default Timer;
