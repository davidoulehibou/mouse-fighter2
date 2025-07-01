import { useEffect, useRef } from "react";

const Canvas = ({ positions, windowSize, playerId, mousePosition }) => {
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

    // Effacer le canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    Object.keys(positions).forEach((joueur) => {
      const { x, y, color, status } = positions[joueur];

      if (status != playerId) {
        ctx.beginPath();
        ctx.arc(
          x * windowSize.width,
          y * windowSize.height,
          20,
          0,
          2 * Math.PI
        );
        if (status !== "off") {
          ctx.fillStyle = color;
        } else {
          ctx.fillStyle = "rgba(255,255,255,0)";
        }

        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.arc(mousePosition.x, mousePosition.y, 20, 0, 2 * Math.PI);
        if (status !== "off") {
          ctx.fillStyle = color;
        } else {
          ctx.fillStyle = "rgba(255,255,255,0)";
        }

        ctx.fill();
      }
    });
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
