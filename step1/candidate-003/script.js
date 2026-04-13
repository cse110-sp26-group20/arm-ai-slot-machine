const SYMBOLS = ['🤖', '🧠', '💾', '💸', '📉', '🐛'];
const COST_PER_SPIN = 10;
const STARTING_BALANCE = 1000;

const PAYOUTS = {
    '🤖,🤖,🤖': 500,
    '🧠,🧠,🧠': 200,
    '💾,💾,💾': 100,
    '💸,💸,💸': 50,
    '📉,📉,📉': 20,
    '🐛,🐛,🐛': 0, // Hallucination, no payout
};

// Weighted distribution for symbols to make higher payouts rarer
const SYMBOL_WEIGHTS = [
    '🤖', // 1
    '🧠', '🧠', // 2
    '💾', '💾', '💾', // 3
    '💸', '💸', '💸', '💸', // 4
    '📉', '📉', '📉', '📉', '📉', // 5
    '🐛', '🐛', '🐛', '🐛', '🐛', '🐛' // 6
];

let balance = STARTING_BALANCE;
let isSpinning = false;

const balanceEl = document.getElementById('balance');
const lastWinEl = document.getElementById('lastWin');
const messageEl = document.getElementById('message');
const spinBtn = document.getElementById('spinButton');
const reels = [
    document.getElementById('reel1'),
    document.getElementById('reel2'),
    document.getElementById('reel3')
];

function updateStats() {
    balanceEl.textContent = balance;
    if (balance < COST_PER_SPIN) {
        spinBtn.disabled = true;
        spinBtn.textContent = 'INSUFFICIENT TOKENS';
        messageEl.textContent = 'Context window exhausted. Please purchase more compute.';
        messageEl.className = 'message lose';
    } else {
        spinBtn.disabled = isSpinning;
        spinBtn.textContent = `GENERATE (Cost: ${COST_PER_SPIN} Tokens)`;
    }
}

function getRandomSymbol() {
    const randomIndex = Math.floor(Math.random() * SYMBOL_WEIGHTS.length);
    return SYMBOL_WEIGHTS[randomIndex];
}

function spinReel(reelEl, duration) {
    return new Promise((resolve) => {
        reelEl.classList.add('spinning');
        
        // Visual spinning effect (changing symbols rapidly)
        let spinInterval = setInterval(() => {
            reelEl.querySelector('.symbol').textContent = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
        }, 100);

        setTimeout(() => {
            clearInterval(spinInterval);
            reelEl.classList.remove('spinning');
            const finalSymbol = getRandomSymbol();
            reelEl.querySelector('.symbol').textContent = finalSymbol;
            resolve(finalSymbol);
        }, duration);
    });
}

const AI_QUOTES = [
    "Generating output...",
    "Querying neural network...",
    "Optimizing loss function...",
    "Consuming API credits...",
    "Hallucinating facts...",
    "Bypassing safety filters..."
];

async function spin() {
    if (isSpinning || balance < COST_PER_SPIN) return;

    isSpinning = true;
    balance -= COST_PER_SPIN;
    updateStats();
    
    messageEl.textContent = AI_QUOTES[Math.floor(Math.random() * AI_QUOTES.length)];
    messageEl.className = 'message';
    lastWinEl.textContent = '0';

    // Spin reels with different durations for dramatic effect
    const spinPromises = [
        spinReel(reels[0], 1000),
        spinReel(reels[1], 1500),
        spinReel(reels[2], 2000)
    ];

    const results = await Promise.all(spinPromises);
    
    checkWin(results);
    isSpinning = false;
    updateStats();
}

function checkWin(results) {
    const resultKey = results.join(',');
    const payout = PAYOUTS[resultKey];

    if (payout !== undefined && payout > 0) {
        balance += payout;
        lastWinEl.textContent = payout;
        messageEl.textContent = `Success! Output generated. +${payout} Tokens`;
        messageEl.className = 'message win';
    } else if (resultKey === '🐛,🐛,🐛') {
        messageEl.textContent = 'Critical Hallucination! The AI invented a new color and crashed.';
        messageEl.className = 'message lose';
    } else {
        messageEl.textContent = 'Output discarded. Try another prompt.';
        messageEl.className = 'message';
    }
}

spinBtn.addEventListener('click', spin);

// Initial setup
updateStats();