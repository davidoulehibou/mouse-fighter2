// GameCanvas.jsx
import { useRef, useEffect, useState } from "react";

const GameCanvas = ({ onReady }) => {
  const canvasRef = useRef(null);

  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

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

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        backgroundColor: "#b9dbff",
      }}
    />
  );
};

export default GameCanvas;
