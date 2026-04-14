const symbols = ['🤖', '🧠', '⚡', '💾', '💸', '📉'];
const costPerSpin = 50;
let balance = 1000;
let isSpinning = false;

const balanceEl = document.getElementById('balance');
const lastWinEl = document.getElementById('last-win');
const messageEl = document.getElementById('message');
const spinBtn = document.getElementById('spin-button');
const reels = [
    document.getElementById('reel1').querySelector('.symbol'),
    document.getElementById('reel2').querySelector('.symbol'),
    document.getElementById('reel3').querySelector('.symbol')
];

// Payouts
const payouts = {
    '🤖': 1000,
    '🧠': 500,
    '⚡': 250,
    '💾': 100,
    '💸': 50
};

const loseMessages = [
    "Hallucination detected. 0 tokens.",
    "Gradient descent into bankruptcy...",
    "Overfit on losing data.",
    "Context window exceeded. Try again.",
    "Model collapsed. Compute wasted.",
    "GPU burnt out. Buy more tokens.",
    "Prompt rejected by safety filter."
];

function updateDisplay() {
    balanceEl.textContent = balance;
}

function getRandomSymbol() {
    return symbols[Math.floor(Math.random() * symbols.length)];
}

function getRandomLoseMessage() {
    return loseMessages[Math.floor(Math.random() * loseMessages.length)];
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function spin() {
    if (isSpinning) return;
    
    if (balance < costPerSpin) {
        messageEl.textContent = "Insufficient compute! Buy more GPUs.";
        messageEl.className = 'message-lose';
        return;
    }

    isSpinning = true;
    balance -= costPerSpin;
    updateDisplay();
    lastWinEl.textContent = "0";
    
    messageEl.textContent = "Generating parameters...";
    messageEl.className = '';
    spinBtn.disabled = true;

    // Add spinning visual effect
    reels.forEach(reel => reel.parentElement.classList.add('spinning'));

    // Simulate API latency/spinning
    const spinDurations = [1000, 1500, 2000];
    const results = [];

    for (let i = 0; i < 3; i++) {
        // Keep changing symbols rapidly while "spinning"
        const interval = setInterval(() => {
            reels[i].textContent = getRandomSymbol();
        }, 50);

        await sleep(spinDurations[i]);
        clearInterval(interval);
        
        reels[i].parentElement.classList.remove('spinning');
        const finalSymbol = getRandomSymbol();
        reels[i].textContent = finalSymbol;
        results.push(finalSymbol);
        
        // Add a little pop effect when reel stops
        reels[i].parentElement.style.transform = 'scale(1.1)';
        setTimeout(() => reels[i].parentElement.style.transform = 'none', 100);
    }

    calculateWin(results);
    isSpinning = false;
    spinBtn.disabled = false;
}

function calculateWin(results) {
    let winAmount = 0;
    
    // All 3 match
    if (results[0] === results[1] && results[1] === results[2]) {
        const symbol = results[0];
        winAmount = payouts[symbol] || 0;
        
        if (symbol === '📉') {
             messageEl.textContent = "GPU Shortage! You lose everything!";
             messageEl.className = 'message-lose';
             balance = 0;
             updateDisplay();
             return;
        } else if (winAmount > 0) {
            messageEl.textContent = `AGI Achieved! Won ${winAmount} tokens!`;
            messageEl.className = 'message-win';
        }
    } 
    // Any 2 match
    else if (results[0] === results[1] || results[1] === results[2] || results[0] === results[2]) {
        // Don't reward double GPU shortage
        const matchingSymbol = results[0] === results[1] ? results[0] : results[2];
        if (matchingSymbol !== '📉') {
            winAmount = 10;
            messageEl.textContent = `Partial Convergence. Won ${winAmount} tokens.`;
            messageEl.className = 'message-win';
        } else {
             messageEl.textContent = "Minor loss scaling issue.";
             messageEl.className = 'message-lose';
        }
    } 
    // No match
    else {
        messageEl.textContent = getRandomLoseMessage();
        messageEl.className = 'message-lose';
    }

    if (winAmount > 0) {
        balance += winAmount;
        lastWinEl.textContent = winAmount;
        updateDisplay();
    }
}

spinBtn.addEventListener('click', spin);

// Initialize
updateDisplay();