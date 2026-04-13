const symbols = [
    { emoji: '🍓', value: 5000, prob: 1 },  // Jackpot
    { emoji: '🧠', value: 2000, prob: 3 },
    { emoji: '⚡', value: 1000, prob: 5 },
    { emoji: '🤖', value: 500, prob: 8 },
    { emoji: '💸', value: 200, prob: 10 },
    { emoji: '🗑️', value: -500, prob: 15 }, // Hazard
    { emoji: '📎', value: 0, prob: 20 },    // Blank/Dud
];

// Create weighted array for random selection
let symbolPool = [];
symbols.forEach((symbol, index) => {
    for (let i = 0; i < symbol.prob; i++) {
        symbolPool.push(index);
    }
});

let balance = 10000;
const spinCost = 100;
let isSpinning = false;

const balanceEl = document.getElementById('balance');
const messageEl = document.getElementById('message');
const spinBtn = document.getElementById('spin-btn');
const reels = [
    document.querySelector('#reel1 .symbol'),
    document.querySelector('#reel2 .symbol'),
    document.querySelector('#reel3 .symbol')
];

const AI_QUOTES = [
    "Generating output...",
    "Computing probabilities...",
    "Consulting the latent space...",
    "Optimizing loss function...",
    "Reticulating neural splines...",
    "Hallucinating facts..."
];

function updateBalance(amount) {
    balance += amount;
    balanceEl.textContent = balance;
}

function getRandomSymbol() {
    const randomIndex = Math.floor(Math.random() * symbolPool.length);
    return symbols[symbolPool[randomIndex]];
}

function setMessage(text, type = 'normal') {
    messageEl.textContent = text;
    messageEl.className = 'message';
    if (type !== 'normal') {
        messageEl.classList.add(`${type}-text`);
    }
}

async function spinReel(reelEl, duration) {
    return new Promise(resolve => {
        let startTime = null;
        reelEl.classList.add('blur');
        
        function animate(time) {
            if (!startTime) startTime = time;
            const progress = time - startTime;
            
            // Rapidly change the emoji to simulate spinning
            if (Math.floor(progress / 50) % 2 === 0) {
                 reelEl.textContent = getRandomSymbol().emoji;
            }

            if (progress < duration) {
                requestAnimationFrame(animate);
            } else {
                reelEl.classList.remove('blur');
                resolve();
            }
        }
        
        requestAnimationFrame(animate);
    });
}

async function spin() {
    if (isSpinning) return;
    if (balance < spinCost) {
        setMessage("Rate limited! Out of tokens.", "lose");
        return;
    }

    isSpinning = true;
    spinBtn.disabled = true;
    updateBalance(-spinCost);
    
    // Pick a random loading quote
    setMessage(AI_QUOTES[Math.floor(Math.random() * AI_QUOTES.length)]);

    // Determine final results beforehand
    const results = [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()];

    // Spin animations
    const spinPromises = [
        spinReel(reels[0], 1000),
        spinReel(reels[1], 1500),
        spinReel(reels[2], 2000)
    ];

    await Promise.all(spinPromises);

    // Set final symbols
    reels[0].textContent = results[0].emoji;
    reels[1].textContent = results[1].emoji;
    reels[2].textContent = results[2].emoji;

    checkWin(results);

    isSpinning = false;
    spinBtn.disabled = false;
}

function checkWin(results) {
    const [s1, s2, s3] = results;

    if (s1.emoji === s2.emoji && s2.emoji === s3.emoji) {
        // Three of a kind
        const winAmount = s1.value;
        if (winAmount > 0) {
            updateBalance(winAmount);
            setMessage(`Jackpot! You won ${winAmount} tokens!`, "win");
            if (s1.emoji === '🍓') setMessage("AGI ACHIEVED! +5000", "win");
        } else if (winAmount < 0) {
            updateBalance(winAmount);
            setMessage(`Catastrophic Forgetting! Lost ${Math.abs(winAmount)} tokens.`, "lose");
        } else {
            setMessage("Paperclip Maximizer... You get nothing.", "normal");
        }
    } else if (s1.emoji === s2.emoji || s2.emoji === s3.emoji || s1.emoji === s3.emoji) {
        // Two of a kind
        const match = s1.emoji === s2.emoji ? s1 : (s2.emoji === s3.emoji ? s2 : s3);
        if (match.emoji === '🗑️') {
            setMessage("Minor hallucination detected.", "lose");
        } else {
            const partialWin = 20;
            updateBalance(partialWin);
            setMessage(`Partial alignment. Refunded ${partialWin} tokens.`, "win");
        }
    } else {
         setMessage("Context limit exceeded. You lose.", "lose");
    }
}

spinBtn.addEventListener('click', spin);
