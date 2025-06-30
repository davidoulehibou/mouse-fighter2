import { useEffect, useRef } from "react";

const Canvas = ({positions, windowSize}) => {
  const canvasRef = useRef(null);
  

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = windowSize.width;
      canvas.height = windowSize.height;
    }
  }, [windowSize]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Redimensionner le canvas pour qu'il prenne toute la fenêtre
    canvas.width = windowSize.width;
    canvas.height = windowSize.height;

    // Effacer
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dessiner cercle rouge
    ctx.beginPath();
    ctx.arc(
      positions.joueur1.x * windowSize.width,
      positions.joueur1.y * windowSize.height,
      20,
      0,
      2 * Math.PI
    );
    ctx.fillStyle = "red";
    ctx.fill();
  }, [positions, windowSize]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        zIndex: 0,
        backgroundColor: "#b9dbff",
      }}
    />
  );
};

export default Canvas;
