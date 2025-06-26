const player = document.getElementById('player');
const game = document.getElementById('game');
const controlBtn = document.getElementById('controlBtn');
const gameOverOverlay = document.getElementById('gameOverOverlay');
const retryBtn = document.getElementById('retryBtn');
const scoreDisplay = document.getElementById('scoreDisplay');
const backgroundMusic = document.getElementById('backgroundMusic');
const jumpMusic = document.getElementById('jumpMusic');
const hitMusic = document.getElementById('hitMusic');

let gameRunning = false;
let paused = false;
let hurdleIntervals = [];
let hurdleTimers = [];
let score = 0;
let speed = 5;

function jumpPlayer() {
  if (!player.classList.contains('jump')) {
    player.classList.add('jump');
    jumpMusic.currentTime = 0;
    jumpMusic.play()
      .then(() => console.log("Jump music playing"))
      .catch(err => console.log("Jump audio error:", err));
    setTimeout(() => player.classList.remove('jump'), 1500);
  }
}

document.addEventListener('keydown', (e) => {
  if ((e.code === 'ArrowUp' || e.code === 'Space') && gameRunning && !paused) {
    jumpPlayer();
  }
});

game.addEventListener('click', () => {
  if (gameRunning && !paused) jumpPlayer();
});

function createHurdle() {
  if (!gameRunning || paused) return;

  const hurdle = document.createElement('div');
  hurdle.classList.add('hurdle');
  hurdle.style.left = '100vw';
  game.appendChild(hurdle);

  let hurdlePosition = window.innerWidth;
  let passed = false;

  const moveInterval = setInterval(() => {
    if (!paused) {
      hurdlePosition -= speed;
      hurdle.style.left = hurdlePosition + 'px';

      if (hurdlePosition < -60) {
        hurdle.remove();
        clearInterval(moveInterval);
      }

      const playerRect = player.getBoundingClientRect();
      const hurdleRect = hurdle.getBoundingClientRect();

      if (playerRect.left > hurdleRect.right && !passed) {
        passed = true;
        score++;
        scoreDisplay.textContent = `Score: ${score}`;
      }

      if (
        playerRect.bottom > hurdleRect.top + 20 &&
        playerRect.right > hurdleRect.left &&
        playerRect.left < hurdleRect.right &&
        playerRect.bottom <= hurdleRect.bottom + 10
      ) {
        clearInterval(moveInterval);
        endGame();
      }
    }
  }, 30);

  hurdleIntervals.push(moveInterval);

  const timer = setTimeout(createHurdle, Math.random() * 3000 + 1000);
  hurdleTimers.push(timer);
}

function startGame() {
  gameRunning = true;
  paused = false;
  controlBtn.textContent = 'Stop';
  controlBtn.style.backgroundColor = 'red';
  gameOverOverlay.style.display = 'none';
  document.querySelectorAll('.hurdle').forEach(h => h.remove());
  hurdleIntervals.forEach(clearInterval);
  hurdleTimers.forEach(clearTimeout);
  hurdleIntervals = [];
  hurdleTimers = [];
  score = 0;
  scoreDisplay.textContent = `Score: ${score}`;
  // speed = 5;
 backgroundMusic.currentTime = 0;
backgroundMusic.playbackRate = 1.0; // ⬅️ This speeds up the music
backgroundMusic.play()
  .then(() => logStatus("Normal background music playing"))
  .catch(e => logStatus("Normal music blocked: " + e));

  createHurdle();
}

function pauseGame() {
  paused = true;
  controlBtn.textContent = 'Resume';
  controlBtn.style.backgroundColor = 'gold';
  backgroundMusic.pause();
  console.log("Background music paused");
}

function resumeGame() {
  paused = false;
  controlBtn.textContent = 'Stop';
  controlBtn.style.backgroundColor = 'red';
  backgroundMusic.play()
    .then(() => console.log("Normal background music resumed"))
    .catch(e => console.log("Normal music resume error", e));
}

function endGame() {
  paused = true;
  gameRunning = false;
  backgroundMusic.pause();
  backgroundMusic.currentTime = 0;
  console.log("Background music stopped for hit");
  hitMusic.currentTime = 0;
  hitMusic.play()
    .then(() => console.log("Die music playing"))
    .catch(err => console.log("Hit audio error:", err));
  gameOverOverlay.style.display = 'flex';
  hurdleIntervals.forEach(clearInterval);
  hurdleTimers.forEach(clearTimeout);
  hurdleIntervals = [];
  hurdleTimers = [];
}

retryBtn.addEventListener('click', () => {
  startGame();
});

controlBtn.addEventListener('click', () => {
  if (!gameRunning) {
    startGame();
  } else if (!paused) {
    pauseGame();
  } else {
    resumeGame();
  }
});