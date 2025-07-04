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
    const textMetrics = ctx.measureText(text);
    const textWidth = textMetrics.width;
    const textHeight = 20;
    const radius = 20
    const bullewidth = x + textWidth + padding*2
    const bulleheight = y - textHeight - padding*1.5

    ctx.beginPath();

    // Top left corner to top right
    ctx.moveTo(x, y);
    ctx.lineTo(bullewidth - radius , y);
    ctx.quadraticCurveTo(bullewidth, y, bullewidth,  y - radius)
    ctx.lineTo(bullewidth , bulleheight+radius );
    ctx.quadraticCurveTo(bullewidth, bulleheight, bullewidth - radius, bulleheight)
    ctx.lineTo(x+radius, bulleheight );
    ctx.quadraticCurveTo(x, bulleheight, x, bulleheight+radius)
    ctx.lineTo(x, y);

    ctx.closePath();

    // Styles
    ctx.fillStyle = "rgb(255,255,255,0.5";
    ctx.lineWidth = 2;
    ctx.fill();

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
          drawSpeechBubble(
            ctx,
            text,
            mousePosition.x + 20,
            mousePosition.y - 20
          );
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
