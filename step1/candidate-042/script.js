const symbols = [
    { emoji: '🤖', name: 'AI Bot', weight: 40 },
    { emoji: '💸', name: 'Wasted VC Money', weight: 30 },
    { emoji: '📉', name: 'Model Collapse', weight: 20 },
    { emoji: '🍒', name: 'Cherry-picked Data', weight: 15 },
    { emoji: '⚡️', name: 'Compute Power', weight: 10 },
    { emoji: '🧠', name: 'AGI', weight: 2 }
];

// Flatten the array based on weights to easily pick a random symbol
const weightedSymbols = [];
symbols.forEach(symbol => {
    for (let i = 0; i < symbol.weight; i++) {
        weightedSymbols.push(symbol);
    }
});

let balance = 1000;
const COST_PER_SPIN = 10;
let isSpinning = false;

const reelElements = [
    document.getElementById('reel1'),
    document.getElementById('reel2'),
    document.getElementById('reel3')
];
const balanceDisplay = document.getElementById('balance');
const spinButton = document.getElementById('spin-button');
const messageBoard = document.getElementById('message-board');

function getRandomSymbol() {
    const randomIndex = Math.floor(Math.random() * weightedSymbols.length);
    return weightedSymbols[randomIndex];
}

function updateBalance(amount) {
    balance += amount;
    balanceDisplay.textContent = balance;
    
    if (balance < COST_PER_SPIN) {
        spinButton.disabled = true;
        messageBoard.textContent = "Out of Context Tokens! Please buy more API credits.";
        messageBoard.style.color = "var(--danger)";
    }
}

function spin() {
    if (isSpinning || balance < COST_PER_SPIN) return;

    isSpinning = true;
    spinButton.disabled = true;
    updateBalance(-COST_PER_SPIN);
    messageBoard.textContent = "Generating response (Streaming)...";
    messageBoard.style.color = "var(--text-color)";

    const results = [];
    const spinDurations = [1000, 1500, 2000]; // Reels stop one by one

    reelElements.forEach((reel, index) => {
        reel.classList.add('spinning');
        
        // Visual spinning effect
        const spinInterval = setInterval(() => {
            reel.textContent = getRandomSymbol().emoji;
        }, 100);

        setTimeout(() => {
            clearInterval(spinInterval);
            reel.classList.remove('spinning');
            const finalSymbol = getRandomSymbol();
            reel.textContent = finalSymbol.emoji;
            results[index] = finalSymbol;

            // When the last reel stops
            if (index === reelElements.length - 1) {
                evaluateResult(results);
                isSpinning = false;
                if (balance >= COST_PER_SPIN) {
                    spinButton.disabled = false;
                }
            }
        }, spinDurations[index]);
    });
}

function evaluateResult(results) {
    const counts = {};
    results.forEach(res => {
        counts[res.name] = (counts[res.name] || 0) + 1;
    });

    let winAmount = 0;
    let message = "";
    let color = "#fbbf24"; // default yellow

    // Check for 3 of a kind
    const threeOfAKind = Object.keys(counts).find(key => counts[key] === 3);
    const twoOfAKind = Object.keys(counts).find(key => counts[key] === 2);

    if (threeOfAKind) {
        switch (threeOfAKind) {
            case 'AGI':
                winAmount = 5000;
                message = "AGI ACHIEVED! JACKPOT! +5000 Tokens!";
                color = "var(--accent)";
                break;
            case 'Compute Power':
                winAmount = 500;
                message = "Unlimited Compute! +500 Tokens!";
                color = "var(--accent)";
                break;
            case 'Cherry-picked Data':
                winAmount = 200;
                message = "Benchmark SOTA! +200 Tokens!";
                color = "var(--accent)";
                break;
            case 'Model Collapse':
                winAmount = -50; // Penalty
                message = "Absolute Model Collapse! You lost extra 50 Tokens!";
                color = "var(--danger)";
                break;
            case 'Wasted VC Money':
                winAmount = 100;
                message = "Series A Raised! +100 Tokens!";
                color = "var(--accent)";
                break;
            case 'AI Bot':
                winAmount = 50;
                message = "Helpful Assistant. +50 Tokens.";
                color = "var(--accent)";
                break;
        }
    } else if (twoOfAKind) {
         switch (twoOfAKind) {
            case 'AGI':
                winAmount = 500;
                message = "Almost AGI! +500 Tokens!";
                color = "var(--accent)";
                break;
            case 'Compute Power':
                winAmount = 50;
                message = "More GPUs acquired! +50 Tokens!";
                color = "var(--accent)";
                break;
            case 'Cherry-picked Data':
                winAmount = 20;
                message = "Good evals! +20 Tokens!";
                color = "var(--accent)";
                break;
            case 'AI Bot':
                winAmount = 10;
                message = "Basic response generated. +10 Tokens.";
                break;
            case 'Model Collapse':
            case 'Wasted VC Money':
                message = "Hallucination detected. No payout.";
                color = "var(--danger)";
                break;
        }
    } else {
        message = "Safety Filter Triggered! Try again.";
        color = "var(--danger)";
    }

    if (winAmount > 0) {
        updateBalance(winAmount);
    } else if (winAmount < 0) {
        updateBalance(winAmount); // For penalties
    }

    messageBoard.textContent = message;
    messageBoard.style.color = color;
}

spinButton.addEventListener('click', spin);

// Initial setup
reelElements.forEach(reel => reel.textContent = '🤖');
