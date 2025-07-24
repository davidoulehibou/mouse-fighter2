function cadre2(roomcode, updateRoom, setAllDead) {
  let posx = Math.random() * 0.8;
  let posy = Math.random() * 0.8;
  let posx2 = posx + Math.random() * (0.2 - 0.1) + 0.1;
  let posy2 = posy + Math.random() * (0.2 - 0.1) + 0.1;

  updateRoom(roomcode, {
    status: "play",
    countdown: 5,
    time: 5,
    type: "cadre2",
    infos: {
      carre1: {
        x: posx,
        y: posy,
        x2: posx2,
        y2: posy2,
      },
      dir: {
        x: Math.round(Math.random()) == 0 ? -0.005 : -0.005,
        y: Math.round(Math.random()) == 0 ? -0.005 : -0.005,
      },
    },
  });
}

module.exports = cadre2;
