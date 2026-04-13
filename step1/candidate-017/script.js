// Symbol weights (lower count = rarer)
const weightedSymbols = [
    '💽', // 1 - AGI
    '🧠', '🧠', // 2 - Big Brain
    '🤖', '🤖', '🤖', // 3 - Agent
    '💸', '💸', '💸', '💸', // 4 - Bill
    '🔥', '🔥', '🔥', '🔥', '🔥', // 5 - Meltdown
    '🗑️', '🗑️', '🗑️', '🗑️', '🗑️', '🗑️' // 6 - Hallucination
];

const PAYTABLE = {
    '💽': { 3: 5000, 2: 50 },
    '🧠': { 3: 2000, 2: 50 },
    '🤖': { 3: 1000, 2: 50 },
    '💸': { 3: 100,  2: 50 },
    '🔥': { 3: -500, 2: 0 },
    '🗑️': { 3: 0,    2: 0 }
};

let balance = 10000;
const COST_PER_SPIN = 100;
let isSpinning = false;

const balanceEl = document.getElementById('token-balance');
const spinBtn = document.getElementById('spin-btn');
const messageEl = document.getElementById('message');
const reels = [
    document.querySelector('#reel-1 .symbols'),
    document.querySelector('#reel-2 .symbols'),
    document.querySelector('#reel-3 .symbols')
];

function updateBalance(amount) {
    balance += amount;
    balanceEl.textContent = balance;
    if (balance < COST_PER_SPIN) {
        spinBtn.disabled = true;
        messageEl.textContent = "Rate limits exceeded (Out of tokens!). Restart to fund account.";
        messageEl.style.color = "var(--danger)";
    }
}

function getRandomSymbol() {
    return weightedSymbols[Math.floor(Math.random() * weightedSymbols.length)];
}

function spin() {
    if (isSpinning || balance < COST_PER_SPIN) return;
    
    isSpinning = true;
    spinBtn.disabled = true;
    updateBalance(-COST_PER_SPIN);
    messageEl.textContent = "Running inference... (Generating response...)";
    messageEl.style.color = "#94a3b8";

    const results = [];
    const spinPromises = [];

    // Animation variables
    const spins = [20, 25, 30]; // Number of symbols to cycle through for each reel
    const spinDuration = 2000; // base ms

    reels.forEach((reel, i) => {
        const targetSymbol = getRandomSymbol();
        results.push(targetSymbol);

        spinPromises.push(new Promise(resolve => {
            // Build the column of symbols for spinning
            let html = '';
            for(let j=0; j < spins[i]; j++) {
                html += `<div>${getRandomSymbol()}</div>`;
            }
            html += `<div>${targetSymbol}</div>`; // Final symbol at the bottom
            
            reel.innerHTML = html;
            reel.style.transition = 'none';
            reel.style.transform = 'translateY(0px)';

            // Trigger reflow to apply the reset position before animating
            reel.offsetHeight;

            // Animate to the last symbol
            const itemHeight = 120; // Matches reel height defined in CSS
            const targetY = -(spins[i] * itemHeight);
            
            const duration = spinDuration + i * 500;
            reel.style.transition = `transform ${duration}ms cubic-bezier(0.25, 0.1, 0.25, 1)`;
            reel.style.transform = `translateY(${targetY}px)`;

            setTimeout(() => {
                // Cleanup: leave only the final symbol to avoid huge DOM nodes
                reel.style.transition = 'none';
                reel.innerHTML = `<div>${targetSymbol}</div>`;
                reel.style.transform = 'translateY(0px)';
                resolve();
            }, duration);
        }));
    });

    Promise.all(spinPromises).then(() => {
        calculateWin(results);
        isSpinning = false;
        if (balance >= COST_PER_SPIN) {
            spinBtn.disabled = false;
        }
    });
}

function calculateWin(results) {
    const counts = {};
    results.forEach(s => counts[s] = (counts[s] || 0) + 1);

    let winAmount = 0;
    let winMessage = "Hallucination complete. No useful output.";

    for (const [symbol, count] of Object.entries(counts)) {
        if (count === 3) {
            winAmount = PAYTABLE[symbol][3] || 0;
            if (winAmount > 0) {
                 winMessage = `Perfect Alignment! +${winAmount} Tokens`;
            } else if (winAmount < 0) {
                 winMessage = `Catastrophic Server Meltdown! ${winAmount} Tokens`;
            } else {
                 winMessage = `Pure Hallucination. Zero Value.`;
            }
            break;
        } else if (count === 2) {
            winAmount = PAYTABLE[symbol][2] || 0;
            if (winAmount > 0) {
                winMessage = `Partial Coherence. +${winAmount} Tokens`;
            }
        }
    }

    if (winAmount > 0) {
        messageEl.style.color = "var(--success)";
    } else if (winAmount < 0) {
        messageEl.style.color = "var(--danger)";
    } else {
        messageEl.style.color = "#94a3b8";
    }

    messageEl.textContent = winMessage;
    
    if (winAmount !== 0) {
        updateBalance(winAmount);
    }
}

spinBtn.addEventListener('click', spin);
