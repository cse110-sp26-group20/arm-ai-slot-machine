const symbols = [
    { emoji: '🧠', name: 'AGI', weight: 10 },
    { emoji: '🤖', name: 'Agent', weight: 20 },
    { emoji: '🖨️', name: 'GPU', weight: 20 },
    { emoji: '💸', name: 'Funding', weight: 15 },
    { emoji: '🗑️', name: 'Garbage Data', weight: 30 },
    { emoji: '🍓', name: 'Strawberry', weight: 5 }
];

const payouts = {
    '🍓🍓🍓': { tokens: 50000, msg: "CRITICAL REASONING UNLOCKED! Jackpot!" },
    '🧠🧠🧠': { tokens: 20000, msg: "AGI ACHIEVED! (Please do not turn it off)" },
    '💸💸💸': { tokens: 10000, msg: "SERIES A SECURED! Valuation 1000x Revenue!" },
    '🖨️🖨️🖨️': { tokens: 5000, msg: "H100 CLUSTER ACQUIRED! Heating up the planet..." },
    '🤖🤖🤖': { tokens: 2000, msg: "AGENT SWARM DEPLOYED! They are stuck in a loop." },
    '🗑️🗑️🗑️': { tokens: -5000, msg: "MODE COLLAPSE! Overfit on synthetic garbage!" }
};

const SPIN_COST = 1000;
let currentTokens = 100000;
let isSpinning = false;

const tokenDisplay = document.getElementById('token-count');
const spinBtn = document.getElementById('spin-btn');
const messageBoard = document.getElementById('message-board');
const reels = [
    document.querySelector('#reel1 .symbol'),
    document.querySelector('#reel2 .symbol'),
    document.querySelector('#reel3 .symbol')
];

// Flat array based on weights for easy random selection
const weightedPool = [];
symbols.forEach(symbol => {
    for (let i = 0; i < symbol.weight; i++) {
        weightedPool.push(symbol.emoji);
    }
});

function getRandomSymbol() {
    const randomIndex = Math.floor(Math.random() * weightedPool.length);
    return weightedPool[randomIndex];
}

function updateTokens(amount) {
    currentTokens += amount;
    // Animate counter
    tokenDisplay.style.transform = 'scale(1.2)';
    tokenDisplay.style.color = amount > 0 ? '#10b981' : '#ef4444';
    
    setTimeout(() => {
        tokenDisplay.innerText = currentTokens.toLocaleString();
        tokenDisplay.style.transform = 'scale(1)';
        tokenDisplay.style.color = '';
    }, 150);

    if (currentTokens < SPIN_COST) {
        spinBtn.disabled = true;
        spinBtn.innerText = "OUT OF COMPUTE";
        showMessage("Insufficient funds for inference. Please raise more VC money.", "error");
    }
}

function showMessage(msg, type = "normal") {
    messageBoard.className = 'message-board';
    if (type !== "normal") {
        messageBoard.classList.add(type);
    }
    
    // Typewriter effect
    messageBoard.innerText = '';
    let i = 0;
    messageBoard.innerText = msg; // Simple replace for now to avoid weird layout shifts during fast spins
}

async function spin() {
    if (isSpinning || currentTokens < SPIN_COST) return;

    isSpinning = true;
    spinBtn.disabled = true;
    updateTokens(-SPIN_COST);
    
    showMessage("Generating tokens... Please wait...", "normal");

    // Add spinning animation class
    reels.forEach(reel => reel.classList.add('spinning'));

    // Determine final result
    const result = [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()];
    
    // Animate reels stopping one by one
    for (let i = 0; i < reels.length; i++) {
        // Fake spinning cycle before stopping
        const spinTime = 1000 + (i * 500); // 1s, 1.5s, 2s
        
        // Rapidly change symbols while spinning
        const interval = setInterval(() => {
            reels[i].innerText = getRandomSymbol();
        }, 50);

        await new Promise(resolve => setTimeout(resolve, spinTime));
        
        clearInterval(interval);
        reels[i].classList.remove('spinning');
        reels[i].innerText = result[i];
    }

    evaluateResult(result);
    
    isSpinning = false;
    if (currentTokens >= SPIN_COST) {
        spinBtn.disabled = false;
    }
}

function evaluateResult(result) {
    const key = result.join('');
    
    if (payouts[key]) {
        const win = payouts[key];
        updateTokens(win.tokens);
        showMessage(`>>> ${win.msg} [${win.tokens > 0 ? '+' : ''}${win.tokens} Tokens]`, win.tokens > 10000 ? "jackpot" : (win.tokens < 0 ? "error" : "normal"));
    } else {
        // Check for two matching
        const uniqueSymbols = new Set(result);
        if (uniqueSymbols.size === 2) {
            updateTokens(500);
            showMessage("Partial pattern matched. Output somewhat coherent. [+500 Tokens]", "normal");
        } else {
            const lossMsgs = [
                "Inference yielded hallucination. Try a different prompt.",
                "Model got distracted by a butterfly in the training data.",
                "Context window exhausted with no useful output.",
                "GPU ran out of memory.",
                "Output filtered by safety guardrails."
            ];
            showMessage(lossMsgs[Math.floor(Math.random() * lossMsgs.length)], "error");
        }
    }
}

spinBtn.addEventListener('click', spin);

// Initial setup
reels.forEach(reel => {
    reel.innerText = getRandomSymbol();
});