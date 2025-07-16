import getTextColor, { getInsideColor } from "./utils/getTextColor";

function PlayerList({ positions, pseudo }) {
  

  return (
    <ul className="player-list">
      <h1>Leaderboard</h1>
      {Object.entries(positions)
        .filter(([_, data]) => data.status !== "off")
        .sort(([, a], [, b]) => b.score - a.score)
        .map(([joueur, data]) => (
          <li key={joueur} className="player-card">
            <p
              style={{
                backgroundColor: data.color,
                color: getTextColor(data.color),
                filter:`drop-shadow(5px 5px 0 ${getInsideColor(data.color)})`,
                padding: "4px 8px",
                borderRadius: "4px",
                opacity: `${pseudo == data.status ? "1" : "0.4"}`,
              }}
            >
              {data.status.charAt(0).toUpperCase() +
                String(data.status).slice(1)}{" "}
              : <span>{data.score} pts</span>
            </p>
          </li>
        ))} 
    </ul>
  );
}

export default PlayerList;
