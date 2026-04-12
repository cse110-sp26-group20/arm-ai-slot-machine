const symbols = [
    { char: '🤖', name: 'AI Model', weight: 40, payout: 20 },
    { char: '🧠', name: 'Neural Net', weight: 30, payout: 30 },
    { char: '💸', name: 'Funding', weight: 15, payout: 50 },
    { char: '📉', name: 'GPU Shortage', weight: 10, payout: 0 },
    { char: '🦄', name: 'Unicorn Startup', weight: 4, payout: 200 },
    { char: '🗑️', name: 'Garbage Data', weight: 1, payout: 0 }
];

let tokens = 1000;
const spinCost = 10;
let isSpinning = false;

const tokenCountEl = document.getElementById('token-count');
const spinBtn = document.getElementById('spin-btn');
const messageEl = document.getElementById('message');
const reels = [
    document.getElementById('reel1'),
    document.getElementById('reel2'),
    document.getElementById('reel3')
];

// Flat array based on weights for easy random selection
let weightedSymbols = [];
symbols.forEach(sym => {
    for (let i = 0; i < sym.weight; i++) {
        weightedSymbols.push(sym);
    }
});

function getRandomSymbol() {
    const randomIndex = Math.floor(Math.random() * weightedSymbols.length);
    return weightedSymbols[randomIndex];
}

async function spin() {
    if (isSpinning || tokens < spinCost) {
        if (tokens < spinCost) {
            messageEl.textContent = "Error 402: Context window exhausted. Insert more venture capital.";
            messageEl.style.color = "red";
        }
        return;
    }

    isSpinning = true;
    tokens -= spinCost;
    updateTokens();
    spinBtn.disabled = true;
    messageEl.textContent = "Generating tokens... CPU usage 100%...";
    messageEl.style.color = "#0f0";

    const spinDuration = 2000; // ms
    const stopDelays = [0, 500, 1000]; // Staggered stopping

    reels.forEach(reel => reel.classList.add('spinning'));

    const finalResults = [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()];

    // Animate reels
    const startTime = Date.now();
    
    return new Promise(resolve => {
        function updateReels() {
            const now = Date.now();
            const elapsed = now - startTime;

            reels.forEach((reel, index) => {
                if (elapsed < spinDuration + stopDelays[index]) {
                    // Fast cycling effect
                    if (Math.random() > 0.5) {
                        reel.textContent = getRandomSymbol().char;
                    }
                } else {
                    reel.textContent = finalResults[index].char;
                    reel.classList.remove('spinning');
                }
            });

            if (elapsed < spinDuration + stopDelays[2] + 50) {
                requestAnimationFrame(updateReels);
            } else {
                evaluateResult(finalResults);
                isSpinning = false;
                spinBtn.disabled = false;
                resolve();
            }
        }
        requestAnimationFrame(updateReels);
    });
}

function evaluateResult(results) {
    const chars = results.map(r => r.char);
    const uniqueChars = new Set(chars);

    if (uniqueChars.size === 1) {
        // Jackpot!
        const winSymbol = results[0];
        if (winSymbol.char === '📉' || winSymbol.char === '🗑️') {
             messageEl.textContent = `Model collapsed! Generated pure ${winSymbol.name}. You lose half your tokens!`;
             messageEl.style.color = "red";
             tokens = Math.floor(tokens / 2); // Harsh penalty
        } else {
            const winAmount = winSymbol.payout * 10;
            tokens += winAmount;
            messageEl.textContent = `AGI Achieved! Triple ${winSymbol.name}! +${winAmount} tokens.`;
            messageEl.style.color = "gold";
        }
    } else if (uniqueChars.size === 2) {
        // Small win
        const counts = {};
        chars.forEach(c => counts[c] = (counts[c] || 0) + 1);
        const winChar = Object.keys(counts).find(key => counts[key] === 2);
        const winSymbol = symbols.find(s => s.char === winChar);
        
        if (winSymbol.char !== '📉' && winSymbol.char !== '🗑️') {
            const winAmount = winSymbol.payout;
            tokens += winAmount;
            messageEl.textContent = `Hallucinated a minor breakthrough: Double ${winSymbol.name}. +${winAmount} tokens.`;
            messageEl.style.color = "#0f0";
        } else {
            messageEl.textContent = `Overfitting detected. Double ${winSymbol.name} resulted in zero value.`;
             messageEl.style.color = "orange";
        }
    } else {
        // Loss
        messageEl.textContent = "Output is gibberish. Try adjusting your prompt (spin again).";
        messageEl.style.color = "#aaa";
    }

    updateTokens();
}

function updateTokens() {
    tokenCountEl.textContent = tokens;
}

spinBtn.addEventListener('click', spin);
