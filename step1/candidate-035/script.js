const symbols = ['🧠', '🤖', '🔋', '☁️', '💾', '📉'];
const payouts = {
    '🧠': 100, // AGI
    '🤖': 50,  // Useful Model
    '🔋': 20,  // Compute
    '☁️': 10,  // Cloud
    '💾': 5    // Data
};

const loseMessages = [
    "Hallucination! Model generated garbage.",
    "Out of compute. GPU cluster crashed.",
    "VC funding dried up.",
    "Training data poisoned.",
    "Your startup is now a wrapper.",
    "Replaced by a smaller, cheaper model.",
    "Copyright lawsuit pending.",
    "Overfitting! Cannot generalize."
];

let tokens = 1000;
const bet = 10;
let isSpinning = false;

const reelElements = [
    document.getElementById('reel1'),
    document.getElementById('reel2'),
    document.getElementById('reel3')
];
const tokensDisplay = document.getElementById('tokens');
const spinBtn = document.getElementById('spin-btn');
const messageDisplay = document.getElementById('message');
const messageBoard = document.querySelector('.message-board');

function updateTokens() {
    tokensDisplay.textContent = tokens;
}

function getRandomSymbol() {
    // Add weights to make winning harder
    const weightedSymbols = [
        '🧠', 
        '🤖', '🤖', 
        '🔋', '🔋', '🔋', 
        '☁️', '☁️', '☁️', '☁️', 
        '💾', '💾', '💾', '💾', '💾',
        '📉', '📉', '📉', '📉', '📉', '📉', '📉', '📉' // High chance to lose
    ];
    return weightedSymbols[Math.floor(Math.random() * weightedSymbols.length)];
}

function setReels(symbol1, symbol2, symbol3) {
    reelElements[0].textContent = symbol1;
    reelElements[1].textContent = symbol2;
    reelElements[2].textContent = symbol3;
}

function displayMessage(msg, type = 'normal') {
    messageDisplay.textContent = msg;
    messageBoard.className = 'message-board';
    if (type !== 'normal') {
        messageBoard.classList.add(type);
    }
}

async function spinReel(reelElement, duration) {
    return new Promise(resolve => {
        reelElement.classList.add('spinning');
        
        let interval = setInterval(() => {
            reelElement.textContent = symbols[Math.floor(Math.random() * symbols.length)];
        }, 50);

        setTimeout(() => {
            clearInterval(interval);
            reelElement.classList.remove('spinning');
            const finalSymbol = getRandomSymbol();
            reelElement.textContent = finalSymbol;
            resolve(finalSymbol);
        }, duration);
    });
}

async function spin() {
    if (isSpinning || tokens < bet) {
        if (tokens < bet) {
            displayMessage("Bankruptcy! Start a new pivot (refresh page).", "lose");
        }
        return;
    }

    isSpinning = true;
    tokens -= bet;
    updateTokens();
    spinBtn.disabled = true;
    displayMessage("Training model... burning compute...", "normal");

    // Spin reels with different durations for effect
    const results = await Promise.all([
        spinReel(reelElements[0], 1000),
        spinReel(reelElements[1], 1500),
        spinReel(reelElements[2], 2000)
    ]);

    checkWin(results);
    isSpinning = false;
    spinBtn.disabled = false;
}

function checkWin(results) {
    const [s1, s2, s3] = results;

    if (s1 === s2 && s2 === s3) {
        // Three of a kind
        if (s1 === '📉') {
            displayMessage("Market crashed! The bubble burst.", "lose");
        } else {
            const winAmount = bet * payouts[s1];
            tokens += winAmount;
            updateTokens();
            
            if (s1 === '🧠') {
                displayMessage(`AGI ACHIEVED! You won ${winAmount} tokens! humanity is doomed.`, "jackpot");
            } else {
                displayMessage(`Success! Model deployed. Won ${winAmount} tokens.`, "win");
            }
        }
    } else {
        // Lose
        const randomLoseMsg = loseMessages[Math.floor(Math.random() * loseMessages.length)];
        displayMessage(randomLoseMsg, "lose");
    }
}

spinBtn.addEventListener('click', spin);
