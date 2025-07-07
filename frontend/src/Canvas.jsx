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

  function drawSpeechBubble(ctx, text, x, y, color, name) {
    ctx.font = "20px Arial";

    const padding = 10;
    const textMetrics = ctx.measureText(text);
    const textWidth = textMetrics.width;
    const textHeight = 20;
    const radius = 20;
    const bullewidth = x + textWidth + padding * 2;
    const bulleheight = y - textHeight - padding * 1.5;

    ctx.beginPath();

    // Top left corner to top right
    ctx.moveTo(x, y);
    ctx.lineTo(bullewidth - radius, y);
    ctx.quadraticCurveTo(bullewidth, y, bullewidth, y - radius);
    ctx.lineTo(bullewidth, bulleheight + radius);
    ctx.quadraticCurveTo(
      bullewidth,
      bulleheight,
      bullewidth - radius,
      bulleheight
    );
    ctx.lineTo(x + radius, bulleheight);
    ctx.quadraticCurveTo(x, bulleheight, x, bulleheight + radius);
    ctx.lineTo(x, y);

    ctx.closePath();

    // Styles
    ctx.fillStyle = "rgb(255,255,255,0.5";
    ctx.lineWidth = 2;
    ctx.fill();

    ctx.font = "12px Arial";
    ctx.fillStyle = color;
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.fillText(
      name.charAt(0).toUpperCase() + String(name).slice(1),
      x + padding,
      y - 30
    );

    ctx.font = "16px Arial";
    ctx.fillStyle = "#000";
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.fillText(text, x + padding, y - padding);
  }

  function drawPlayer(ctx, letter, x, y, color) {
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();

    ctx.font = "16px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.strokeStyle = "white";
    ctx.lineWidth = 5;
    ctx.strokeText(letter, x, y);

    ctx.fillStyle = "black";
    ctx.fillText(letter, x, y);
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = windowSize.width;
    canvas.height = windowSize.height;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    Object.keys(positions).forEach((joueur) => {
      const { x, y, color, status, text } = positions[joueur];

      let posx;
      let posy;

      if (status != playerId) {
        posx = x * windowSize.width;
        posy = y * windowSize.height;
      } else {
        posx = mousePosition.x;
        posy = mousePosition.y;
      }

      if (status !== "off") {
        drawPlayer(ctx, status.charAt(0).toUpperCase(), posx, posy, color);
      }

      if (text != "") {
        drawSpeechBubble(ctx, text, posx + 20, posy - 20, color, status);
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
