function Overlay({ handleNewPseudo, gameData }) {
  const numJoueur = "joueur2";


  return (
    <div style={{ position: "relative", height: "100vh", overflow: "hidden" }}>
      <h2>{gameData.status} - {gameData.countdown}</h2>
      <button
        onClick={() => handleNewPseudo(numJoueur)}
        style={{ position: "absolute", zIndex: "1000" }}
        className="bouton"
      >
        Changer de pseudo
      </button>

      
      
    </div>
  );
}

export default Overlay;
