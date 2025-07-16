function Overlay({ handleNewPseudo }) {
  const numJoueur = "joueur2";


  return (
    <div style={{ position: "relative", height: "100vh", overflow: "hidden" }}>
      
      <button
        onClick={() => handleNewPseudo(numJoueur)}
        style={{ position: "absolute", zIndex: "1000", bottom:0, right:0}}
        className="bouton"
      >
        Changer de pseudo
      </button>

      
      
    </div>
  );
}

export default Overlay;
