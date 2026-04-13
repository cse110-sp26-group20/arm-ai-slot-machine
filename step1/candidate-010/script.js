const symbols = ['🤖', '💸', '🧠', '🤡', '💻', '📉'];
const SPIN_COST = 10;
let balance = 1000;
let isSpinning = false;

const balanceEl = document.getElementById('token-balance');
const messageEl = document.getElementById('message');
const spinBtn = document.getElementById('spin-btn');
const reels = [
    document.getElementById('reel1').querySelector('.symbol'),
    document.getElementById('reel2').querySelector('.symbol'),
    document.getElementById('reel3').querySelector('.symbol')
];
const reelContainers = [
    document.getElementById('reel1'),
    document.getElementById('reel2'),
    document.getElementById('reel3')
];

function updateBalance() {
    balanceEl.textContent = balance;
    if (balance < SPIN_COST) {
        spinBtn.disabled = true;
        messageEl.textContent = "Out of VC funding! Time to pivot or shut down.";
        messageEl.style.color = "var(--danger-color)";
    }
}

function getRandomSymbol() {
    return symbols[Math.floor(Math.random() * symbols.length)];
}

function playSpinAnimation(duration) {
    return new Promise(resolve => {
        reelContainers.forEach(container => container.classList.add('spinning'));
        
        let startTime = Date.now();
        
        // Visual effect of spinning
        const spinInterval = setInterval(() => {
            reels.forEach(reel => {
                reel.textContent = getRandomSymbol();
            });
        }, 50);

        setTimeout(() => {
            clearInterval(spinInterval);
            reelContainers.forEach(container => container.classList.remove('spinning'));
            resolve();
        }, duration);
    });
}

async function spin() {
    if (isSpinning || balance < SPIN_COST) return;

    isSpinning = true;
    balance -= SPIN_COST;
    updateBalance();
    messageEl.textContent = "Generating tokens... Calling API...";
    messageEl.style.color = "";
    spinBtn.disabled = true;

    // Simulate network delay / spinning
    await playSpinAnimation(1500);

    // Determine final result
    const result = [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()];
    
    for (let i = 0; i < 3; i++) {
        reels[i].textContent = result[i];
    }

    evaluateWin(result);
    
    isSpinning = false;
    if (balance >= SPIN_COST) {
        spinBtn.disabled = false;
    }
}

function evaluateWin(result) {
    const [s1, s2, s3] = result;
    
    if (s1 === s2 && s2 === s3) {
        // 3 of a kind
        if (s1 === '🤖') {
            win(500, "AGI Achieved! You disrupted the world!");
        } else if (s1 === '💸') {
            win(200, "Series A Secured! The runway is extended!");
        } else if (s1 === '🧠') {
            win(100, "Eureka! New breakthrough architecture discovered!");
        } else if (s1 === '🤡') {
            lose(50, "Massive Hallucination! The model insulted a key investor.");
        } else {
            win(50, "Solid progress! Investors are happy.");
        }
    } else if (s1 === s2 || s2 === s3 || s1 === s3) {
        // 2 of a kind
        win(10, "Minor optimization successful. Tokens recovered.");
    } else {
        messageEl.textContent = "API Error 402: Payment Required. Tokens burned.";
        messageEl.style.color = "#94a3b8"; // neutral text color
    }
}

function win(amount, message) {
    balance += amount;
    updateBalance();
    messageEl.textContent = message + ` (+${amount} Tokens)`;
    messageEl.style.color = "var(--accent-color)";
}

function lose(amount, message) {
    balance -= amount;
    if(balance < 0) balance = 0; 
    updateBalance();
    messageEl.textContent = message + ` (-${amount} Tokens)`;
    messageEl.style.color = "var(--danger-color)";
}

spinBtn.addEventListener('click', spin);

// Initial setup
updateBalance();