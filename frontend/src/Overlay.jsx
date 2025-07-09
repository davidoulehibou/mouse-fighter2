function Overlay({ handleNewPseudo, positions }) {
  const numJoueur = "joueur2";

  function getTextColor(bgColor) {
    // Supporte les couleurs en hex (#rrggbb ou #rgb)
    let r, g, b;

    if (bgColor.startsWith("#")) {
      const hex = bgColor.replace("#", "");
      if (hex.length === 3) {
        r = parseInt(hex[0] + hex[0], 16);
        g = parseInt(hex[1] + hex[1], 16);
        b = parseInt(hex[2] + hex[2], 16);
      } else if (hex.length === 6) {
        r = parseInt(hex.substr(0, 2), 16);
        g = parseInt(hex.substr(2, 2), 16);
        b = parseInt(hex.substr(4, 2), 16);
      }
    } else if (bgColor.startsWith("rgb")) {
      [r, g, b] = bgColor.match(/\d+/g).map(Number);
    } else {
      // couleur inconnue → valeur par défaut
      return "black";
    }

    // Calcul de luminance relative (selon le standard W3C)
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    return luminance > 0.5 ? "black" : "white";
  }

  return (
    <div style={{ position: "relative", height: "100vh", overflow: "hidden" }}>
      <button
        onClick={() => handleNewPseudo(numJoueur)}
        style={{ position: "absolute", zIndex: "1000" }}
        className="bouton"
      >
        Changer de pseudo
      </button>
      <ul className="player-list">
        {Object.entries(positions)
          .filter(([_, data]) => data.status !== "off")
          .sort(([, a], [, b]) => b.score - a.score)
          .map(([joueur, data]) => (
            <li key={joueur} className="player-card">
              <p
                style={{
                  backgroundColor: data.color,
                  color: getTextColor(data.color),
                  padding: "4px 8px",
                  borderRadius: "4px",
                }}
              >
                {data.status} : <span>{data.score} pts</span>
              </p>
            </li>
          ))}
      </ul>
    </div>
  );
}

export default Overlay;
