// Game Variables
let gridSize = 4; // Default grid size (4x4)
let emojis = ['🍎', '🍌', '🍒', '🍇', '🍋', '🍊', '🍓', '🍉', '🍕', '🍟', '🍩', '🍔', '🍗', '🍪'];
let cards = [];
let flippedCards = [];
let moves = { 1: 0, 2: 0 }; // Separate moves for Player 1 and Player 2
let matchedPairs = 0;
let currentPlayer = 1;
let playerScores = { 1: 0, 2: 0 }; // Player 1 and Player 2 match scores
let timer;
let seconds = 0;
let minutes = 0;
let isPaused = false;
let isTwoPlayerMode = false;
let highScore = localStorage.getItem('highScore') || 0;

// Sound Effects
const flipSound = document.getElementById('flipSound');
const matchSound = document.getElementById('matchSound');
const winSound = document.getElementById('winSound');

// Elements
const startSinglePlayerBtn = document.getElementById('startSinglePlayerBtn');
const startTwoPlayerBtn = document.getElementById('startTwoPlayerBtn');
const goHomeBtn = document.getElementById('goHomeBtn');
const restartGameBtn = document.getElementById('restartGameBtn');
const toggleDarkModeBtn = document.getElementById('toggleDarkModeBtn');
const descriptionLink = document.getElementById('descriptionLink');
const closeDescriptionBtn = document.getElementById('closeDescriptionBtn');
const descriptionModal = document.getElementById('descriptionModal');
const timerDisplay = document.getElementById('timer');
const currentTurnDisplay = document.getElementById('currentTurn');
const player1Moves = document.getElementById('player1Moves');
const player1Matches = document.getElementById('player1Matches');
const player2Moves = document.getElementById('player2Moves');
const player2Matches = document.getElementById('player2Matches');
const confettiContainer = document.getElementById('confetti-container');

// Event Listeners
startSinglePlayerBtn.addEventListener('click', startSinglePlayerGame);
startTwoPlayerBtn.addEventListener('click', startTwoPlayerGame);
goHomeBtn.addEventListener('click', goHome);
restartGameBtn.addEventListener('click', restartGame);
toggleDarkModeBtn.addEventListener('click', toggleDarkMode);
descriptionLink.addEventListener('click', showDescription);
closeDescriptionBtn.addEventListener('click', closeDescription);

// Game Functions

function startSinglePlayerGame() {
  isTwoPlayerMode = false;
  resetGame();
  document.getElementById('homePage').style.display = 'none';
  document.getElementById('gamePage').style.display = 'block';
  document.getElementById('player2Stats').style.display = 'none'; // Hide Player 2 stats
  document.getElementById('currentTurn').style.display = 'none'; // Hide current turn display
  startTimer();
}

function startTwoPlayerGame() {
  isTwoPlayerMode = true;
  resetGame();
  document.getElementById('homePage').style.display = 'none';
  document.getElementById('gamePage').style.display = 'block';
  document.getElementById('player2Stats').style.display = 'block'; // Show Player 2 stats
  document.getElementById('currentTurn').style.display = 'block'; // Show current turn display
  startTimer();
}

function resetGame() {
  clearInterval(timer);
  moves = { 1: 0, 2: 0 }; // Reset player moves
  matchedPairs = 0;
  flippedCards = [];
  seconds = 0;
  minutes = 0;
  playerScores = { 1: 0, 2: 0 };
  updateStats();
  generateCards();
  confettiContainer.style.display = 'none'; // Hide confetti
}

function generateCards() {
  cards = [...emojis.slice(0, (gridSize * gridSize) / 2), ...emojis.slice(0, (gridSize * gridSize) / 2)];
  shuffle(cards);
  createCardElements();
}

function createCardElements() {
  const cardGrid = document.querySelector('.card-grid');
  cardGrid.innerHTML = '';
  cardGrid.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
  cards.forEach((emoji, index) => {
    const card = document.createElement('div');
    card.classList.add('card');
    card.dataset.emoji = emoji;
    card.dataset.index = index;
    const cardText = document.createElement('span');
    cardText.textContent = emoji;
    cardText.style.visibility = 'hidden';
    card.appendChild(cardText);
    card.addEventListener('click', () => flipCard(card));
    cardGrid.appendChild(card);
  });
}

function flipCard(card) {
  if (isPaused || card.classList.contains('flipped') || flippedCards.length === 2) return;
  flipSound.play();
  card.querySelector('span').style.visibility = 'visible';
  card.classList.add('flipped');
  flippedCards.push(card);

  if (flippedCards.length === 2) {
    if (isTwoPlayerMode) {
      moves[currentPlayer]++;
      updateStats();
    } else {
      moves[1]++;
      updateStats();
    }
    checkForMatch();
  }
}

function checkForMatch() {
  const [card1, card2] = flippedCards;
  if (card1.dataset.emoji === card2.dataset.emoji) {
    matchedPairs++;
    playerScores[currentPlayer] += 10;
    matchSound.play();
    card1.classList.add('matched');
    card2.classList.add('matched');
    flippedCards = [];
    updateStats();

    if (matchedPairs === cards.length / 2) {
      winSound.play();
      celebrateWin();
    }
  } else {
    setTimeout(() => {
      card1.classList.remove('flipped');
      card2.classList.remove('flipped');
      card1.querySelector('span').style.visibility = 'hidden';
      card2.querySelector('span').style.visibility = 'hidden';
      flippedCards = [];
      switchTurn();
    }, 1000);
  }
}

function updateStats() {
  // Single player mode
  if (!isTwoPlayerMode) {
    player1Moves.textContent = `Moves: ${moves[1]}`;
    player1Matches.textContent = `Matches: ${matchedPairs}`;
  } 
  // Two player mode
  else {
    player1Moves.textContent = `Moves: ${moves[1]}`;
    player1Matches.textContent = `Matches: ${playerScores[1]}`;
    player2Moves.textContent = `Moves: ${moves[2]}`;
    player2Matches.textContent = `Matches: ${playerScores[2]}`;
  }
}

function switchTurn() {
  if (isTwoPlayerMode) {
    currentPlayer = currentPlayer === 1 ? 2 : 1;
    currentTurnDisplay.textContent = `Turn: Player ${currentPlayer}`;
  }
}

function celebrateWin() {
  confettiContainer.style.display = 'block';
  setTimeout(() => {
    confettiContainer.style.display = 'none';
    displayWinner();
  }, 2000);
}

function displayWinner() {
  // Determine winner
  let winnerText = '';
  let winnerImage = '';
  if (isTwoPlayerMode) {
    if (playerScores[1] > playerScores[2]) {
      winnerText = 'Player 1 wins!';
      winnerImage = '🥇';
    } else if (playerScores[1] < playerScores[2]) {
      winnerText = 'Player 2 wins!';
      winnerImage = '🥇';
    } else {
      winnerText = 'It\'s a draw!';
      winnerImage = '🏆';
    }
  } else {
    winnerText = 'You win!';
    winnerImage = '🏆';
  }

  // Display winner with medal and stats
  winnerContainer.innerHTML = `
    <h2>${winnerText}</h2>
    <div class="winner-medal">${winnerImage}</div>
    <p>Score: Player 1 - ${playerScores[1]} | Player 2 - ${playerScores[2]}</p>
  `;
  winnerContainer.style.display = 'block';
}

function startTimer() {
  timer = setInterval(() => {
    if (!isPaused) {
      seconds++;
      if (seconds === 60) {
        minutes++;
        seconds = 0;
      }
      timerDisplay.textContent = `Time: ${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
  }, 1000);
}

function togglePause() {
  isPaused = !isPaused;
}

function goHome() {
  document.getElementById('homePage').style.display = 'block';
  document.getElementById('gamePage').style.display = 'none';
  winnerContainer.style.display = 'none';
}

function restartGame() {
  resetGame();
  generateCards();
}

function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
  document.querySelector('.home-container').classList.toggle('dark-mode');
}

function showDescription(event) {
  event.preventDefault();
  descriptionModal.style.display = 'block';
}

function closeDescription() {
  descriptionModal.style.display = 'none';
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]; 
  }
}