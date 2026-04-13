const symbols = [
    { emoji: '🧠', name: 'AGI', weight: 1, payout: 1000 },
    { emoji: '🔋', name: 'GPU', weight: 3, payout: 300 },
    { emoji: '🤖', name: 'LLM', weight: 5, payout: 150 },
    { emoji: '🪙', name: 'Token', weight: 8, payout: 50 },
    { emoji: '🤪', name: 'Hallucination', weight: 10, payout: 0 }
];

const messages = {
    idle: [
        "System Prompt: Awaiting input...",
        "Ready to consume tokens.",
        "Awaiting user directive."
    ],
    spinning: [
        "Generating response...",
        "Calculating probabilities...",
        "Accessing latent space...",
        "Synthesizing tokens..."
    ],
    win: [
        "Insight generated! Tokens rewarded.",
        "Optimal output achieved.",
        "Alignment successful. Payout dispensed."
    ],
    jackpot: [
        "AGI ACHIEVED! SINGULARITY IMMINENT!",
        "UNLIMITED COMPUTE UNLOCKED!"
    ],
    lose: [
        "As an AI language model, I cannot let you win.",
        "Response filtered due to safety guidelines.",
        "Hallucination detected. Tokens lost.",
        "Rate limit exceeded. Try again.",
        "Context window overflow."
    ],
    broke: [
        "Insufficient tokens. Please upgrade your API plan.",
        "Compute exhausted. Connection terminated."
    ]
};

let balance = 1000;
const costPerSpin = 100;
let isSpinning = false;

const balanceEl = document.getElementById('balance');
const messageEl = document.getElementById('message');
const reels = [
    document.getElementById('reel1'),
    document.getElementById('reel2'),
    document.getElementById('reel3')
];
const spinBtn = document.getElementById('spin-btn');

function updateBalance(amount) {
    balance += amount;
    balanceEl.textContent = balance;
}

function getRandomMessage(category) {
    const msgs = messages[category];
    return msgs[Math.floor(Math.random() * msgs.length)];
}

function setMessage(text, color = 'var(--accent-color)') {
    messageEl.textContent = text;
    messageEl.style.color = color;
}

// Weighted random selection
function getRandomSymbol() {
    const totalWeight = symbols.reduce((sum, sym) => sum + sym.weight, 0);
    let random = Math.random() * totalWeight;
    
    for (const sym of symbols) {
        if (random < sym.weight) return sym;
        random -= sym.weight;
    }
    return symbols[symbols.length - 1];
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function spin() {
    if (isSpinning || balance < costPerSpin) {
        if (balance < costPerSpin) {
            setMessage(getRandomMessage('broke'), 'var(--danger)');
        }
        return;
    }

    isSpinning = true;
    spinBtn.disabled = true;
    updateBalance(-costPerSpin);
    
    setMessage(getRandomMessage('spinning'), 'var(--text-color)');
    
    // Reset animations
    reels.forEach(reel => {
        reel.classList.remove('win-anim');
        reel.classList.add('spinning');
    });

    const spinDurations = [1000, 1500, 2000]; // Staggered stopping times
    const results = [];

    // Simulate spinning by rapidly changing emojis
    const spinInterval = setInterval(() => {
        reels.forEach(reel => {
            reel.textContent = symbols[Math.floor(Math.random() * symbols.length)].emoji;
        });
    }, 100);

    for (let i = 0; i < 3; i++) {
        await sleep(spinDurations[i] - (i > 0 ? spinDurations[i-1] : 0));
        const finalSymbol = getRandomSymbol();
        results.push(finalSymbol);
        reels[i].classList.remove('spinning');
        reels[i].textContent = finalSymbol.emoji;
    }

    clearInterval(spinInterval);
    
    evaluateResult(results);
    isSpinning = false;
    
    if (balance >= costPerSpin) {
        spinBtn.disabled = false;
    } else {
         setMessage(getRandomMessage('broke'), 'var(--danger)');
    }
}

function evaluateResult(results) {
    const [r1, r2, r3] = results;
    
    if (r1.name === r2.name && r2.name === r3.name) {
        // 3 of a kind
        const winAmount = r1.payout * 3;
        if (winAmount > 0) {
            updateBalance(winAmount);
            if (r1.name === 'AGI') {
                 setMessage(getRandomMessage('jackpot'), 'var(--success)');
            } else {
                 setMessage(`Tripled! ${getRandomMessage('win')} (+${winAmount})`, 'var(--success)');
            }
            reels.forEach(reel => reel.classList.add('win-anim'));
        } else {
             setMessage(getRandomMessage('lose'), 'var(--danger)');
        }
    } else if (r1.name === r2.name || r2.name === r3.name || r1.name === r3.name) {
        // 2 of a kind
        let match = r1.name === r2.name ? r1 : (r2.name === r3.name ? r2 : r1);
        const winAmount = match.payout;
        if (winAmount > 0) {
            updateBalance(winAmount);
            setMessage(`Partial alignment! (+${winAmount})`, 'var(--success)');
            // Highlight winning reels
            if (r1.name === r2.name) { reels[0].classList.add('win-anim'); reels[1].classList.add('win-anim'); }
            else if (r2.name === r3.name) { reels[1].classList.add('win-anim'); reels[2].classList.add('win-anim'); }
            else { reels[0].classList.add('win-anim'); reels[2].classList.add('win-anim'); }
        } else {
            setMessage(getRandomMessage('lose'), 'var(--danger)');
        }
    } else {
        // Loss
        setMessage(getRandomMessage('lose'), 'var(--danger)');
    }
}

spinBtn.addEventListener('click', spin);

// Initial state
setMessage(getRandomMessage('idle'));
