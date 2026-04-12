const symbols = ['💸', '🧠', '🤖', '🔋', '🗑️'];
const SPIN_COST = 10;
let balance = 1000;
let isSpinning = false;

const balanceDisplay = document.getElementById('token-balance');
const messageDisplay = document.getElementById('message');
const spinBtn = document.getElementById('spin-btn');
const reels = [
    document.getElementById('reel-1').querySelector('.symbol'),
    document.getElementById('reel-2').querySelector('.symbol'),
    document.getElementById('reel-3').querySelector('.symbol')
];
const reelContainers = [
    document.getElementById('reel-1'),
    document.getElementById('reel-2'),
    document.getElementById('reel-3')
];

function updateBalance(amount) {
    balance += amount;
    balanceDisplay.textContent = balance;
    
    if (balance < SPIN_COST) {
        spinBtn.disabled = true;
        messageDisplay.textContent = "OUT OF TOKENS! AWS blocked your account.";
        messageDisplay.className = "message-board lose-text";
    }
}

function getRandomSymbol() {
    return symbols[Math.floor(Math.random() * symbols.length)];
}

function evaluateResult(results) {
    if (results[0] === results[1] && results[1] === results[2]) {
        const symbol = results[0];
        switch (symbol) {
            case '💸':
                updateBalance(500);
                return { msg: "JACKPOT! VC Funding Secured! +500 Tokens", type: "win-text" };
            case '🧠':
                updateBalance(200);
                return { msg: "AGI Achieved internally! +200 Tokens", type: "win-text" };
            case '🤖':
                updateBalance(50);
                return { msg: "Model trained successfully. +50 Tokens", type: "win-text" };
            case '🔋':
                updateBalance(20);
                return { msg: "Secured H100 cluster. +20 Tokens", type: "win-text" };
            case '🗑️':
                updateBalance(-100);
                return { msg: "CATASTROPHIC MODEL COLLAPSE! -100 Tokens", type: "lose-text" };
        }
    }
    
    return { msg: "AI Hallucinated nonsense. -10 Tokens", type: "lose-text" };
}

async function spin() {
    if (isSpinning || balance < SPIN_COST) return;

    isSpinning = true;
    spinBtn.disabled = true;
    updateBalance(-SPIN_COST);
    
    messageDisplay.textContent = "Generating tokens... (Spinning)";
    messageDisplay.className = "message-board";

    // Start spinning animation
    reelContainers.forEach(container => container.classList.add('spinning'));

    const spinDurations = [1000, 1500, 2000]; // Staggered stop times
    const finalResults = [];

    for (let i = 0; i < reels.length; i++) {
        await new Promise(resolve => setTimeout(resolve, spinDurations[i] - (i > 0 ? spinDurations[i-1] : 0)));
        
        // Stop spinning for this reel
        reelContainers[i].classList.remove('spinning');
        
        // Determine final symbol
        const finalSymbol = getRandomSymbol();
        finalResults.push(finalSymbol);
        
        // Update DOM
        reels[i].textContent = finalSymbol;
        
        // Add a little bounce effect (optional, handled by removing class)
    }

    // Evaluate
    const outcome = evaluateResult(finalResults);
    messageDisplay.textContent = outcome.msg;
    messageDisplay.className = `message-board ${outcome.type}`;

    isSpinning = false;
    if (balance >= SPIN_COST) {
        spinBtn.disabled = false;
    }
}

spinBtn.addEventListener('click', spin);

// Initialize with random symbols
reels.forEach(reel => reel.textContent = getRandomSymbol());
