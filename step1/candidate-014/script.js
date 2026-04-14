const symbols = ['🧠', '🤖', '⚡️', '📄', '🗑️', '💰'];
// 🧠 = Intelligence (Rare)
// 🤖 = Model (Common)
// ⚡️ = Compute (Uncommon)
// 📄 = Training Data (Common)
// 🗑️ = Hallucination (Bad, Common)
// 💰 = VC Funding (Jackpot)

const symbolWeights = [
    { symbol: '💰', weight: 1, payout: 500, name: 'VC Funding' },
    { symbol: '🧠', weight: 3, payout: 100, name: 'AGI Spark' },
    { symbol: '⚡️', weight: 6, payout: 50, name: 'H100 GPU' },
    { symbol: '🤖', weight: 10, payout: 20, name: 'Base Model' },
    { symbol: '📄', weight: 12, payout: 10, name: 'Training Data' },
    { symbol: '🗑️', weight: 15, payout: 0, name: 'Hallucination' }
];

let balance = 1000;
const spinCost = 10;
let isSpinning = false;

const balanceEl = document.getElementById('balance');
const messageEl = document.getElementById('message');
const spinBtn = document.getElementById('spin-btn');
const reels = [
    document.getElementById('reel1'),
    document.getElementById('reel2'),
    document.getElementById('reel3')
];

function updateBalance(amount) {
    balance += amount;
    balanceEl.textContent = balance;
}

function getRandomSymbol() {
    const totalWeight = symbolWeights.reduce((sum, item) => sum + item.weight, 0);
    let randomNum = Math.random() * totalWeight;
    
    for (const item of symbolWeights) {
        if (randomNum < item.weight) {
            return item;
        }
        randomNum -= item.weight;
    }
    return symbolWeights[symbolWeights.length - 1]; // Fallback
}

function spinReel(reelEl, duration) {
    return new Promise(resolve => {
        const symbolEl = reelEl.querySelector('.symbol');
        reelEl.classList.add('spinning');
        
        // Fast random symbol changes while spinning
        const spinInterval = setInterval(() => {
            symbolEl.textContent = symbols[Math.floor(Math.random() * symbols.length)];
        }, 100);

        setTimeout(() => {
            clearInterval(spinInterval);
            reelEl.classList.remove('spinning');
            const finalSymbolItem = getRandomSymbol();
            symbolEl.textContent = finalSymbolItem.symbol;
            resolve(finalSymbolItem);
        }, duration);
    });
}

const lossMessages = [
    "Model collapsed! Output is gibberish.",
    "Hallucination detected. Fact-check failed.",
    "Context window exceeded. Forgot the prompt.",
    "Rate limited! Wait 24 hours.",
    "GPU out of memory. Try smaller batch size.",
    "Just a stochastic parrot. No real reasoning."
];

async function spin() {
    if (isSpinning || balance < spinCost) return;

    isSpinning = true;
    spinBtn.disabled = true;
    updateBalance(-spinCost);
    
    messageEl.textContent = "Generating tokens...";
    messageEl.className = "";

    // Spin reels with different durations for dramatic effect
    const spinPromises = [
        spinReel(reels[0], 1000),
        spinReel(reels[1], 1500),
        spinReel(reels[2], 2000)
    ];

    const results = await Promise.all(spinPromises);
    
    evaluateResult(results);
    
    isSpinning = false;
    spinBtn.disabled = balance < spinCost;
    
    if (balance < spinCost) {
        messageEl.textContent = "Bankrupt! You can't afford more compute.";
        messageEl.className = "lose-msg";
    }
}

function evaluateResult(results) {
    const s1 = results[0].symbol;
    const s2 = results[1].symbol;
    const s3 = results[2].symbol;

    if (s1 === s2 && s2 === s3) {
        // Three of a kind
        const winItem = results[0];
        if (winItem.symbol === '🗑️') {
            // Three garbage = special loss
            messageEl.textContent = "MEGA HALLUCINATION! The AI recommended eating rocks.";
            messageEl.className = "lose-msg";
        } else {
            const winAmount = winItem.payout;
            updateBalance(winAmount);
            messageEl.textContent = `JACKPOT! 3x ${winItem.name}! Won ${winAmount} tokens!`;
            messageEl.className = "win-msg";
        }
    } else if (s1 === s2 || s2 === s3 || s1 === s3) {
        // Two of a kind (small consolation)
        const match = s1 === s2 ? results[0] : (s2 === s3 ? results[1] : results[0]);
        if (match.symbol !== '🗑️') {
            const winAmount = Math.floor(match.payout / 5) || 2; // small payout
            updateBalance(winAmount);
            messageEl.textContent = `Partial Match: 2x ${match.name}. Refunded ${winAmount} tokens.`;
            messageEl.className = "";
        } else {
            messageEl.textContent = "Minor hallucination. Try prompting better.";
            messageEl.className = "lose-msg";
        }
    } else {
        // No match
        messageEl.textContent = lossMessages[Math.floor(Math.random() * lossMessages.length)];
        messageEl.className = "lose-msg";
    }
}

spinBtn.addEventListener('click', spin);