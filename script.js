// ----- Sound Elements -----
const clickSound = document.getElementById("click-sound");
const moveSound = document.getElementById("move-sound");
const winSound = document.getElementById("win-sound");
const drawSound = document.getElementById("draw-sound");

// ----- DOM Elements -----
const board = document.getElementById("game-board");
const statusText = document.getElementById("status-text");
const modal = document.getElementById("result-modal");
const messageEl = document.getElementById("result-message");
const blurWrapper = document.getElementById("blur-wrapper");

// ----- Game State -----
let currentPlayer = "X";
let gameActive = true;
let gameState = ["", "", "", "", "", "", "", "", ""];

const winConditions = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
];

// ----- Create Board -----
function createBoard() {
  board.innerHTML = "";
  gameState.fill("");
  gameActive = true;
  currentPlayer = "X";
  statusText.textContent = `Your Turn (❌)`;

  for (let i = 0; i < 9; i++) {
    const cell = document.createElement("button");
    cell.classList.add("cell");
    cell.setAttribute("data-index", i);
    cell.setAttribute("aria-label", `Cell ${i + 1}`);
    cell.textContent = "";
    cell.classList.remove("win");
    cell.addEventListener("click", handleMove);
    board.appendChild(cell);
  }
}

// ----- Handle Player Move -----
function handleMove(event) {
  const index = event.target.getAttribute("data-index");

  if (gameState[index] !== "" || !gameActive || currentPlayer !== "X") return;

  clickSound.play().catch(e => console.warn("Click sound blocked:", e));
  makeMove(index, "X");

  if (checkGameEnd()) return;

  setTimeout(() => {
    aiMove();
    checkGameEnd();
  }, 500);
}

// ----- Place Symbol in Cell -----
function makeMove(index, player) {
  gameState[index] = player;
  const cell = board.querySelector(`[data-index="${index}"]`);
  cell.textContent = player;

  moveSound.play().catch(e => console.warn("Move sound blocked:", e));
}

// ----- AI Move -----
function aiMove() {
  if (!gameActive) return;

  const emptyCells = gameState
    .map((val, i) => val === "" ? i : null)
    .filter(i => i !== null);

  if (emptyCells.length === 0) return;

  const randomIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  makeMove(randomIndex, "O");
}

// ----- Check Game Result -----
function checkGameEnd() {
  for (let condition of winConditions) {
    const [a, b, c] = condition;
    if (gameState[a] && gameState[a] === gameState[b] && gameState[a] === gameState[c]) {
      gameActive = false;

      const winText = gameState[a] === "X" ? "You Win! 🎉" : "AI Wins! 💻";
      statusText.textContent = winText;

      [a, b, c].forEach(i => {
        document.querySelector(`[data-index="${i}"]`).classList.add("win");
      });

      winSound.play().catch(e => console.warn("Win sound blocked:", e));

      if (typeof confetti === "function") {
        confetti({
          particleCount: 120,
          spread: 90,
          origin: { y: 0.6 }
        });
      }

      showModal(winText);
      return true;
    }
  }

  if (!gameState.includes("")) {
    gameActive = false;
    const drawText = "It's a Draw! 🤝";
    statusText.textContent = drawText;

    drawSound.play().catch(e => console.warn("Draw sound blocked:", e));
    showModal(drawText);
    return true;
  }

  currentPlayer = currentPlayer === "X" ? "O" : "X";
  statusText.textContent = currentPlayer === "X" ? "Your Turn (❌)" : "AI's Turn (⭕)";
  return false;
}

// ----- Show Modal and Blur Background -----
function showModal(message) {
  messageEl.textContent = message;
  modal.classList.remove("hidden");
  blurWrapper.classList.add("blur");
}

// ----- Restart Game -----
function restartGame() {
  modal.classList.add("hidden");
  blurWrapper.classList.remove("blur");

  clickSound.play().catch(e => console.warn("Restart sound blocked:", e));
  createBoard();
}

// ----- Exit Game -----
function exitGame() {
  document.getElementById("exit-modal").classList.remove("hidden");
}

// ----- Handle Exit Confirmation -----
function confirmExit(userConfirmed) {
  document.getElementById("exit-modal").classList.add("hidden");

  if (userConfirmed) {
    window.open("", "_self");
    window.close();

    // Fallback
    setTimeout(() => {
      window.location.href = "index.html";
    }, 300);
  }
}

// ----- Start Game on Load -----
createBoard();
