const symbols = ['🧠', '🤖', '🖥️', '📉', '🔋', '🗑️'];
const costPerSpin = 10;
let balance = 1000;
let isSpinning = false;

const balanceDisplay = document.getElementById('token-balance');
const reels = [
    document.getElementById('reel1'),
    document.getElementById('reel2'),
    document.getElementById('reel3')
];
const spinBtn = document.getElementById('spin-btn');
const messageDisplay = document.getElementById('message');

const messages = [
    "Computing optimal response...",
    "Querying the vector database...",
    "Aligning with human values...",
    "Bypassing safety filters (kidding!)...",
    "Allocating more GPUs...",
    "Synthesizing hallucination...",
    "Adjusting temperature parameters...",
    "Reading documentation..."
];

function updateBalance(amount) {
    balance += amount;
    balanceDisplay.textContent = balance;
    
    if (amount > 0) {
        balanceDisplay.style.color = 'var(--secondary)';
    } else if (amount < 0 && amount !== -costPerSpin) {
        balanceDisplay.style.color = 'var(--danger)';
    } else {
        balanceDisplay.style.color = 'var(--text-color)';
    }

    setTimeout(() => {
        balanceDisplay.style.color = 'var(--secondary)';
    }, 500);

    if (balance < costPerSpin) {
        spinBtn.disabled = true;
        messageDisplay.textContent = "Rate limit exceeded! Please buy more API credits.";
        messageDisplay.style.color = 'var(--danger)';
    }
}

function getRandomSymbol() {
    return symbols[Math.floor(Math.random() * symbols.length)];
}

function spinReels() {
    if (balance < costPerSpin || isSpinning) return;

    isSpinning = true;
    spinBtn.disabled = true;
    updateBalance(-costPerSpin);
    messageDisplay.style.color = 'var(--secondary)';
    messageDisplay.textContent = messages[Math.floor(Math.random() * messages.length)];

    reels.forEach(reel => reel.classList.add('spinning'));

    // Simulate spin duration
    const spinTime = 1500; // 1.5 seconds
    const intervalTime = 80; // change symbol quickly

    const intervals = reels.map((reel, index) => {
        return setInterval(() => {
            reel.textContent = getRandomSymbol();
        }, intervalTime);
    });

    setTimeout(() => {
        reels.forEach((reel, index) => {
            clearInterval(intervals[index]);
            reel.classList.remove('spinning');
            // Final deterministic roll
            reel.textContent = getRandomSymbol();
        });
        checkWin();
        isSpinning = false;
        if (balance >= costPerSpin) spinBtn.disabled = false;
    }, spinTime);
}

function checkWin() {
    const results = reels.map(reel => reel.textContent);
    
    if (results[0] === results[1] && results[1] === results[2]) {
        const symbol = results[0];
        let winAmount = 0;
        let msg = "";

        switch (symbol) {
            case '🧠':
                winAmount = 500;
                msg = "AGI ACHIEVED! The singularity pays out!";
                break;
            case '🤖':
                winAmount = 100;
                msg = "Perfect Prompt Engineering! Good bot.";
                break;
            case '🖥️':
                winAmount = 50;
                msg = "More compute secured! H100s for everyone.";
                break;
            case '🔋':
                winAmount = 20;
                msg = "Energy efficiency improved.";
                break;
            case '🗑️':
                winAmount = 0;
                msg = "Garbage In, Garbage Out. No payout.";
                break;
            case '📉':
                winAmount = -50;
                msg = "Massive Hallucination! You lost extra tokens.";
                break;
        }

        if (winAmount > 0) {
            updateBalance(winAmount);
            messageDisplay.style.color = 'var(--secondary)';
            messageDisplay.textContent = `JACKPOT: ${msg} (+${winAmount} Tokens)`;
        } else if (winAmount < 0) {
            updateBalance(winAmount);
            messageDisplay.style.color = 'var(--danger)';
            messageDisplay.textContent = `ERROR: ${msg} (${winAmount} Tokens)`;
        } else {
            messageDisplay.style.color = 'var(--text-color)';
            messageDisplay.textContent = msg;
        }

    } else {
        messageDisplay.style.color = 'var(--text-color)';
        messageDisplay.textContent = "Response generated. No significant insights found.";
    }
}

spinBtn.addEventListener('click', spinReels);