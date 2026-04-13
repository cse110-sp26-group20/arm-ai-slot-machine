const symbols = ['🧠', '🚀', '🤖', '🔮', '💸', '🗑️', '📉'];

const payTable = {
    '🧠,🧠,🧠': { mult: 100, msg: "AGI ACHIEVED! (We think)" },
    '🚀,🚀,🚀': { mult: 50, msg: "Series A Secured! Hype off the charts!" },
    '🤖,🤖,🤖': { mult: 20, msg: "Good Bot. Sentience level: Basic." },
    '🔮,🔮,🔮': { mult: 10, msg: "Massive Hallucination! But it sounds confident!" },
    '💸,💸,💸': { mult: -100, msg: "Oops! You left the AWS instances running!" },
    '🗑️,🗑️,🗑️': { mult: 5, msg: "Garbage In, Garbage Out... but somehow you profited?" },
    '📉,📉,📉': { mult: 5, msg: "Loss function minimized! Slightly." }
};

let tokens = 1000;
let currentBet = 10;
let isSpinning = false;

const tokenCountEl = document.getElementById('token-count');
const messageEl = document.getElementById('message');
const spinBtn = document.getElementById('spin-btn');
const betAmountEl = document.getElementById('bet-amount');
const betUpBtn = document.getElementById('bet-up');
const betDownBtn = document.getElementById('bet-down');

const reels = [
    document.querySelector('#reel-1 .symbol'),
    document.querySelector('#reel-2 .symbol'),
    document.querySelector('#reel-3 .symbol')
];

function updateDisplay() {
    tokenCountEl.textContent = tokens;
    betAmountEl.textContent = currentBet;
    
    if (tokens < currentBet) {
        spinBtn.disabled = true;
        messageEl.textContent = "Out of compute! Get more funding (refresh).";
        messageEl.style.color = "var(--danger)";
    } else {
        spinBtn.disabled = isSpinning;
    }
}

betUpBtn.addEventListener('click', () => {
    if (!isSpinning && currentBet < 100 && currentBet + 10 <= tokens) {
        currentBet += 10;
        updateDisplay();
    }
});

betDownBtn.addEventListener('click', () => {
    if (!isSpinning && currentBet > 10) {
        currentBet -= 10;
        updateDisplay();
    }
});

function getRandomSymbol() {
    return symbols[Math.floor(Math.random() * symbols.length)];
}

function spinReel(reel, duration) {
    return new Promise((resolve) => {
        const parent = reel.parentElement;
        parent.classList.add('spinning');
        
        const startTime = Date.now();
        
        const spinInterval = setInterval(() => {
            reel.textContent = getRandomSymbol();
        }, 100);

        setTimeout(() => {
            clearInterval(spinInterval);
            parent.classList.remove('spinning');
            const finalSymbol = getRandomSymbol();
            reel.textContent = finalSymbol;
            resolve(finalSymbol);
        }, duration);
    });
}

spinBtn.addEventListener('click', async () => {
    if (isSpinning || tokens < currentBet) return;
    
    isSpinning = true;
    tokens -= currentBet;
    messageEl.textContent = "Training model... (Spinning)";
    messageEl.style.color = "var(--text-color)";
    updateDisplay();
    
    // Disable controls
    betUpBtn.disabled = true;
    betDownBtn.disabled = true;

    try {
        const results = await Promise.all([
            spinReel(reels[0], 1000),
            spinReel(reels[1], 1500),
            spinReel(reels[2], 2000)
        ]);

        evaluateResult(results);
    } catch (e) {
        console.error(e);
        messageEl.textContent = "Kernel panic!";
    } finally {
        isSpinning = false;
        betUpBtn.disabled = false;
        betDownBtn.disabled = false;
        updateDisplay();
    }
});

function evaluateResult(results) {
    const key = results.join(',');
    
    if (payTable[key]) {
        const payout = currentBet * payTable[key].mult;
        tokens += payout;
        
        if (payout > 0) {
            messageEl.textContent = `${payTable[key].msg} Won ${payout} tokens!`;
            messageEl.style.color = "var(--success)";
        } else {
            messageEl.textContent = `${payTable[key].msg} Lost ${Math.abs(payout)} tokens!`;
            messageEl.style.color = "var(--danger)";
        }
        
    } else {
        // Check for two matches
        if (results[0] === results[1] || results[1] === results[2] || results[0] === results[2]) {
            const win = currentBet * 2;
            tokens += win;
            messageEl.textContent = `Partial convergence! Won ${win} tokens.`;
            messageEl.style.color = "#fbbf24";
        } else {
            messageEl.textContent = "Model collapsed. Try again!";
            messageEl.style.color = "#94a3b8";
        }
    }
    
    // Ensure tokens don't go below 0 if they get hit by the cloud bill
    if (tokens < 0) tokens = 0;
}

// Initial setup
updateDisplay();