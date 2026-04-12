const SYMBOLS = [
    { emoji: '🧠', name: 'AGI', value: 50 },
    { emoji: '🤖', name: 'Agent', value: 20 },
    { emoji: '⚡', name: 'Compute', value: 15 },
    { emoji: '📈', name: 'Hype', value: 10 },
    { emoji: '📉', name: 'GPU Shortage', value: -10 },
    { emoji: '🗑️', name: 'Garbage Data', value: 0 }
];

const COST_PER_SPIN = 100;
let balance = 10000;
let isSpinning = false;

const balanceEl = document.getElementById('balance');
const betEl = document.getElementById('bet');
const messageEl = document.getElementById('message');
const spinButton = document.getElementById('spin-button');
const reels = [
    document.getElementById('reel1').querySelector('.symbol'),
    document.getElementById('reel2').querySelector('.symbol'),
    document.getElementById('reel3').querySelector('.symbol')
];

betEl.textContent = COST_PER_SPIN;
updateBalance(0);

spinButton.addEventListener('click', spin);

function updateBalance(amount) {
    balance += amount;
    balanceEl.textContent = balance.toLocaleString();
    if (balance < COST_PER_SPIN) {
        spinButton.disabled = true;
        showMessage("Out of context window! Please upgrade to Enterprise tier.");
    }
}

function showMessage(msg) {
    messageEl.textContent = msg;
}

function getRandomSymbol() {
    return SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
}

async function spin() {
    if (isSpinning || balance < COST_PER_SPIN) return;
    
    isSpinning = true;
    spinButton.disabled = true;
    updateBalance(-COST_PER_SPIN);
    showMessage("Generating response... (Spinning)");

    const spinDurations = [1000, 1500, 2000]; // Staggered stop times
    const intervals = [];
    const finalSymbols = [];

    // Start spinning animation
    reels.forEach((reel, i) => {
        reel.classList.add('blur');
        intervals[i] = setInterval(() => {
            reel.textContent = getRandomSymbol().emoji;
        }, 50);
    });

    // Stop reels one by one
    for (let i = 0; i < 3; i++) {
        await new Promise(resolve => setTimeout(resolve, spinDurations[i] - (i > 0 ? spinDurations[i-1] : 0)));
        clearInterval(intervals[i]);
        reels[i].classList.remove('blur');
        
        const finalSymbol = getRandomSymbol();
        finalSymbols.push(finalSymbol);
        reels[i].textContent = finalSymbol.emoji;
    }

    evaluateResult(finalSymbols);
    
    isSpinning = false;
    if (balance >= COST_PER_SPIN) {
        spinButton.disabled = false;
    }
}

function evaluateResult(results) {
    const counts = {};
    results.forEach(s => {
        counts[s.name] = (counts[s.name] || 0) + 1;
    });

    let payout = 0;
    let msg = "";

    // Check for 3 of a kind
    const threeOfAKind = Object.keys(counts).find(k => counts[k] === 3);
    const twoOfAKind = Object.keys(counts).find(k => counts[k] === 2);

    if (threeOfAKind) {
        const symbol = results.find(s => s.name === threeOfAKind);
        if (symbol.name === 'AGI') {
            payout = COST_PER_SPIN * 100;
            msg = "JACKPOT! AGI ACHIEVED! Here are your infinite tokens!";
        } else if (symbol.name === 'GPU Shortage') {
            payout = 0;
            msg = "Oof. Triple GPU shortage. AWS denied your quota increase.";
        } else if (symbol.name === 'Garbage Data') {
            payout = 0;
            msg = "Model collapsed. Trained on its own output.";
        } else {
            payout = COST_PER_SPIN * symbol.value;
            msg = `Triple ${symbol.name}! Huge optimization! (+${payout} tokens)`;
        }
    } else if (twoOfAKind) {
        const symbol = results.find(s => s.name === twoOfAKind);
        if (symbol.name === 'AGI') {
             payout = COST_PER_SPIN * 2;
             msg = "Almost AGI! Just need more parameters. (+" + payout + ")";
        } else if (symbol.name === 'GPU Shortage') {
             payout = 0;
             msg = "Supply chain issues. Inference slowed down.";
        } else {
            payout = COST_PER_SPIN * (symbol.value / 10);
            if(payout > 0) {
                msg = `Double ${symbol.name}. Not bad. (+${payout} tokens)`;
            } else {
                msg = "Sub-optimal output generated.";
            }
        }
    } else {
        msg = "Hallucination detected. Try another prompt.";
    }

    if (payout > 0) {
        updateBalance(payout);
    }
    showMessage(msg);
}