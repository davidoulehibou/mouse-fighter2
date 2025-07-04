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

  function drawSpeechBubble(ctx, text, x, y) {
    ctx.font = "20px Arial";

    const padding = 10;

    ctx.beginPath();

    // Top left corner to top right
    ctx.moveTo(x, y);
    ctx.lineTo(x, y - 10);
    ctx.moveTo(x, y);
    ctx.lineTo(x + 10, y);

    ctx.closePath();

    // Styles
    ctx.fillStyle = "#fff";
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.fill();
    ctx.stroke();

    // Text
    ctx.fillStyle = "#000";
    ctx.fillText(text, x + padding, y - padding);
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = windowSize.width;
    canvas.height = windowSize.height;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    Object.keys(positions).forEach((joueur) => {
      const { x, y, color, status, text } = positions[joueur];

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

        if (text != "") {
          drawSpeechBubble(
            ctx,
            text,
            x * windowSize.width + 20,
            y * windowSize.height - 20
          );
        }
      } else {
        ctx.beginPath();
        ctx.arc(mousePosition.x, mousePosition.y, 20, 0, 2 * Math.PI);
        if (status !== "off") {
          ctx.fillStyle = color;
        } else {
          ctx.fillStyle = "rgba(255,255,255,0)";
        }
        ctx.fill();

        if (text != "") {
          drawSpeechBubble(ctx, text, mousePosition.x + 20, mousePosition.y - 20);
        }
      }
    });
  }, [positions, windowSize, mousePosition]);

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
