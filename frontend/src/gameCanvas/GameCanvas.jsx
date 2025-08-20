// GameCanvas.jsx
import { useRef, useEffect, useState } from "react";
import Timer from "../overlay/Timer";

const GameCanvas = ({ onReady, title, subTitle, gameData }) => {
  const canvasRef = useRef(null);

  const getRand255 = () => {
    return Math.floor(Math.random() * 255);
  };

  const [backgroundColor] = useState(`hsl(${getRand255()}, 80%, 95%)`)

  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = windowSize.width;
      canvas.height = windowSize.height;
      onReady?.(canvas, windowSize);
    }
  }, [windowSize, onReady]);

  useEffect(() => {
    if (gameData?.countdown === 1) {
      setTimeout(() => {
        setIsVisible(false);
      }, [1500]);
    }
  }, [gameData?.countdown]);

  return (
    <>
      <div className={`gameCanvas ${isVisible ? "visible" : "notvisible"}`}>
        {title && <h1 className="gameTitle">{title}</h1>}
        {subTitle && <p className="gameSubTitle">{subTitle}</p>}

        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            zIndex: "-100",
            backgroundColor: backgroundColor,
            borderRadius: "30px",
          }}
        />
        <Timer gameData={gameData} />
      </div>
    </>
  );
};

export default GameCanvas;
