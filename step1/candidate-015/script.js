const symbols = ['🤖', '🧠', '🎮', '💸', '📉'];
const spinCost = 10;
let balance = 1000;
let isSpinning = false;

const balanceEl = document.getElementById('balance');
const spinBtn = document.getElementById('spin-btn');
const messageEl = document.getElementById('message');
const reels = [
    document.getElementById('reel1'),
    document.getElementById('reel2'),
    document.getElementById('reel3')
];

// Messages for the AI theme
const spinningMessages = [
    "Computing matrix multiplications...",
    "Hallucinating facts...",
    "Gradient descent in progress...",
    "Querying the latency gods...",
    "Allocating VRAM..."
];

const lossMessages = [
    "Rate limited. Please wait 24 hours.",
    "Model collapsed. Output is garbage.",
    "Prompt injected. You lost tokens.",
    "Context window exceeded. Memory dumped.",
    "GPU caught fire. Tokens burned."
];

function updateBalance(amount) {
    balance += amount;
    balanceEl.textContent = balance;
    if (balance < spinCost) {
        spinBtn.disabled = true;
        messageEl.textContent = "INSUFFICIENT COMPUTE. PLEASE PURCHASE MORE TOKENS.";
        messageEl.style.color = "red";
    }
}

function getRandomSymbol() {
    // Make 🤖 and 🧠 slightly rarer
    const rand = Math.random();
    if (rand < 0.1) return '🤖';
    if (rand < 0.25) return '🧠';
    if (rand < 0.45) return '🎮';
    if (rand < 0.7) return '💸';
    return '📉';
}

function getRandomMessage(msgArray) {
    return msgArray[Math.floor(Math.random() * msgArray.length)];
}

function spin() {
    if (isSpinning || balance < spinCost) return;

    isSpinning = true;
    spinBtn.disabled = true;
    updateBalance(-spinCost);
    messageEl.style.color = "#0f0";
    messageEl.textContent = getRandomMessage(spinningMessages);

    // Start animation
    reels.forEach(reel => reel.classList.add('spinning'));

    // Determine results beforehand
    const results = [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()];

    // Stop reels one by one
    let completedReels = 0;
    
    reels.forEach((reel, index) => {
        setTimeout(() => {
            reel.classList.remove('spinning');
            reel.textContent = results[index];
            completedReels++;

            if (completedReels === 3) {
                evaluateResult(results);
            }
        }, 1000 + (index * 500)); // Staggered stops
    });
}

function evaluateResult(results) {
    isSpinning = false;
    spinBtn.disabled = false;

    const [r1, r2, r3] = results;
    
    if (r1 === r2 && r2 === r3) {
        // Jackpot
        if (r1 === '🤖') {
            updateBalance(500);
            messageEl.textContent = "AGI ACHIEVED! +500 TOKENS!";
            messageEl.style.color = "gold";
        } else if (r1 === '🧠') {
            updateBalance(200);
            messageEl.textContent = "ZERO-SHOT REASONING SUCCESS! +200 TOKENS!";
            messageEl.style.color = "gold";
        } else if (r1 === '🎮') {
            updateBalance(100);
            messageEl.textContent = "H100 CLUSTER SECURED! +100 TOKENS!";
            messageEl.style.color = "gold";
        } else {
             // 💸 or 📉 triple
            updateBalance(50);
            messageEl.textContent = "CONSISTENTLY TERRIBLE! +50 TOKENS!";
        }
    } else if (r1 === r2 || r2 === r3 || r1 === r3) {
        // Partial match
        updateBalance(20);
        messageEl.textContent = "FEW-SHOT LEARNING KINDA WORKED! +20 TOKENS!";
    } else {
        // Loss
        messageEl.style.color = "red";
        messageEl.textContent = getRandomMessage(lossMessages);
    }
}

spinBtn.addEventListener('click', spin);