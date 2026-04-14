const symbols = [
    { emoji: '🧠', name: 'Brain', weight: 1 },
    { emoji: '🔋', name: 'GPU', weight: 2 },
    { emoji: '🤖', name: 'Robot', weight: 3 },
    { emoji: '💸', name: 'Money', weight: 4 },
    { emoji: '📄', name: 'Paper', weight: 4 },
    { emoji: '🗑️', name: 'Garbage', weight: 5 }
];

// Create weighted array for fair random selection
let weightedSymbols = [];
symbols.forEach(symbol => {
    for (let i = 0; i < symbol.weight; i++) {
        weightedSymbols.push(symbol.emoji);
    }
});

let balance = 1000;
const spinCost = 10;
let isSpinning = false;

const balanceDisplay = document.getElementById('balance');
const messageDisplay = document.getElementById('message');
const spinBtn = document.getElementById('spin-btn');
const reels = [
    document.getElementById('reel1').querySelector('.symbol'),
    document.getElementById('reel2').querySelector('.symbol'),
    document.getElementById('reel3').querySelector('.symbol')
];

function updateBalance(amount) {
    balance += amount;
    balanceDisplay.textContent = balance;
    if (balance < spinCost) {
        spinBtn.disabled = true;
        messageDisplay.textContent = "Error: Context Limit Exceeded (Out of Tokens). Reload to buy more context.";
        messageDisplay.style.color = 'var(--danger)';
    }
}

function getRandomSymbol() {
    const randomIndex = Math.floor(Math.random() * weightedSymbols.length);
    return weightedSymbols[randomIndex];
}

function spin() {
    if (isSpinning || balance < spinCost) return;
    
    isSpinning = true;
    spinBtn.disabled = true;
    updateBalance(-spinCost);
    messageDisplay.textContent = "Generating tokens... please wait...";
    messageDisplay.style.color = 'var(--text-color)';

    const spinDuration = 2000; // ms
    const intervalTime = 100; // ms
    let elapsedTime = 0;

    const spinInterval = setInterval(() => {
        reels.forEach(reel => {
            reel.textContent = getRandomSymbol();
        });
        elapsedTime += intervalTime;

        if (elapsedTime >= spinDuration) {
            clearInterval(spinInterval);
            finishSpin();
        }
    }, intervalTime);
}

function finishSpin() {
    // Generate final results
    const results = [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()];
    
    // Apply final results to DOM with a slight stagger for dramatic effect
    results.forEach((symbol, index) => {
        setTimeout(() => {
            reels[index].textContent = symbol;
            reels[index].style.transform = 'scale(1.2)';
            setTimeout(() => {
                reels[index].style.transform = 'scale(1)';
            }, 150);
            
            // Check win condition after last reel settles
            if (index === 2) {
                checkWin(results);
                isSpinning = false;
                if (balance >= spinCost) {
                    spinBtn.disabled = false;
                }
            }
        }, index * 200);
    });
}

function checkWin(results) {
    const counts = {};
    results.forEach(s => counts[s] = (counts[s] || 0) + 1);

    const uniqueSymbols = Object.keys(counts);
    let won = 0;
    let message = "Response generated. No actionable insights found.";
    let msgColor = 'var(--text-color)';

    if (uniqueSymbols.length === 1) {
        // 3 of a kind
        const symbol = uniqueSymbols[0];
        if (symbol === '🧠') {
            won = 500;
            message = "AGI ACHIEVED! JACKPOT!";
            msgColor = 'var(--accent-color)';
        } else if (symbol === '🔋') {
            won = 200;
            message = "GPU Cluster Secured! Big Win!";
            msgColor = 'var(--accent-color)';
        } else if (symbol === '🤖') {
            won = 100;
            message = "Fully Automated! Nice!";
            msgColor = 'var(--accent-color)';
        } else {
            won = 50;
            message = "Consistent Output. Not bad.";
            msgColor = 'var(--accent-color)';
        }
    } else if (uniqueSymbols.length === 2) {
        // 2 of a kind
        won = 20;
        message = "Partial Hallucination (2 matching). Minor token recovery.";
        msgColor = 'var(--accent-color)';
    }

    // Penalty for garbage
    const garbageCount = counts['🗑️'] || 0;
    if (garbageCount > 0 && won === 0) {
        const penalty = garbageCount * 5;
        won -= penalty;
        message = `Garbage Output! Lost ${penalty} extra tokens in filtering.`;
        msgColor = 'var(--danger)';
    }

    if (won > 0) {
        updateBalance(won);
        messageDisplay.textContent = message + ` (+${won} Tokens)`;
        messageDisplay.style.color = msgColor;
    } else if (won < 0) {
        updateBalance(won);
        messageDisplay.textContent = message;
        messageDisplay.style.color = msgColor;
    } else {
        messageDisplay.textContent = message;
        messageDisplay.style.color = msgColor;
    }
}

spinBtn.addEventListener('click', spin);

// Initial setup
reels.forEach(reel => reel.textContent = '❓');