const symbols = [
    { emoji: '🧠', name: 'AGI', weight: 1 },
    { emoji: '🖥️', name: 'H100 GPU', weight: 3 },
    { emoji: '📈', name: 'Exponential Growth', weight: 4 },
    { emoji: '🤖', name: 'Wrapper App', weight: 6 },
    { emoji: '🗑️', name: 'Hallucination', weight: 5 },
    { emoji: '💸', name: 'VC Funding', weight: 5 }
];

const betAmount = 10;
let balance = 1000;
let isSpinning = false;

const balanceEl = document.getElementById('balance');
const messageEl = document.getElementById('message');
const spinBtn = document.getElementById('spin-btn');
const reels = [
    document.getElementById('reel1'),
    document.getElementById('reel2'),
    document.getElementById('reel3')
];

// Create a weighted array for random selection
const weightedSymbols = [];
symbols.forEach(symbol => {
    for (let i = 0; i < symbol.weight; i++) {
        weightedSymbols.push(symbol);
    }
});

function getRandomSymbol() {
    const randomIndex = Math.floor(Math.random() * weightedSymbols.length);
    return weightedSymbols[randomIndex];
}

function updateBalance(amount) {
    balance += amount;
    balanceEl.textContent = balance;
    if (balance < betAmount) {
        spinBtn.disabled = true;
        showMessage("Out of tokens! The AI has replaced you.", "lose");
    }
}

function showMessage(text, className) {
    messageEl.textContent = text;
    messageEl.className = 'message ' + className;
}

function calculatePayout(results) {
    const counts = {};
    results.forEach(s => {
        counts[s.emoji] = (counts[s.emoji] || 0) + 1;
    });

    // Check for 3 of a kind
    for (const [emoji, count] of Object.entries(counts)) {
        if (count === 3) {
            if (emoji === '🧠') return { amount: 500, msg: "AGI ACHIEVED! You won 500 Tokens!" };
            if (emoji === '🖥️') return { amount: 200, msg: "GPU Cluster secured! You won 200 Tokens!" };
            if (emoji === '📈') return { amount: 100, msg: "To the moon! You won 100 Tokens!" };
            if (emoji === '🗑️') return { amount: -50, msg: "MASSIVE HALLUCINATION! Model collapsed. Penalty: -50 Tokens!" };
            if (emoji === '💸') return { amount: 50, msg: "Seed round raised! You won 50 Tokens!" };
            if (emoji === '🤖') return { amount: 30, msg: "Nice wrapper app. You won 30 Tokens!" };
        }
    }

    // Check for 2 of a kind
    for (const [emoji, count] of Object.entries(counts)) {
        if (count === 2) {
            if (emoji === '🗑️') return { amount: -20, msg: "Minor hallucination. Output discarded. Penalty: -20 Tokens!" };
            return { amount: 20, msg: "Partial pattern match! You won 20 Tokens!" };
        }
    }

    return { amount: 0, msg: "Compute wasted. API call returned garbage. 0 Tokens." };
}

async function spin() {
    if (isSpinning || balance < betAmount) return;

    isSpinning = true;
    spinBtn.disabled = true;
    updateBalance(-betAmount);
    showMessage("Processing API Request...", "");

    const finalResults = [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()];
    const spinDurations = [1000, 1500, 2000];

    // Visual spinning effect
    reels.forEach((reel, index) => {
        reel.classList.add('spinning');
        
        // Rapidly change emojis while spinning
        const interval = setInterval(() => {
            reel.textContent = getRandomSymbol().emoji;
        }, 100);

        // Stop spinning at the right time
        setTimeout(() => {
            clearInterval(interval);
            reel.classList.remove('spinning');
            reel.textContent = finalResults[index].emoji;
            
            // If it's the last reel, calculate results
            if (index === 2) {
                const payout = calculatePayout(finalResults);
                
                setTimeout(() => {
                    if (payout.amount > 0) {
                        updateBalance(payout.amount);
                        showMessage(payout.msg, "win");
                    } else if (payout.amount < 0) {
                        updateBalance(payout.amount); // Penalty
                        showMessage(payout.msg, "penalty");
                    } else {
                        showMessage(payout.msg, "lose");
                    }
                    
                    isSpinning = false;
                    if (balance >= betAmount) {
                        spinBtn.disabled = false;
                    }
                }, 500);
            }
        }, spinDurations[index]);
    });
}

spinBtn.addEventListener('click', spin);

// Initial setup
reels.forEach(reel => reel.textContent = getRandomSymbol().emoji);
