const symbols = ['🤖', '🧠', '🎮', '🐛', '📄', '📉', '💸'];
const costPerSpin = 10;
let balance = 1000;
let isSpinning = false;

const balanceDisplay = document.getElementById('balance');
const slot1 = document.getElementById('slot1');
const slot2 = document.getElementById('slot2');
const slot3 = document.getElementById('slot3');
const spinBtn = document.getElementById('spin-btn');
const messageDisplay = document.getElementById('message');

function updateBalance() {
    balanceDisplay.textContent = balance;
    if (balance < costPerSpin) {
        spinBtn.disabled = true;
        messageDisplay.textContent = "Rate limit exceeded! Out of tokens.";
        messageDisplay.style.color = "#ff4444";
    }
}

function getRandomSymbol() {
    return symbols[Math.floor(Math.random() * symbols.length)];
}

function spin() {
    if (isSpinning || balance < costPerSpin) return;

    balance -= costPerSpin;
    updateBalance();
    
    isSpinning = true;
    spinBtn.disabled = true;
    messageDisplay.textContent = "Generating response... (Spinning)";
    messageDisplay.style.color = "#aaaaaa";

    slot1.classList.add('spinning');
    slot2.classList.add('spinning');
    slot3.classList.add('spinning');

    let spinTime = 0;
    const spinInterval = setInterval(() => {
        slot1.textContent = getRandomSymbol();
        slot2.textContent = getRandomSymbol();
        slot3.textContent = getRandomSymbol();
        spinTime += 50;
        
        if (spinTime >= 1000) {
            clearInterval(spinInterval);
            stopReels();
        }
    }, 50);
}

function stopReels() {
    const final1 = getRandomSymbol();
    const final2 = getRandomSymbol();
    const final3 = getRandomSymbol();

    setTimeout(() => {
        slot1.textContent = final1;
        slot1.classList.remove('spinning');
    }, 100);

    setTimeout(() => {
        slot2.textContent = final2;
        slot2.classList.remove('spinning');
    }, 300);

    setTimeout(() => {
        slot3.textContent = final3;
        slot3.classList.remove('spinning');
        calculateWin(final1, final2, final3);
    }, 500);
}

function calculateWin(s1, s2, s3) {
    isSpinning = false;
    spinBtn.disabled = balance < costPerSpin;
    
    if (s1 === s2 && s2 === s3) {
        if (s1 === '🤖') {
            win(500, "AGI Achieved! +500 Tokens", "#00ffcc");
        } else if (s1 === '🧠') {
            win(200, "Big Brain Move! +200 Tokens", "#00ffcc");
        } else if (s1 === '🎮') {
            win(100, "GPU Scalper! +100 Tokens", "#00ffcc");
        } else if (s1 === '🐛') {
            lose(50, "Hallucination! Extra Cost: -50 Tokens", "#ff4444");
        } else {
            win(50, "Jackpot! +50 Tokens", "#00ffcc");
        }
    } else if (s1 === s2 || s1 === s3 || s2 === s3) {
        win(20, "Partial Coherence! +20 Tokens", "#ffaa00");
    } else {
        messageDisplay.textContent = "Response was gibberish. Try another prompt.";
        messageDisplay.style.color = "#aaaaaa";
    }
}

function win(amount, message, color) {
    balance += amount;
    updateBalance();
    messageDisplay.textContent = message;
    messageDisplay.style.color = color;
}

function lose(amount, message, color) {
    balance -= amount;
    updateBalance();
    messageDisplay.textContent = message;
    messageDisplay.style.color = color;
}

spinBtn.addEventListener('click', spin);