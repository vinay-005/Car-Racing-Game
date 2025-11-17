const player = document.getElementById("player");
const startScreen = document.getElementById("startScreen");
const gameArea = document.querySelector(".game-area");
const leftBtn = document.getElementById("left-btn");
const rightBtn = document.getElementById("right-btn");

let playerData = { speed: 5, score: 0, start: false, x: 0, y: 0 };
let keys = { ArrowLeft: false, ArrowRight: false };

const enemyCars = [
  "images/yellow-car.png",
  "images/blue-car.png",
  "images/red-car.png"
];

// Sounds
const moveSound = new Audio("sounds/move.mp3");
moveSound.volume = 0.4;

const bgMusic = new Audio("sounds/background.mp3");
bgMusic.loop = true;
bgMusic.volume = 0.4;

// Click to start
startScreen.addEventListener("click", () => {
  if (!playerData.start) startGame();
});

// Keyboard controls
document.addEventListener("keydown", (e) => {
  e.preventDefault();

  if ((e.key === "ArrowLeft" || e.key === "ArrowRight") && !keys[e.key]) {
    moveSound.currentTime = 0;
    moveSound.play();
  }

  keys[e.key] = true;

  if (e.key === "Enter" && !playerData.start) startGame();
});

document.addEventListener("keyup", (e) => {
  e.preventDefault();
  keys[e.key] = false;
});

// Mobile controls
leftBtn.addEventListener("touchstart", () => {
  keys.ArrowLeft = true;
  moveSound.currentTime = 0;
  moveSound.play();
});
leftBtn.addEventListener("touchend", () => (keys.ArrowLeft = false));

rightBtn.addEventListener("touchstart", () => {
  keys.ArrowRight = true;
  moveSound.currentTime = 0;
  moveSound.play();
});
rightBtn.addEventListener("touchend", () => (keys.ArrowRight = false));

function startGame() {
  startScreen.classList.add("hide");
  gameArea.innerHTML = '<div class="score">Score: <span id="score">0</span></div>';

  // FIX: link to new #score created inside gameArea
  window.scoreElement = document.getElementById("score");

  playerData.start = true;
  playerData.score = 0;

  bgMusic.currentTime = 0;
  bgMusic.play();

  // Road lines
  for (let i = 0; i < 5; i++) {
    let roadLine = document.createElement("div");
    roadLine.classList.add("line");
    roadLine.y = i * 150;
    roadLine.style.top = roadLine.y + "px";
    gameArea.appendChild(roadLine);
  }

  // Enemy cars
  for (let i = 0; i < 3; i++) {
    let enemy = document.createElement("div");
    enemy.classList.add("enemy");

    enemy.style.backgroundImage =
      `url('${enemyCars[Math.floor(Math.random() * enemyCars.length)]}')`;

    enemy.y = (i + 1) * -300;
    enemy.style.top = enemy.y + "px";
    enemy.style.left = Math.floor(Math.random() * 250) + "px";

    // left-right movement
    enemy.dx = (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 2 + 1);

    gameArea.appendChild(enemy);
  }

  // Add player car
  gameArea.appendChild(player);
  playerData.x = player.offsetLeft;
  playerData.y = player.offsetTop;

  window.requestAnimationFrame(playGame);
}

function playGame() {
  if (!playerData.start) return;

  moveLines();
  moveEnemies();

  if (keys.ArrowLeft && playerData.x > 0) playerData.x -= playerData.speed;
  if (keys.ArrowRight && playerData.x < 270) playerData.x += playerData.speed;

  player.style.left = playerData.x + "px";

  // Update score (FIXED)
  playerData.score++;
  scoreElement.textContent = playerData.score;

  window.requestAnimationFrame(playGame);
}

function moveLines() {
  let lines = document.querySelectorAll(".line");

  lines.forEach(line => {
    line.y += playerData.speed;
    if (line.y > 700) line.y -= 750;
    line.style.top = line.y + "px";
  });
}

function moveEnemies() {
  let enemies = document.querySelectorAll(".enemy");
  let playerCar = player.getBoundingClientRect();

  enemies.forEach(enemy => {
    let eRect = enemy.getBoundingClientRect();

    // Collision detection
    if (
      !(
        playerCar.bottom < eRect.top ||
        playerCar.top > eRect.bottom ||
        playerCar.right < eRect.left ||
        playerCar.left > eRect.right
      )
    ) {
      endGame();
    }

    enemy.y += playerData.speed;

    // Left-right movement
    let newLeft = enemy.offsetLeft + enemy.dx;

    if (newLeft <= 0 || newLeft >= 270) {
      enemy.dx *= -1;
    } else {
      enemy.style.left = newLeft + "px";
    }

    // Respawn enemy when off screen
    if (enemy.y > 700) {
      enemy.y = -200;
      enemy.style.left = Math.floor(Math.random() * 250) + "px";

      enemy.style.backgroundImage =
        `url('${enemyCars[Math.floor(Math.random() * enemyCars.length)]}')`;

      enemy.dx = (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 2 + 1);
    }

    enemy.style.top = enemy.y + "px";
  });
}

function endGame() {
  playerData.start = false;
  bgMusic.pause();

  startScreen.classList.remove("hide");
  startScreen.innerHTML = `<h1>💥 Game Over 💥</h1>
    <p>Score: ${playerData.score}</p>
    <p>Press ENTER or TAP to Restart</p>`;
}
