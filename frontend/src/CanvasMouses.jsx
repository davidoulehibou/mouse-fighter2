import { useEffect, useRef, useState } from "react";
import TextInput from "./TextInput";
import getTextColor, { getInsideColor } from "./utils/getTextColor";
import RideauSvg from "./utils/RideauSvg";
import Game1 from "./gameCanvas/Game1";
import Game2 from "./gameCanvas/Game2";

const CanvasMouses = ({handleMouseMove, positions, pseudo, gameData, playerId }) => {
  const gameStatus = gameData.status;
  const canvasRef = useRef(null);

  const [numJoueur, setNumJoueur] = useState(null);

  const [joueurData, setJoueurData] = useState(null)

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
      positions.map((joueur) => {
        if(joueur.id == playerId){
          setJoueurData(joueur)
        }
      })
    }

    if (playerId) {
      handleMouseMove(
        mousePosition.x / windowSize.width,
        mousePosition.y / windowSize.height
      );
    }
  }, [windowSize, mousePosition, pseudo]);

  const handleSetX = async (joueur, x, y, room) => {
    if (pseudo) {
      try {
        await fetch(
          `${
            import.meta.env.VITE_URL
          }/api/movexy?joueur=${joueur}&x=${x}&y=${y}&room=${room}`
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
    ctx.font = "30px Dongle";

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
    ctx.fillStyle = "rgb(255,255,255,0.5)";
    ctx.lineWidth = 2;
    ctx.fill();
    ctx.fillStyle = "#000";
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.fillText(text, x + padding, y - padding);

    ctx.font = "20px Dongle";
    ctx.fillStyle = getInsideColor(color);
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.strokeStyle = "white";
    ctx.lineWidth = 4;
    ctx.lineJoin = "round";
    ctx.strokeText(
      name.charAt(0).toUpperCase() + String(name).slice(1),
      x + padding,
      y - 30
    );
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
    ctx.closePath();
    ctx.fillStyle = getInsideColor(color);
    ctx.strokeStyle = color;

    ctx.lineWidth = 3;
    ctx.lineJoin = "round";
    ctx.stroke();
    ctx.fill();

    ctx.font = "35px Dongle";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.strokeStyle = getTextColor(color);
    ctx.lineWidth = 5;
    ctx.lineJoin = "round";
    ctx.strokeText(letter, x + 17, y + 30);
    ctx.strokeText(letter, x + 18, y + 31);
    ctx.strokeText(letter, x + 19, y + 32);
    ctx.fillStyle = color;
    ctx.fillText(letter, x + 17, y + 30);
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = windowSize.width;
    canvas.height = windowSize.height;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    positions.map((joueur) => {
      const { x, y, color,nom, text } = joueur;

      let posx;
      let posy;

      if (nom != pseudo) {
        posx = x * windowSize.width;
        posy = y * windowSize.height;
      } else if (mousePosition) {
        posx = mousePosition.x;
        posy = mousePosition.y;
      }
      drawPlayer(ctx, nom.charAt(0).toUpperCase(), posx, posy, color);


      if (text) {
        drawSpeechBubble(ctx, text, posx, posy - 10, color, nom);
      }
    });
  }, [positions, windowSize, mousePosition]);

  const gamesMap = {
    game1: <Game1 gameData={gameData ? gameData : null} />,
    game2: <Game2 gameData={gameData ? gameData : null} />,
  };

  return (
    <>
      <RideauSvg
        color={joueurData ? joueurData.color : "grey"}
        dataGame={gameStatus}
      />

      {/* {gameStatus == "play" && gamesMap[gameData.type]} */}

      <canvas
        className="canvasMouse"
        ref={canvasRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          backgroundImage: `radial-gradient(circle,
            ${joueurData ? joueurData.color : "#000000"}05 10%,
             ${joueurData ? joueurData.color : "#000000"}90 40%)`,
          backgroundPosition: "center",
          backgroundSize: gameStatus == "play" ? "700%" : "200%",
          outline: "white 100000px solid",
          transform: "scale(1)",
        }}
      ></canvas>
      {numJoueur && <TextInput joueur={numJoueur} name={pseudo} />}
    </>
  );
};

export default CanvasMouses;
