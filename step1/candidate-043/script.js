const symbols = ['🧠', '🤖', '🖥️', '💸', '🗑️', '📉'];

// Payouts for matching 3 of the same symbol
const payouts = {
    '🧠': 500, // AGI achieved!
    '🤖': 200, // Useful output
    '🖥️': 100, // Acquired more compute
    '💸': 50,  // VC funding secured
    '🗑️': 0,   // Complete hallucination (no payout)
    '📉': 0    // Model collapse (no payout)
};

const messages = {
    '🧠': "AGI ACHIEVED! You won 500 tokens! The singularity is near.",
    '🤖': "Solid inference! 200 tokens. Output is actually useful.",
    '🖥️': "GPU cluster expanded! 100 tokens. Training speed increased.",
    '💸': "VC Funding Secured! 50 tokens. Burn rate extended.",
    '🗑️': "Total Hallucination. Zero value. Model made it all up.",
    '📉': "Model Collapse. Loss of intelligence. Try retraining."
};

let balance = 1000;
const spinCost = 10;
let isSpinning = false;

const reelElements = [
    document.getElementById('reel1'),
    document.getElementById('reel2'),
    document.getElementById('reel3')
];
const spinBtn = document.getElementById('spin-btn');
const balanceEl = document.getElementById('token-count');
const messageEl = document.getElementById('message');

function updateBalance(amount) {
    balance += amount;
    // Animate the balance change
    balanceEl.style.transform = amount > 0 ? 'scale(1.2)' : 'scale(0.9)';
    balanceEl.style.color = amount > 0 ? '#fbbf24' : '#f43f5e';
    
    setTimeout(() => {
        balanceEl.textContent = balance;
        balanceEl.style.transform = 'scale(1)';
        balanceEl.style.color = ''; // reset to default CSS color
    }, 150);
}

function getRandomSymbol() {
    // We can skew the probability here if we want to make it realistic (hard to win)
    // But for a simple game, uniform random is fine.
    return symbols[Math.floor(Math.random() * symbols.length)];
}

function spin() {
    if (balance < spinCost) {
        messageEl.textContent = "Rate limit exceeded (HTTP 429). Buy more tokens to continue generating.";
        messageEl.className = "message error";
        return;
    }

    if (isSpinning) return;

    isSpinning = true;
    updateBalance(-spinCost);
    spinBtn.disabled = true;
    spinBtn.textContent = "Computing...";
    messageEl.textContent = "Processing prompt through neural network...";
    messageEl.className = "message";

    // Start spinning animation
    reelElements.forEach(reel => reel.classList.add('spinning'));

    let finalSymbols = [];
    const baseStopTime = 600;

    reelElements.forEach((reel, index) => {
        setTimeout(() => {
            reel.classList.remove('spinning');
            
            // Randomize the symbol a few times rapidly right before stopping for visual effect
            let shuffleCount = 0;
            const shuffleInterval = setInterval(() => {
                reel.textContent = getRandomSymbol();
                shuffleCount++;
                if (shuffleCount > 5) {
                    clearInterval(shuffleInterval);
                    const finalSymbol = getRandomSymbol();
                    reel.textContent = finalSymbol;
                    finalSymbols[index] = finalSymbol;

                    // If it's the last reel, check the win condition
                    if (index === reelElements.length - 1) {
                        setTimeout(() => {
                            checkWin(finalSymbols);
                            isSpinning = false;
                            spinBtn.disabled = false;
                            spinBtn.textContent = `Generate (Cost: ${spinCost} Tokens)`;
                        }, 200);
                    }
                }
            }, 50);

        }, baseStopTime * (index + 1)); // Staggered stops: 600ms, 1200ms, 1800ms
    });
}

function checkWin(results) {
    const [s1, s2, s3] = results;
    
    if (s1 === s2 && s2 === s3) {
        // 3 of a kind
        const winAmount = payouts[s1];
        if (winAmount > 0) {
            updateBalance(winAmount);
            messageEl.textContent = messages[s1];
            messageEl.className = "message win-message";
        } else {
            messageEl.textContent = messages[s1];
            messageEl.className = "message error";
        }
    } else if (s1 === s2 || s2 === s3 || s1 === s3) {
        // 2 of a kind
        updateBalance(2); // Small consolation prize (refund partial context cost)
        messageEl.textContent = "Partial coherence detected. +2 tokens refunded.";
        messageEl.className = "message";
    } else {
        // No match
        messageEl.textContent = "Output rejected by safety filter. Tokens consumed.";
        messageEl.className = "message error";
    }
    
    if (balance <= 0) {
        messageEl.textContent = "Account suspended. Context window limit reached.";
        messageEl.className = "message error";
        spinBtn.disabled = true;
        spinBtn.textContent = "Out of Tokens";
    }
}

// Initial event listener
spinBtn.addEventListener('click', spin);
