import { useEffect, useRef, useState } from "react";
import TextInput from "./TextInput";

const Canvas = ({ positions, playerId }) => {
  const canvasRef = useRef(null);

  const [numJoueur, setNumJoueur] = useState(null)


  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const [mousePosition, setMousePosition] = useState({
    x: 0,
    y: 0,
  });

  useEffect(() => {
    // Mettre à jour la taille de la fenêtre
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    // Mettre à jour la position de la souris
    const handleMouseMove = (event) => {
      setMousePosition({
        x: event.clientX,
        y: event.clientY,
      });
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  useEffect(() => {

    if(playerId){
      Object.keys(positions).forEach((joueur) => {
      if (positions[joueur].status == playerId) {
        setNumJoueur(joueur);
      }
    });
    }else{
      setNumJoueur(null);
    }
    

    if (numJoueur) {
      handleSetX(
        numJoueur,
        mousePosition.x / windowSize.width,
        mousePosition.y / windowSize.height,
        playerId
      );
    }
  }, [windowSize, mousePosition, playerId]);

  const handleSetX = async (joueur, x, y, status) => {
    if (playerId) {
      try {
        await fetch(
          `${
            import.meta.env.VITE_URL
          }/api/set-x?joueur=${joueur}&x=${x}&y=${y}&status=${status}`
        );
      } catch (err) {
        console.error("Erreur appel HTTP:", err);
      }
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = windowSize.width;
      canvas.height = windowSize.height;
    }
  }, [windowSize]);

  function drawSpeechBubble(ctx, text, x, y, color, name) {
    ctx.font = "16px Arial";

    const padding = 10;
    const textMetrics = ctx.measureText(text);
    const textWidth = textMetrics.width;
    const textHeight = 20;
    const radius = 20;
    const bullewidth = x + textWidth + padding * 2;
    const bulleheight = y - textHeight - padding * 1.5;

    console.log(textWidth, bullewidth);

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
    ctx.fillStyle = "#000";
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.fillText(text, x + padding, y - padding);

    ctx.font = "12px Arial";
    ctx.fillStyle = color;
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.fillText(
      name.charAt(0).toUpperCase() + String(name).slice(1),
      x + padding,
      y - 30
    );
  }

  function drawPlayer(ctx, letter, x, y, color) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y + 18);

    ctx.lineTo(x + 7, y + 13);
    ctx.lineTo(x + 13, y + 13);
    ctx.lineTo(x, y);
    ctx.fillStyle = "white";
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fill();

    ctx.font = "16px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.strokeStyle = "white";
    ctx.lineWidth = 5;
    ctx.lineJoin = "round";
    ctx.strokeText(letter, x + 12, y + 25);
    ctx.fillStyle = color;
    ctx.fillText(letter, x + 12, y + 25);
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
      } else if (mousePosition) {
        posx = mousePosition.x;
        posy = mousePosition.y;
      }

      if (status !== "off") {
        drawPlayer(ctx, status.charAt(0).toUpperCase(), posx, posy, color);
      }

      if (text != "") {
        drawSpeechBubble(ctx, text, posx, posy - 10, color, status);
      }
    });
  }, [positions, windowSize, mousePosition]);

  return (
    <>
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        backgroundColor: "#b9dbff",
      }}
    />
    {numJoueur && <TextInput joueur={numJoueur} name={playerId} />}
    
    </>
  );
};

export default Canvas;
