const rows = 4;
const cols = 5;
const symbols = [
  "jjj.png", "ele.png", "koko.png", "ayeaye.png", "buffalo.png", "kkkk.png",
  "horse.png", "lion.png", "qqqq.png", "tha.png", "ten.png", "coin.png", "map.png"
];

const itemValues = {
  "jjj.png": 10, "ele.png": 15, "koko.png": 20, "ayeaye.png": 25,
  "buffalo.png": 50, "kkkk.png": 10, "horse.png": 15, "lion.png": 20,
  "qqqq.png": 10, "tha.png": 15, "ten.png": 5, "coin.png": 100, "map.png": 0
};

let credit = 10000;
let bet = 100;
let win = 0;
let freeSpins = 0;
let freeSpinIndex = 0;

const coinSound = new Audio("sound/coin.mp3");
const buffaloSound = new Audio("sound/buffalo.mp3");
const sixcoinSound = new Audio("sound/sixcoin.mp3");
const buttonSound = new Audio("sound/spin.mp3");
const bgSound = new Audio("sound/bg.mp3");
bgSound.loop = true;

function playSound(sound) {
  sound.currentTime = 0;
  sound.play();
}

function vibrate(ms = 500) {
  if (navigator.vibrate) navigator.vibrate(ms);
}

function generateGrid() {
  let grid = [];
  for (let row = 0; row < rows; row++) {
    let newRow = [];
    for (let col = 0; col < cols; col++) {
      let img;
      do {
        img = symbols[Math.floor(Math.random() * symbols.length)];
      } while (col === 0 && img === "map.png");
      newRow.push(img);
    }
    grid.push(newRow);
  }
  return grid;
}

function renderGrid(grid) {
  const container = document.getElementById("slotGrid");
  container.innerHTML = "";
  grid.forEach(row => {
    row.forEach(img => {
      const el = document.createElement("div");
      el.className = "slot-symbol fall";
      el.innerHTML = `<img src="img/${img}" alt="">`;
      container.appendChild(el);
    });
  });
}

function clearWinAnimations() {
  document.querySelectorAll(".slot-symbol").forEach(el => {
    el.classList.remove("highlight", "win-animation");
  });
}

function highlightAllMatching(targetImg) {
  const container = document.getElementById("slotGrid");
  const symbols = container.querySelectorAll(".slot-symbol");
  symbols.forEach(el => {
    const imgTag = el.querySelector("img");
    if (imgTag && imgTag.src.includes(targetImg)) {
      el.classList.add("highlight", "win-animation");
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
        playSound(sixcoinSound);
        vibrate(600);
        winAmount += 10000 + bet;
      } else if (img === "map.png") {
        playSound(sixcoinSound);
        credit += 5000;
        freeSpins += 8;
        freeSpinIndex = 0;
      } else {
        winAmount += itemValues[img] * bet;
        if (img === "buffalo.png") playSound(buffaloSound);
        else playSound(sixcoinSound);
      }
    }
  }

  return { totalWin: winAmount };
}

function updateDisplays() {
  document.getElementById("credit").innerText = credit;
  document.getElementById("bet").innerText = bet;
  document.getElementById("win").innerText = win;

  if (freeSpins > 0) {
    document.getElementById("freeSpins").innerText = `${freeSpinIndex}/${freeSpins}`;
  } else {
    document.getElementById("freeSpins").innerText = `0`;
  }
}

function spin() {
  if (freeSpins <= 0 && credit < bet) {
    alert("Not enough credit!");
    return;
  }

  playSound(buttonSound);
  clearWinAnimations();

  if (freeSpins > 0) {
    freeSpinIndex++;
    freeSpins--;
  } else {
    credit -= bet;
  }

  const grid = generateGrid();
  renderGrid(grid);

  const result = calculateGridWin(grid);
  credit += result.totalWin;
  win = result.totalWin;

  updateDisplays();
}

document.addEventListener("DOMContentLoaded", () => {
  updateDisplays();
  renderGrid(generateGrid());
  playSound(bgSound);

  document.getElementById("spinBtn").addEventListener("click", spin);

  document.getElementById("decreaseBetBtn").addEventListener("click", () => {
    if (bet > 100) {
      bet -= 100;
      updateDisplays();
    }
  });

  document.getElementById("increaseBetBtn").addEventListener("click", () => {
    if (bet + 100 <= credit) {
      bet += 100;
      updateDisplays();
    }
  });
});
