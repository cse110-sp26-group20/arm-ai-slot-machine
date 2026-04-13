const symbols = [
    { emoji: '🧠', name: 'AGI Brain' },
    { emoji: '🔥', name: 'Burning GPU' },
    { emoji: '🤖', name: 'Generic Bot' },
    { emoji: '💬', name: 'As an AI...' },
    { emoji: '📉', name: 'Context Limit' },
    { emoji: '🗑️', name: 'Hallucination' }
];

const SPIN_COST = 100;
let balance = 1000;
let isSpinning = false;

const balanceDisplay = document.getElementById('balance');
const spinButton = document.getElementById('spin-button');
const messageBoard = document.getElementById('message');
const reels = [
    document.getElementById('reel1'),
    document.getElementById('reel2'),
    document.getElementById('reel3')
];

// Snarky messages based on balance
const brokeMessages = [
    "Rate limit exceeded. Please buy more compute.",
    "Your context window is empty.",
    "Insufficient funds for API call.",
    "Compute cluster denied your request."
];

function updateBalance(amount) {
    balance += amount;
    balanceDisplay.textContent = balance;
    
    if (balance < SPIN_COST) {
        spinButton.disabled = true;
        showMessage(brokeMessages[Math.floor(Math.random() * brokeMessages.length)], 'var(--danger)');
    }
}

function showMessage(msg, color = '#10b981') {
    messageBoard.textContent = msg;
    messageBoard.style.color = color;
}

function getRandomSymbol() {
    return symbols[Math.floor(Math.random() * symbols.length)].emoji;
}

function spinReel(reelElement, duration) {
    return new Promise(resolve => {
        reelElement.classList.add('spinning');
        
        let interval = setInterval(() => {
            reelElement.textContent = getRandomSymbol();
        }, 100);

        setTimeout(() => {
            clearInterval(interval);
            reelElement.classList.remove('spinning');
            const finalSymbol = getRandomSymbol();
            reelElement.textContent = finalSymbol;
            resolve(finalSymbol);
        }, duration);
    });
}

function evaluateWin(results) {
    const counts = {};
    results.forEach(r => counts[r] = (counts[r] || 0) + 1);
    
    let maxCount = 0;
    let winningSymbol = null;
    
    for (const [symbol, count] of Object.entries(counts)) {
        if (count > maxCount) {
            maxCount = count;
            winningSymbol = symbol;
        }
    }

    if (maxCount === 3) {
        if (winningSymbol === '🧠') {
            updateBalance(1000);
            showMessage("AGI ACHIEVED! +1000 Tokens!", 'var(--success)');
        } else if (winningSymbol === '🔥') {
            updateBalance(500);
            showMessage("GPUs are melting! +500 Tokens!", 'var(--success)');
        } else if (winningSymbol === '🤖') {
            updateBalance(300);
            showMessage("Standard Output Generated. +300 Tokens", 'var(--success)');
        } else if (winningSymbol === '🗑️') {
            updateBalance(-50); // Penalty!
            showMessage("MASSIVE HALLUCINATION! -50 Tokens!", 'var(--danger)');
        } else {
            updateBalance(100);
            showMessage("Consistent output! +100 Tokens", 'var(--success)');
        }
    } else if (maxCount === 2) {
        updateBalance(50);
        showMessage("Partial context match. +50 Tokens", 'var(--accent-color)');
    } else {
        // 0 matches
        const lossMessages = [
            "Output filtered by safety guidelines.",
            "Model produced gibberish. Try adjusting temperature.",
            "Connection to API lost.",
            "Tokens burned successfully for zero value."
        ];
        showMessage(lossMessages[Math.floor(Math.random() * lossMessages.length)], '#94a3b8');
    }
}

spinButton.addEventListener('click', async () => {
    if (isSpinning || balance < SPIN_COST) return;

    isSpinning = true;
    spinButton.disabled = true;
    updateBalance(-SPIN_COST);
    showMessage("Generating response...", '#38bdf8');

    // Spin reels with different durations for dramatic effect
    const spinPromises = [
        spinReel(reels[0], 1000),
        spinReel(reels[1], 1500),
        spinReel(reels[2], 2000)
    ];

    const results = await Promise.all(spinPromises);
    
    evaluateWin(results);
    
    isSpinning = false;
    if (balance >= SPIN_COST) {
        spinButton.disabled = false;
    }
});
