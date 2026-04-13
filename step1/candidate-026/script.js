const symbols = ['🧠', '🤖', '⚡️', '💾', '🗑️'];
const weights = [0.05, 0.15, 0.25, 0.3, 0.25]; // Probabilities to make 🧠 rare

const payouts = {
    '🧠,🧠,🧠': 500,
    '🤖,🤖,🤖': 100,
    '⚡️,⚡️,⚡️': 50,
    '💾,💾,💾': 20,
    '🗑️,🗑️,🗑️': 0 // Actually a bad outcome
};

let tokens = 1000;
const COST_PER_SPIN = 10;
let isSpinning = false;

const tokenCountEl = document.getElementById('token-count');
const messageEl = document.getElementById('message');
const spinBtn = document.getElementById('spin-btn');
const reels = [
    document.getElementById('reel1'),
    document.getElementById('reel2'),
    document.getElementById('reel3')
];

function updateTokens(amount) {
    tokens += amount;
    tokenCountEl.textContent = tokens;
    if (tokens < COST_PER_SPIN) {
        spinBtn.disabled = true;
        messageEl.textContent = "Out of context window (tokens)! Please upgrade your plan.";
        messageEl.style.color = "red";
    }
}

function getRandomSymbol() {
    const r = Math.random();
    let cumulative = 0;
    for (let i = 0; i < symbols.length; i++) {
        cumulative += weights[i];
        if (r <= cumulative) {
            return symbols[i];
        }
    }
    return symbols[symbols.length - 1];
}

function spinReel(reel, duration) {
    return new Promise(resolve => {
        let startTime = null;
        reel.classList.add('spinning');
        
        const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;
            
            // Randomly change symbol while spinning
            if (Math.random() > 0.5) {
                reel.textContent = symbols[Math.floor(Math.random() * symbols.length)];
            }

            if (progress < duration) {
                requestAnimationFrame(animate);
            } else {
                reel.classList.remove('spinning');
                const finalSymbol = getRandomSymbol();
                reel.textContent = finalSymbol;
                resolve(finalSymbol);
            }
        };
        
        requestAnimationFrame(animate);
    });
}

spinBtn.addEventListener('click', async () => {
    if (isSpinning || tokens < COST_PER_SPIN) return;
    
    isSpinning = true;
    spinBtn.disabled = true;
    updateTokens(-COST_PER_SPIN);
    messageEl.textContent = "Generating output...";
    messageEl.style.color = "#4da8da";

    // Spin each reel with slightly different durations
    const spinPromises = reels.map((reel, index) => {
        return spinReel(reel, 1000 + (index * 500)); // 1s, 1.5s, 2s
    });

    const results = await Promise.all(spinPromises);
    
    checkWin(results);
    
    isSpinning = false;
    if (tokens >= COST_PER_SPIN) {
        spinBtn.disabled = false;
    }
});

function checkWin(results) {
    const resultKey = results.join(',');
    
    if (payouts[resultKey] !== undefined) {
        const winAmount = payouts[resultKey];
        if (winAmount > 0) {
            updateTokens(winAmount);
            messageEl.textContent = `Jackpot! Output accepted. Won ${winAmount} Tokens!`;
            messageEl.style.color = "#4caf50";
        } else {
            messageEl.textContent = "Hallucination detected. Output rejected. 0 Tokens.";
            messageEl.style.color = "orange";
        }
    } else {
        messageEl.textContent = "Incoherent output. Try prompting again.";
        messageEl.style.color = "white";
    }
}
