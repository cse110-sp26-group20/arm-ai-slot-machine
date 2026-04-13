const symbols = [
    { emoji: '🤖', name: 'AI Bot', weight: 4 },
    { emoji: '🧠', name: 'Brain', weight: 3 },
    { emoji: '🗑️', name: 'Garbage', weight: 5 },
    { emoji: '🌀', name: 'Hallucination', weight: 4 },
    { emoji: '💸', name: 'Tokens', weight: 2 },
    { emoji: '🔥', name: 'GPU Burn', weight: 3 }
];

const messages = [
    "Generating response... Please wait.",
    "Analyzing prompt...",
    "Querying vector database...",
    "Optimizing loss function...",
    "Thinking step by step..."
];

const winMessages = [
    "Jackpot! You reclaimed some API credits!",
    "Wow, a coherent response! +50 Tokens",
    "Rare non-hallucinated output! +100 Tokens",
    "AGI achieved! (Just kidding) +200 Tokens"
];

const loseMessages = [
    "As an AI, I have consumed your tokens.",
    "Sorry, I cannot fulfill this request. -10 Tokens",
    "Error 429: Too Many Requests. Tokens lost.",
    "Output truncated due to context length. -10 Tokens",
    "I hallucinated the winning symbols. Try again."
];

let balance = 1000;
const costPerSpin = 10;
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
    if (balance < costPerSpin) {
        spinBtn.disabled = true;
        messageEl.textContent = "Insufficient tokens. Please buy more compute.";
        messageEl.style.color = "var(--lose-color)";
    }
}

function getRandomSymbol() {
    // Weighted random selection
    const totalWeight = symbols.reduce((sum, sym) => sum + sym.weight, 0);
    let randomNum = Math.random() * totalWeight;
    for (const sym of symbols) {
        if (randomNum < sym.weight) return sym;
        randomNum -= sym.weight;
    }
    return symbols[0];
}

async function spinReel(reel, delay) {
    return new Promise(resolve => {
        reel.classList.add('spinning');
        let spins = 0;
        const maxSpins = 20 + Math.random() * 10;
        
        const spinInterval = setInterval(() => {
            reel.textContent = symbols[Math.floor(Math.random() * symbols.length)].emoji;
            spins++;
            
            if (spins >= maxSpins) {
                clearInterval(spinInterval);
                reel.classList.remove('spinning');
                const finalSymbol = getRandomSymbol();
                reel.textContent = finalSymbol.emoji;
                resolve(finalSymbol);
            }
        }, 50);
        
        // Add artificial delay for the "thinking" effect
        setTimeout(() => {}, delay);
    });
}

function checkWin(results) {
    const [s1, s2, s3] = results;
    
    if (s1.emoji === s2.emoji && s2.emoji === s3.emoji) {
        // 3 of a kind
        let winAmount = 0;
        switch(s1.emoji) {
            case '💸': winAmount = 200; break; // Big token win
            case '🤖': winAmount = 100; break;
            case '🧠': winAmount = 50; break;
            case '🔥': winAmount = 40; break;
            case '🌀': winAmount = 30; break;
            case '🗑️': winAmount = 15; break; // Garbage refund
        }
        messageEl.textContent = winMessages[Math.floor(Math.random() * winMessages.length)];
        messageEl.style.color = "var(--win-color)";
        updateBalance(winAmount);
    } else if (s1.emoji === s2.emoji || s2.emoji === s3.emoji || s1.emoji === s3.emoji) {
        // 2 of a kind
        messageEl.textContent = "Partial match. Partial sense made. +5 Tokens";
        messageEl.style.color = "var(--text-color)";
        updateBalance(5); // Return half cost
    } else {
        // Loss
        messageEl.textContent = loseMessages[Math.floor(Math.random() * loseMessages.length)];
        messageEl.style.color = "var(--lose-color)";
    }
}

spinBtn.addEventListener('click', async () => {
    if (isSpinning || balance < costPerSpin) return;
    
    isSpinning = true;
    spinBtn.disabled = true;
    updateBalance(-costPerSpin);
    
    messageEl.textContent = messages[Math.floor(Math.random() * messages.length)];
    messageEl.style.color = "var(--accent-color)";
    
    const spinPromises = reels.map((reel, i) => spinReel(reel, i * 200));
    const results = await Promise.all(spinPromises);
    
    checkWin(results);
    
    isSpinning = false;
    if (balance >= costPerSpin) {
        spinBtn.disabled = false;
    }
});

// Initialize
messageEl.textContent = "System ready. Awaiting prompt.";