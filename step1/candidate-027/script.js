const symbols = [
    { emoji: '🧠', name: 'AGI', value: 100 },
    { emoji: ' GPU ', name: 'H100', value: 50 },
    { emoji: '📉', name: 'Loss', value: 25 },
    { emoji: '🦜', name: 'Stochastic Parrot', value: 10 },
    { emoji: '🗑️', name: 'Garbage Data', value: 5 },
    { emoji: '🌀', name: 'Hallucination', value: 0 }
];

const winMessages = [
    "AGI Achieved! Just kidding, here are some tokens.",
    "Model loss optimized! You won!",
    "Sam Altman approves this spin.",
    "Scaling laws hold true! Massive payout!",
    "Your context window just expanded!"
];

const loseMessages = [
    "Error 429: Too Many Requests. Spin again.",
    "Model hallucinated a win. Sorry.",
    "GPU caught fire. Tokens burned.",
    "As an AI language model, I cannot let you win.",
    "Training data poisoned. You lost.",
    "Your prompt was blocked by safety filters."
];

let tokens = 1000;
const spinCost = 50;
let isSpinning = false;

const slotElements = [
    document.getElementById('slot1'),
    document.getElementById('slot2'),
    document.getElementById('slot3')
];
const tokenCountEl = document.getElementById('token-count');
const spinButton = document.getElementById('spin-button');
const messageEl = document.getElementById('message');

function updateTokens() {
    tokenCountEl.textContent = tokens;
}

function getRandomSymbol() {
    const weights = [5, 10, 20, 30, 40, 50]; // Higher index = more likely
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let randomNum = Math.random() * totalWeight;
    
    for (let i = 0; i < weights.length; i++) {
        if (randomNum < weights[i]) {
            return symbols[i];
        }
        randomNum -= weights[i];
    }
    return symbols[symbols.length - 1];
}

function getRandomMessage(messages) {
    return messages[Math.floor(Math.random() * messages.length)];
}

async function spin() {
    if (isSpinning || tokens < spinCost) return;

    isSpinning = true;
    tokens -= spinCost;
    updateTokens();
    
    spinButton.disabled = true;
    messageEl.textContent = "Generating response...";
    messageEl.className = ""; // Reset class

    // Start spinning animation
    slotElements.forEach(el => el.classList.add('spinning'));

    // Rapidly change symbols to simulate spinning
    const spinInterval = setInterval(() => {
        slotElements.forEach(el => {
            el.textContent = symbols[Math.floor(Math.random() * symbols.length)].emoji;
        });
    }, 50);

    // Stop spinning after a delay
    setTimeout(() => {
        clearInterval(spinInterval);
        slotElements.forEach(el => el.classList.remove('spinning'));
        evaluateSpin();
    }, 2000); // 2 seconds spin
}

function evaluateSpin() {
    const results = [
        getRandomSymbol(),
        getRandomSymbol(),
        getRandomSymbol()
    ];

    // Display final symbols
    for (let i = 0; i < 3; i++) {
        slotElements[i].textContent = results[i].emoji;
    }

    let won = false;
    let payout = 0;

    // Check for wins (all 3 match)
    if (results[0].name === results[1].name && results[1].name === results[2].name) {
        won = true;
        // Payout is based on the symbol value * some multiplier
        payout = results[0].value * 10; 
    } 
    // Small win for 2 matching
    else if (results[0].name === results[1].name || results[1].name === results[2].name || results[0].name === results[2].name) {
        // Find which one matched to give appropriate payout
        const matchedSymbol = results[0].name === results[1].name ? results[0] : results[2];
        if (matchedSymbol.value > 0) { // Don't payout for hallucinations
             won = true;
             payout = matchedSymbol.value * 2;
        }
    }

    if (won && payout > 0) {
        tokens += payout;
        messageEl.textContent = `[SUCCESS] ${getRandomMessage(winMessages)} Payout: +${payout} 🪙`;
        messageEl.className = "win-text";
    } else {
        messageEl.textContent = `[SYSTEM] ${getRandomMessage(loseMessages)}`;
        messageEl.className = "error-text";
    }

    updateTokens();
    isSpinning = false;
    
    if (tokens < spinCost) {
        spinButton.disabled = true;
        messageEl.textContent = "Insufficient context length (tokens). Please upgrade to Pro.";
    } else {
        spinButton.disabled = false;
    }
}

spinButton.addEventListener('click', spin);

// Initialize
updateTokens();