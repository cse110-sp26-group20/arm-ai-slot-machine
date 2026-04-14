const symbols = ['🧠', '🤖', '⚡', '☁️', '📉', '💸'];
const COST_PER_SPIN = 10;
let balance = 1000;
let isSpinning = false;

const balanceEl = document.getElementById('balance');
const reels = [
    document.getElementById('reel1'),
    document.getElementById('reel2'),
    document.getElementById('reel3')
];
const spinBtn = document.getElementById('spin-button');
const messageEl = document.getElementById('message');

function updateDisplay() {
    balanceEl.innerText = balance;
}

function setMessage(msg, type = 'normal') {
    messageEl.innerText = msg;
    messageEl.className = '';
    if (type !== 'normal') {
        messageEl.classList.add(type);
    }
}

function getRandomSymbol() {
    return symbols[Math.floor(Math.random() * symbols.length)];
}

function evaluateWin(results) {
    const counts = {};
    results.forEach(s => counts[s] = (counts[s] || 0) + 1);

    if (counts['🧠'] === 3) {
        balance += 500;
        setMessage("Jackpot! AGI Achieved! (+500 Tokens)", "normal");
    } else if (counts['🤖'] === 3) {
        balance += 100;
        setMessage("Perfect Alignment! (+100 Tokens)", "normal");
    } else if (counts['⚡'] === 3) {
        balance += 50;
        setMessage("Compute Optimized! (+50 Tokens)", "normal");
    } else if (counts['☁️'] === 3) {
        balance += 20;
        setMessage("Cloud Credits granted. (+20 Tokens)", "normal");
    } else if (counts['📉'] >= 2) {
        balance -= 20;
        setMessage("Hallucination detected! Context poisoned. (-20 Tokens Penalty)", "error");
    } else if (counts['💸'] >= 2) {
        balance -= 10;
        setMessage("API Rate Limit Hit. Exponential Backoff. (-10 Tokens Penalty)", "warning");
    } else {
        setMessage("Response generated. No actionable intelligence found.", "warning");
    }
    
    if(balance <= 0) {
        balance = 0;
        setMessage("Out of tokens! Your API access has been revoked.", "error");
        spinBtn.disabled = true;
    }

    updateDisplay();
}

async function spin() {
    if (isSpinning || balance < COST_PER_SPIN) return;

    isSpinning = true;
    balance -= COST_PER_SPIN;
    updateDisplay();
    spinBtn.disabled = true;
    setMessage("Generating response...", "normal");

    // Start spin animation
    reels.forEach(reel => reel.classList.add('spinning'));

    // Fake delay for API call
    const spinDuration = 2000;
    
    // Animate symbols changing
    const interval = setInterval(() => {
        reels.forEach(reel => {
            reel.innerText = getRandomSymbol();
        });
    }, 100);

    setTimeout(() => {
        clearInterval(interval);
        reels.forEach(reel => reel.classList.remove('spinning'));
        
        // Final results
        const results = [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()];
        reels[0].innerText = results[0];
        reels[1].innerText = results[1];
        reels[2].innerText = results[2];

        evaluateWin(results);
        
        isSpinning = false;
        if (balance >= COST_PER_SPIN) {
            spinBtn.disabled = false;
        }
    }, spinDuration);
}

spinBtn.addEventListener('click', spin);

// Init
updateDisplay();