const symbols = ['🤖', '🧠', '💸', '💾', '🗑️'];
const spinCost = 10;
let balance = 1000;
let isSpinning = false;

const balanceDisplay = document.getElementById('token-balance');
const spinBtn = document.getElementById('spin-btn');
const messageBoard = document.getElementById('message-board');
const reels = [
    document.querySelector('#reel1 .symbol'),
    document.querySelector('#reel2 .symbol'),
    document.querySelector('#reel3 .symbol')
];
const reelContainers = [
    document.getElementById('reel1'),
    document.getElementById('reel2'),
    document.getElementById('reel3')
];

const payouts = {
    '🤖,🤖,🤖': 500,
    '🧠,🧠,🧠': 200,
    '💸,💸,💸': 100,
    '💾,💾,💾': 50,
    '🗑️,🗑️,🗑️': 10
};

const messages = {
    win: [
        "Hallucination accepted as fact! You win!",
        "VC Funding secured!",
        "Parameters optimized! Massive payout!",
        "AGI achieved! (Temporarily)",
        "Token limit bypassed! Jackpot!"
    ],
    lose: [
        "Context window exceeded. Try again.",
        "Model collapsed. Tokens lost.",
        "Rate limit reached. Paying the API toll.",
        "Output filtered by alignment team. 0 tokens.",
        "GPU Out of Memory. Spin again to buy more VRAM."
    ]
};

function getRandomSymbol() {
    return symbols[Math.floor(Math.random() * symbols.length)];
}

function getRandomMessage(type) {
    const arr = messages[type];
    return arr[Math.floor(Math.random() * arr.length)];
}

function updateBalance(amount) {
    balance += amount;
    balanceDisplay.textContent = balance;
}

async function spin() {
    if (isSpinning || balance < spinCost) {
        if (balance < spinCost) {
            messageBoard.textContent = "Out of tokens! Time to ask VC for more money.";
            messageBoard.style.color = '#f87171';
        }
        return;
    }

    isSpinning = true;
    updateBalance(-spinCost);
    spinBtn.disabled = true;
    messageBoard.textContent = "Generating response... (Spinning)";
    messageBoard.style.color = 'var(--accent-color)';

    // Add spinning class for visual effect
    reelContainers.forEach(container => container.classList.add('spinning'));

    const spinDuration = 2000; // 2 seconds
    const intervalTime = 100; // Change symbol every 100ms
    
    let intervals = [];

    // Start randomizing symbols
    for (let i = 0; i < 3; i++) {
        intervals.push(setInterval(() => {
            reels[i].textContent = getRandomSymbol();
        }, intervalTime));
    }

    // Stop reels one by one
    const finalSymbols = [];
    for (let i = 0; i < 3; i++) {
        await new Promise(resolve => setTimeout(resolve, spinDuration / 3 + (i * 500)));
        clearInterval(intervals[i]);
        reelContainers[i].classList.remove('spinning');
        const finalSymbol = getRandomSymbol();
        reels[i].textContent = finalSymbol;
        finalSymbols.push(finalSymbol);
    }

    checkWin(finalSymbols);
    isSpinning = false;
    spinBtn.disabled = false;
}

function checkWin(symbols) {
    const resultKey = symbols.join(',');
    const payout = payouts[resultKey];

    if (payout) {
        updateBalance(payout);
        messageBoard.textContent = `${getRandomMessage('win')} Won ${payout} Tokens!`;
        messageBoard.style.color = '#4ade80'; // Green
    } else {
        messageBoard.textContent = getRandomMessage('lose');
        messageBoard.style.color = '#f87171'; // Red
    }
}

spinBtn.addEventListener('click', spin);