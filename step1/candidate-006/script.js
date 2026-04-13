const symbols = ['🤖', '🧠', '💸', '🔋', '📉', '💩'];
const costPerSpin = 10;
let balance = 1000;
let isSpinning = false;

const balanceEl = document.getElementById('balance');
const messageEl = document.getElementById('message');
const spinButton = document.getElementById('spin-button');
const reels = [
    document.getElementById('reel1').querySelector('.symbol'),
    document.getElementById('reel2').querySelector('.symbol'),
    document.getElementById('reel3').querySelector('.symbol')
];

function updateBalance() {
    balanceEl.textContent = balance;
}

function getRandomSymbol() {
    return symbols[Math.floor(Math.random() * symbols.length)];
}

function calculateWin(results) {
    if (results[0] === results[1] && results[1] === results[2]) {
        switch (results[0]) {
            case '🧠': return { amount: 500, msg: "AGI ACHIEVED! The singularity is here!" };
            case '💸': return { amount: 200, msg: "SERIES A FUNDING SECURED!" };
            case '🤖': return { amount: 50, msg: "Useful Agent Created!" };
            case '🔋': return { amount: 20, msg: "Secured GPU Cluster!" };
            case '📉': return { amount: 5, msg: "Model performance degraded. Small refund." };
            case '💩': return { amount: 0, msg: "Total Garbage Output. No value." };
        }
    }
    
    if (results.includes('💩')) {
        return { amount: 0, msg: "Hallucination detected. Output discarded." };
    }
    
    if (results.filter(s => s === '🧠').length === 2) {
         return { amount: 15, msg: "Almost AGI! Keep prompting." };
    }

    return { amount: 0, msg: "Context window exceeded. Try again." };
}

function animateReel(reelEl, duration) {
    return new Promise(resolve => {
        let startTime = Date.now();
        let interval = setInterval(() => {
            reelEl.textContent = getRandomSymbol();
            if (Date.now() - startTime > duration) {
                clearInterval(interval);
                resolve(reelEl.textContent);
            }
        }, 50); // Speed of spin
    });
}

async function spin() {
    if (isSpinning) return;
    
    if (balance < costPerSpin) {
        messageEl.textContent = "OUT OF COMPUTE! BUY MORE TOKENS!";
        messageEl.style.color = "#ef4444";
        return;
    }

    isSpinning = true;
    spinButton.disabled = true;
    balance -= costPerSpin;
    updateBalance();
    
    messageEl.textContent = "PROMPTING LLM...";
    messageEl.style.color = "#fbbf24";

    // Spin each reel with increasing duration for effect
    const spinPromises = [
        animateReel(reels[0], 1000),
        animateReel(reels[1], 1500),
        animateReel(reels[2], 2000)
    ];

    const results = await Promise.all(spinPromises);
    
    const winResult = calculateWin(results);
    
    if (winResult.amount > 0) {
        balance += winResult.amount;
        updateBalance();
        messageEl.textContent = `WIN: ${winResult.amount} 🪙 - ${winResult.msg}`;
        messageEl.style.color = "#4ade80";
    } else {
        messageEl.textContent = winResult.msg;
        messageEl.style.color = "#f87171";
    }

    if (balance <= 0) {
        messageEl.textContent = "BANKRUPT. THE AI REPLACED YOU.";
        messageEl.style.color = "#ef4444";
        spinButton.textContent = "Game Over";
    } else {
        spinButton.disabled = false;
        isSpinning = false;
    }
}

// Initial setup
updateBalance();