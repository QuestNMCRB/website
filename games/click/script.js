console.log("Welcome to My First Game!");

// Configuration object to store all configurable parameters
const config = {
    initialTime: 10,
    minTimeLimit: 3,
    scoreIncrement: 1,
    levelUpScore: 5,
    extraTimeButtonLevel: 15,
    extraTime: 15,
    gridSize: 4,
    buttonText: 'Click Me!',
    extraTimeButtonText: 'Add 15s',
    defaultPlayerName: 'Anonymous',
    highScoreKey: 'highScore',
    leaderboardKey: 'leaderboard',
    playerNameKey: 'playerName',
    buttonStyles: {
        default: {
            backgroundColor: '#007bff',
            color: 'white',
            padding: '10px 20px',
            fontSize: '18px',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            transition: 'transform 0.1s, left 0.5s, top 0.5s',
            position: 'absolute',
            margin: '5px',
        },
        extraTime: {
            backgroundColor: 'green',
            color: 'white',
        },
    },
    messages: {
        welcome: "Welcome to My First Game!",
        gameOver: score => `Game over! Your score is ${score}`,
        namePrompt: "What's your name?",
        changeNameButton: 'Change Name',
        clearLeaderboardButton: 'Clear Leaderboard',
        restartButton: 'Restart',
        startButton: 'Start Game',
        defaultWelcomeMessage: "Let's start building something awesome!",
    },
    beepSound: 'beep.mp3',
    adjectives: ['Silly', 'Brave', 'Clever', 'Happy', 'Grumpy', 'Sneaky', 'Jolly', 'Witty', 'Lucky', 'Zany', 'Bouncy', 'Cheerful', 'Dizzy', 'Energetic', 'Funny', 'Goofy', 'Hyper', 'Jumpy', 'Lazy', 'Naughty'],
    nouns: ['Penguin', 'Tiger', 'Panda', 'Elephant', 'Koala', 'Kangaroo', 'Unicorn', 'Dragon', 'Monkey', 'Zebra', 'Giraffe', 'Hippo', 'Lion', 'Octopus', 'Squirrel', 'Whale', 'Platypus', 'Peacock', 'Otter', 'Fox']
};

// Select DOM elements
const elements = {
    buttonContainer: document.getElementById('buttonContainer'),
    restartButton: document.getElementById('restartButton'),
    clearLeaderboardButton: document.getElementById('clearLeaderboardButton'),
    changeNameButton: document.getElementById('changeNameButton'),
    scoreDisplay: document.getElementById('score'),
    timeLeftDisplay: document.getElementById('timeLeft'),
    highScoreDisplay: document.getElementById('highScore'),
    levelDisplay: document.getElementById('level'),
    leaderboardDisplay: document.getElementById('leaderboard'),
    welcomeMessage: document.getElementById('welcomeMessage'),
};

// Load the beep sound
const beep = new Audio(config.beepSound);

// Initialize the game state variables
let gameState = {
    score: 0,
    timeLeft: config.initialTime,
    timer: null,
    level: 1,
    playerName: localStorage.getItem(config.playerNameKey) || '',
    highScore: localStorage.getItem(config.highScoreKey) || 0,
    leaderboard: JSON.parse(localStorage.getItem(config.leaderboardKey)) || [],
    extraTimeButton: null,
};

elements.highScoreDisplay.textContent = gameState.highScore;
displayLeaderboard();

// Function to generate a random name
function generateRandomName() {
    const randomAdjective = config.adjectives[Math.floor(Math.random() * config.adjectives.length)];
    const randomNoun = config.nouns[Math.floor(Math.random() * config.nouns.length)];
    return `${randomAdjective}${randomNoun}`;
}

// Function to start the game
function startGame() {
    if (!gameState.playerName) {
        gameState.playerName = prompt(config.messages.namePrompt) || generateRandomName();
        localStorage.setItem(config.playerNameKey, gameState.playerName);
    }
    elements.welcomeMessage.textContent = `Welcome, ${gameState.playerName}! ${config.messages.defaultWelcomeMessage}`;

    gameState.score = 0;
    gameState.level = 1;
    gameState.timeLeft = config.initialTime;
    updateGameUI();
    elements.buttonContainer.style.backgroundColor = '#ffffff'; // Set background to white at the start
    enableButtons();
    elements.restartButton.style.display = 'none';
    gameState.timer = setInterval(updateTimer, 1000);
}

// Function to update the game UI
function updateGameUI() {
    elements.scoreDisplay.textContent = gameState.score;
    elements.timeLeftDisplay.textContent = gameState.timeLeft;
    elements.levelDisplay.textContent = gameState.level;
    elements.timeLeftDisplay.classList.remove('countdown');
}

// Function to generate a random muted color
function getRandomColor() {
    const r = Math.floor(Math.random() * 156) + 50; // RGB value between 50 and 205
    const g = Math.floor(Math.random() * 156) + 50; // RGB value between 50 and 205
    const b = Math.floor(Math.random() * 156) + 50; // RGB value between 50 and 205
    return `rgb(${r}, ${g}, ${b})`;
}

// Function to change the background color to a random muted color
function changeBackgroundColor() {
    const randomColor = getRandomColor();
    elements.buttonContainer.style.backgroundColor = randomColor;
}

// Function to center the button within the container
function centerButton(button) {
    button.style.left = '50%';
    button.style.top = '50%';
    button.style.transform = 'translate(-50%, -50%)';
}

// Add event listeners to the buttons
function enableButtons() {
    elements.buttonContainer.innerHTML = ''; // Clear existing buttons
    
    const button = document.createElement('button');
    button.textContent = config.buttonText;
    button.addEventListener('click', handleButtonClick);
    applyStyles(button, config.buttonStyles.default);
    elements.buttonContainer.appendChild(button);
    centerButton(button); // Center the button initially

    // Add the extra time button if at level 15 or higher
    if (gameState.level >= config.extraTimeButtonLevel && !gameState.extraTimeButton) {
        gameState.extraTimeButton = document.createElement('button');
        gameState.extraTimeButton.textContent = config.extraTimeButtonText;
        applyStyles(gameState.extraTimeButton, config.buttonStyles.extraTime);
        gameState.extraTimeButton.addEventListener('click', addExtraTime);
        elements.buttonContainer.appendChild(gameState.extraTimeButton);
    }
}

// Function to apply styles to a button
function applyStyles(button, styles) {
    for (let [key, value] of Object.entries(styles)) {
        button.style[key] = value;
    }
}

// Handle button click
function handleButtonClick(event) {
    gameState.score += config.scoreIncrement;
    elements.scoreDisplay.textContent = gameState.score;
    event.target.classList.add('clicked');
    setTimeout(() => event.target.classList.remove('clicked'), 100);
    if (gameState.score % config.levelUpScore === 0) {
        levelUp();
    }
    if (gameState.level >= 10) {
        moveButtonRandomly(event.target);
    }
}

// Function to add extra time
function addExtraTime() {
    gameState.timeLeft += config.extraTime;
    elements.timeLeftDisplay.textContent = gameState.timeLeft;
    gameState.extraTimeButton.style.display = 'none'; // Hide the button after it is clicked
}

// Function to level up
function levelUp() {
    gameState.level++;
    if (gameState.level < 10) {
        gameState.timeLeft = config.initialTime - gameState.level; // Decrease the time limit with each level
    }
    if (gameState.timeLeft < config.minTimeLimit) {
        gameState.timeLeft = config.minTimeLimit; // Set a minimum time limit
    }
    updateGameUI();
    changeBackgroundColor(); // Change background color on level up
    // Enable the extra time button if level 15 is reached
    if (gameState.level >= config.extraTimeButtonLevel && !gameState.extraTimeButton) {
        enableButtons();
    }
}

// Function to move the button to a random position within the grid
function moveButtonRandomly(button) {
    const cellWidth = elements.buttonContainer.offsetWidth / config.gridSize;
    const cellHeight = elements.buttonContainer.offsetHeight / config.gridSize;
    const randomX = Math.floor(Math.random() * config.gridSize) * cellWidth;
    const randomY = Math.floor(Math.random() * config.gridSize) * cellHeight;
    button.style.left = `${randomX}px`;
    button.style.top = `${randomY}px`;
    button.style.transform = ''; // Reset transform
}

// Function to update the timer
function updateTimer() {
    gameState.timeLeft--;
    elements.timeLeftDisplay.textContent = gameState.timeLeft;
    beep.play();
    if (gameState.timeLeft <= 3) {
        elements.timeLeftDisplay.classList.add('countdown');
    }
    if (gameState.timeLeft <= 0) {
        clearInterval(gameState.timer);
        clearButtons();
        elements.restartButton.style.display = 'inline';
        elements.restartButton.textContent = config.messages.restartButton;
        if (gameState.score > gameState.highScore) {
            gameState.highScore = gameState.score;
            elements.highScoreDisplay.textContent = gameState.highScore;
            localStorage.setItem(config.highScoreKey, gameState.highScore);
        }
        updateLeaderboard(gameState.playerName, gameState.score);
        alert(config.messages.gameOver(gameState.score));
    }
}

// Clear buttons
function clearButtons() {
    elements.buttonContainer.innerHTML = ''; // Clear existing buttons
}

// Add an event listener to the restart button
elements.restartButton.addEventListener('click', startGame);

// Add an event listener to the clear leaderboard button
elements.clearLeaderboardButton.addEventListener('click', clearLeaderboard);

// Add an event listener to the change name button
elements.changeNameButton.addEventListener('click', changeName);

// Function to clear the leaderboard
function clearLeaderboard() {
    gameState.leaderboard = [];
    localStorage.setItem(config.leaderboardKey, JSON.stringify(gameState.leaderboard));
    displayLeaderboard();
}

// Function to change the player's name
function changeName() {
    const newName = prompt(config.messages.namePrompt) || generateRandomName();

    if (newName && gameState.playerName !== newName) {
        // Check if the current player name exists in the leaderboard
        let existingEntry = gameState.leaderboard.find(entry => entry.name === gameState.playerName);

        // If an entry exists, update it with the new name
        if (existingEntry) {
            existingEntry.name = newName;
        }

        // Update the player name
        gameState.playerName = newName;
        localStorage.setItem(config.playerNameKey, gameState.playerName);

        // Update the welcome message
        elements.welcomeMessage.textContent = `Welcome, ${gameState.playerName}! ${config.messages.defaultWelcomeMessage}`;
        
        // Update the leaderboard in local storage
        localStorage.setItem(config.leaderboardKey, JSON.stringify(gameState.leaderboard));
        displayLeaderboard();
    }
}

// Function to update the leaderboard
function updateLeaderboard(name, newScore) {
    if (name && newScore) {
        // Check if the name already exists in the leaderboard
        let existingEntry = gameState.leaderboard.find(entry => entry.name === name);
        if (existingEntry) {
            // Update the score if the name exists
            existingEntry.score = Math.max(existingEntry.score, newScore);
        } else {
            // Add new entry if the name does not exist
            gameState.leaderboard.push({ name, score: newScore });
        }

        // Sort the leaderboard
        gameState.leaderboard.sort((a, b) => b.score - a.score);

        // Ensure the leaderboard does not exceed 5 entries
        if (gameState.leaderboard.length > 5) {
            gameState.leaderboard.pop();
        }

        // Save the updated leaderboard to local storage
        localStorage.setItem(config.leaderboardKey, JSON.stringify(gameState.leaderboard));
        displayLeaderboard();
    }
}

// Function to display the leaderboard
function displayLeaderboard() {
    elements.leaderboardDisplay.innerHTML = '';
    gameState.leaderboard.forEach((entry) => {
        if (entry.name && entry.score) {
            const li = document.createElement('li');
            li.textContent = `${entry.name}: ${entry.score}`;
            elements.leaderboardDisplay.appendChild(li);
        }
    });
}
