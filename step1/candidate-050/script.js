const symbols = ['🧠', '🖥️', '🤖', '💸', '🗑️', '📉'];
const symbolWeights = [1, 2, 3, 4, 5, 4]; // Higher number = more common. Total = 19
const costPerSpin = 10;
let balance = 1000;
let isSpinning = false;

const balanceEl = document.getElementById('balance');
const messageEl = document.getElementById('message');
const spinButton = document.getElementById('spin-button');
const reels = [
    document.getElementById('reel1'),
    document.getElementById('reel2'),
    document.getElementById('reel3')
];

// Payout mapping
const payouts = {
    '🧠,🧠,🧠': { reward: 500, msg: "AGI ACHIEVED! The singularity is here!" },
    '🖥️,🖥️,🖥️': { reward: 100, msg: "Secured H100 cluster! Massive compute win!" },
    '🤖,🤖,🤖': { reward: 50, msg: "Perfect inference! Helpful and harmless." },
    '💸,💸,💸': { reward: 25, msg: "Series A funding secured! Burn rate increased." },
    '🗑️,🗑️,🗑️': { reward: 0, msg: "Complete hallucination. Did you even prompt engineer?" },
    '📉,📉,📉': { reward: -50, msg: "AI Winter is coming. Valuations crashed!" }
};

function getRandomSymbol() {
    // Weighted random selection
    const totalWeight = symbolWeights.reduce((a, b) => a + b, 0);
    let randomNum = Math.random() * totalWeight;
    
    for (let i = 0; i < symbols.length; i++) {
        if (randomNum < symbolWeights[i]) {
            return symbols[i];
        }
        randomNum -= symbolWeights[i];
    }
    return symbols[symbols.length - 1]; // Fallback
}

function updateBalance(amount) {
    balance += amount;
    balanceEl.textContent = balance;
}

function displayMessage(text, type = '') {
    messageEl.textContent = text;
    messageEl.className = 'message-board ' + type;
}

function spin() {
    if (isSpinning) return;
    if (balance < costPerSpin) {
        displayMessage("Rate limit exceeded! Insufficient API credits.", "lose");
        return;
    }

    isSpinning = true;
    spinButton.disabled = true;
    updateBalance(-costPerSpin);
    displayMessage("Generating response... (Processing)", "");

    // Rapidly change symbols for visual effect
    const spinIntervals = [];
    reels.forEach((reel, index) => {
        const interval = setInterval(() => {
            reel.querySelector('.symbol').textContent = symbols[Math.floor(Math.random() * symbols.length)];
        }, 50); // Change every 50ms
        spinIntervals.push(interval);
    });

    // Determine results beforehand
    const results = [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()];

    // Stop reels one by one with delays
    reels.forEach((reel, index) => {
        setTimeout(() => {
            clearInterval(spinIntervals[index]);
            reel.querySelector('.symbol').textContent = results[index];
            
            // If it's the last reel, evaluate win
            if (index === reels.length - 1) {
                evaluateResult(results);
            }
        }, 1000 + (index * 400)); // Stop at 1s, 1.4s, 1.8s
    });
}

function evaluateResult(results) {
    isSpinning = false;
    spinButton.disabled = false;

    const resultKey = results.join(',');
    
    if (payouts[resultKey]) {
        const winData = payouts[resultKey];
        updateBalance(winData.reward);
        
        if (winData.reward > 0) {
            displayMessage(winData.msg + ` (+${winData.reward} 🪙)`, 'win');
        } else if (winData.reward < 0) {
             displayMessage(winData.msg + ` (${winData.reward} 🪙)`, 'lose');
        } else {
             displayMessage(winData.msg, 'lose');
        }
    } else {
        // Count specific symbols for minor generic messages
        const trashCount = results.filter(s => s === '🗑️').length;
        const brainCount = results.filter(s => s === '🧠').length;
        const winterCount = results.filter(s => s === '📉').length;
        
        if (trashCount >= 2) {
             displayMessage("Output degraded into gibberish. (-5 🪙 penalty)", "lose");
             updateBalance(-5);
        } else if (brainCount >= 2) {
             displayMessage("Promising reasoning trace... (+5 🪙 rebate)", "win");
             updateBalance(5);
        } else if (winterCount >= 2) {
             displayMessage("Investors are losing confidence. (-10 🪙 penalty)", "lose");
             updateBalance(-10);
        } else {
             displayMessage("Output generated successfully. (No reward)", "");
        }
    }

    if (balance <= 0) {
        displayMessage("Account suspended due to negative balance.", "lose");
        spinButton.disabled = true;
    }
}

spinButton.addEventListener('click', spin);

// Init reels with random symbols
reels.forEach(reel => {
    reel.querySelector('.symbol').textContent = getRandomSymbol();
});