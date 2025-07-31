const rows = 4, cols = 5;
const symbols = [
  "jjj.png", "ele.png", "koko.png", "ayeaye.png", "buffalo.png", "kkkk.png",
  "horse.png", "lion.png", "qqqq.png", "tha.png", "ten.png", "coin.png", "map.png"
];

const itemValues = {
  "jjj.png": 1, "ele.png": 10, "koko.png": 5, "ayeaye.png": 6, "buffalo.png": 50,
  "kkkk.png": 3, "horse.png": 7, "lion.png": 12, "qqqq.png": 3, "tha.png": 9,
  "ten.png": 5, "coin.png": 100, "map.png": 0
};

let credit = 10000, bet = 100, win = 0, freeSpins = 0, freeSpinIndex = 0;

const sounds = {
  bg: Object.assign(new Audio("sound/back.mp3"), { loop: true }),
  buffalo: new Audio("sound/sixcoin.mp3"),     // ✅ buffalo sound replaced
  button: new Audio("sound/popbutton.mp3"),
  sixcoin: new Audio("sound/sixcoin.mp3"),
  spin: new Audio("sound/back.mp3")            // ✅ or your actual spin sound
};

function play(sound) {
  if (!sound) return;
  sound.currentTime = 0;
  sound.play();
}

function vibrate(ms = 400) {
  if (navigator.vibrate) navigator.vibrate(ms);
}

function genGrid() {
  return Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => {
      let img;
      do {
        img = symbols[Math.floor(Math.random() * symbols.length)];
      } while (c === 0 && img === "map.png");
      return img;
    })
  );
}

function renderGrid(grid) {
  const box = document.getElementById("slotGrid");
  box.innerHTML = "";
  grid.flat().forEach(img => {
    const d = document.createElement("div");
    d.className = "slot-symbol fall";
    d.innerHTML = `<img src="img/${img}" />`;
    box.appendChild(d);
  });
}

function highlightAllMatching(image) {
  document.querySelectorAll(".slot-symbol img").forEach(e => {
    if (e.src.includes(image)) {
      e.parentElement.classList.add("highlight", "win-animation");
    }
  });
}

function calculateGridWin(grid) {
  let winAmount = 0;
  let allSymbols = {};

  grid.forEach(row => {
    row.forEach(img => {
      allSymbols[img] = (allSymbols[img] || 0) + 1;
    });
  });

  for (let img in allSymbols) {
    const count = allSymbols[img];
    if (count >= 6) {
      highlightAllMatching(img);

      if (img === "coin.png") {
        play(sounds.sixcoin); // ✅ play sixcoin.mp3
        vibrate(600);
        winAmount += 10000 + bet; // ✅ Correct logic
      } else if (img === "map.png") {
        play(sounds.sixcoin);
        credit += 5000;
        freeSpins += 8;
        freeSpinIndex = 0;
      } else {
        winAmount += itemValues[img] * bet;
        play(sounds.buffalo); // ✅ same sixcoin.mp3 sound for others too
      }
    }
  }

  return { totalWin: winAmount };
}

function updateUI() {
  document.getElementById("credit").innerText = credit;
  document.getElementById("bet").innerText = bet;
  document.getElementById("win").innerText = win;
  document.getElementById("freeSpins").innerText =
    freeSpins > 0 ? `${freeSpinIndex}/${freeSpins}` : "0";
}

function spin() {
  if (freeSpins <= 0 && credit < bet) {
    return alert("Not enough credit!");
  }

  play(sounds.spin);
  document.querySelectorAll(".slot-symbol").forEach(e =>
    e.classList.remove("highlight", "win-animation")
  );

  if (freeSpins > 0) {
    freeSpinIndex++;
    freeSpins--;
  } else {
    credit -= bet;
  }

  const grid = genGrid();
  renderGrid(grid);

  const { totalWin } = calculateGridWin(grid);
  credit += totalWin;
  win = totalWin;

  updateUI();
}

document.addEventListener("DOMContentLoaded", () => {
  updateUI();
  renderGrid(genGrid());
  play(sounds.bg);

  document.getElementById("spinBtn").onclick = spin;
  document.getElementById("decreaseBetBtn").onclick = () => {
    if (bet > 100) bet -= 100;
    updateUI();
  };
  document.getElementById("increaseBetBtn").onclick = () => {
    if (bet + 100 <= credit) bet += 100;
    updateUI();
  };
});
