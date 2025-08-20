import { useEffect, useRef, useState } from "react";
import TextInput from "./overlay/TextInput";
import getTextColor, { getInsideColor } from "./utils/getTextColor";
import RideauSvg from "./overlay/RideauSvg";
import Text1 from "./gameCanvas/Text1";
import Cadre1 from "./gameCanvas/Cadre1";
import Cadre2 from "./gameCanvas/Cadre2";

const CanvasMouses = ({
  handleMouseMove,
  positions,
  pseudo,
  gameData,
  playerId,
  setDead,
}) => {
  const gameStatus = gameData.status;
  const canvasRef = useRef(null);

  const [joueurData, setJoueurData] = useState(null);

  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const [mousePosition, setMousePosition] = useState({
    x: 0,
    y: 0,
    click: false,
  });

  const isMouseDownRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;

    const disableContextMenu = (e) => {
      e.preventDefault();
    };

    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    const handleMouseMove = (event) => {
      setMousePosition({
        x: event.clientX,
        y: event.clientY,
        click: isMouseDownRef.current,
      });
    };

    const handleMouseDown = (e) => {
      isMouseDownRef.current = true;
      setMousePosition((prev) => ({
        ...prev,
        x: e.clientX,
        y: e.clientY,
        click: true,
      }));
    };

    const handleMouseUp = (e) => {
      isMouseDownRef.current = false;
      setMousePosition((prev) => ({
        ...prev,
        x: e.clientX,
        y: e.clientY,
        click: false,
      }));
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("contextmenu", disableContextMenu);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      canvas.removeEventListener("contextmenu", disableContextMenu);
    };
  }, []);

  useEffect(() => {
    if (playerId) {
      positions.map((joueur) => {
        if (joueur.id == playerId) {
          setJoueurData(joueur);
        }
      });
      handleMouseMove(
        mousePosition.x / windowSize.width,
        mousePosition.y / windowSize.height,
        mousePosition.click
      );
    }
  }, [windowSize, mousePosition, playerId, gameData]);

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

  function drawPlayer(ctx, letter, x, y, color, dead, click, me) {
    ctx.beginPath();
    ctx.globalAlpha = 1;
    if (dead) {
      ctx.globalAlpha = 0.2;
    }

    ctx.moveTo(x, y);
    if (me) {
      ctx.lineTo(x, y + 21.5);
      ctx.lineTo(x + 8.5, y + 15.5);
      ctx.lineTo(x + 15.5, y + 15.5);
      ctx.lineTo(x, y);
    } else {
      ctx.lineTo(x, y + 18);
      ctx.lineTo(x + 7, y + 13);
      ctx.lineTo(x + 13, y + 13);
      ctx.lineTo(x, y);
    }

    ctx.closePath();
    ctx.fillStyle = getInsideColor(color);
    ctx.strokeStyle = color;

    if (click) {
      ctx.strokeStyle = "white";
    }

    ctx.lineWidth = me ? 5 : 2;
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

    positions.forEach((joueur) => {
      const { x, y, color, nom, text, dead, click } = joueur;

      // Skip if nom or color is missing
      if (!nom || !color) return;

      let posx, posy;
      let clickStatus = false;
      let me = false;

      if (nom !== pseudo) {
        posx = x * windowSize.width;
        posy = y * windowSize.height;
        clickStatus = click;
      } else if (mousePosition) {
        posx = mousePosition.x;
        posy = mousePosition.y;
        me = true;
        clickStatus = isMouseDownRef.current;
      }

      drawPlayer(
        ctx,
        nom.charAt(0).toUpperCase(),
        posx,
        posy,
        color,
        dead,
        clickStatus,
        me
      );

      if (text) {
        drawSpeechBubble(ctx, text, posx, posy - 10, color, nom);
      }
    });
  }, [positions, windowSize, mousePosition, isMouseDownRef]);

  const gameInfos = {
    gameData: gameData ? gameData : null,
    setDead: setDead,
    mousePosition: mousePosition,
    playerId: playerId,
    playersInfos: positions,
  };

  const gamesMap = {
    cadre1: <Cadre1 gameInfos={gameInfos} />,
    cadre2: <Cadre2 gameInfos={gameInfos} />,
    text1: <Text1 gameInfos={gameInfos} />,
  };

  return (
    <>
      {gameStatus == "play" && gamesMap[gameData.type]}
      <RideauSvg
        color={joueurData ? joueurData.color : "grey"}
        dataGame={gameStatus}
      />

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
    </>
  );
};

export default CanvasMouses;
