const SYMBOLS = ['🧠', '💸', '⚡', '🤖', '☁️', '📉'];
const SPIN_COST = 500;
const STARTING_TOKENS = 10000;

// Paytable multiplier relative to cost
const PAYTABLE = {
    '🧠,🧠,🧠': 5000,
    '💸,💸,💸': 2000,
    '⚡,⚡,⚡': 1000,
    '🤖,🤖,🤖': 500
};

const LOSING_MESSAGES = [
    "Hallucination! Tokens wasted.",
    "Context window exceeded. Try again.",
    "Model overfitted to garbage data.",
    "API rate limit reached (just kidding, you lost).",
    "GPU caught fire. -500 Tokens.",
    "Output filtered by safety guidelines.",
    "Catastrophic forgetting occurred."
];

let tokens = STARTING_TOKENS;
let isSpinning = false;

// DOM Elements
const tokenDisplay = document.getElementById('token-count');
const spinBtn = document.getElementById('spin-btn');
const reels = [
    document.getElementById('reel-1'),
    document.getElementById('reel-2'),
    document.getElementById('reel-3')
];
const messageDisplay = document.getElementById('message');

// Initialize
updateTokenDisplay();

spinBtn.addEventListener('click', spin);

async function spin() {
    if (isSpinning) return;
    
    if (tokens < SPIN_COST) {
        showMessage("Insufficient context tokens! You need more funding.", "lose");
        return;
    }

    // Deduct cost
    tokens -= SPIN_COST;
    updateTokenDisplay();
    
    isSpinning = true;
    spinBtn.disabled = true;
    spinBtn.textContent = "Generating...";
    showMessage("Processing prompt...", "");

    // Add spinning effect
    reels.forEach(reel => {
        reel.classList.add('spinning');
        // We'll simulate spinning by rapidly changing emojis
    });

    // Spin animation logic
    const spinDurations = [1000, 1500, 2000]; // Reels stop one by one
    const finalResults = [];

    const interval = setInterval(() => {
        reels.forEach((reel, index) => {
            if (spinDurations[index] > 0) {
                reel.textContent = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
            }
        });
    }, 50);

    // Stop reels progressively
    for (let i = 0; i < reels.length; i++) {
        await new Promise(resolve => setTimeout(resolve, spinDurations[i] - (i > 0 ? spinDurations[i-1] : 0)));
        const finalSymbol = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
        finalResults.push(finalSymbol);
        reels[i].classList.remove('spinning');
        reels[i].textContent = finalSymbol;
    }

    clearInterval(interval);
    
    checkWin(finalResults);
    
    isSpinning = false;
    spinBtn.disabled = false;
    spinBtn.textContent = "Generate (Spin)";
}

function checkWin(results) {
    const resultKey = results.join(',');
    const winAmount = PAYTABLE[resultKey];

    if (winAmount) {
        tokens += winAmount;
        updateTokenDisplay();
        
        let msg = "";
        if (results[0] === '🧠') msg = "AGI ACHIEVED! JACKPOT!";
        else if (results[0] === '💸') msg = "VC FUNDING SECURED!";
        else if (results[0] === '⚡') msg = "COMPUTE ALLOCATED!";
        else if (results[0] === '🤖') msg = "MODEL CONVERGED!";
        
        showMessage(`${msg} You won ${winAmount} Tokens!`, "win");
    } else {
        const randomLoseMsg = LOSING_MESSAGES[Math.floor(Math.random() * LOSING_MESSAGES.length)];
        showMessage(randomLoseMsg, "lose");
    }
}

function updateTokenDisplay() {
    // Formatting with commas
    tokenDisplay.textContent = tokens.toLocaleString();
    
    if (tokens < SPIN_COST) {
        tokenDisplay.style.color = 'var(--danger)';
    } else {
        tokenDisplay.style.color = 'var(--accent)';
    }
}

function showMessage(msg, type) {
    messageDisplay.textContent = msg;
    messageDisplay.className = ''; // Reset classes
    if (type) {
        messageDisplay.classList.add(type);
    }
}
