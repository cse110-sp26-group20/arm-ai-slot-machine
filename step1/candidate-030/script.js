const symbols = [
    { emoji: '🧠', value: 'agi', name: 'AGI Achieved!' },
    { emoji: '🖥️', value: 'gpu', name: 'GPU Hoarder' },
    { emoji: '🤖', value: 'bot', name: 'Job Automated' },
    { emoji: '🌶️', value: 'spicy', name: 'Spicy Hallucination' },
    { emoji: '🗑️', value: 'trash', name: 'Model Collapse' },
    { emoji: '📉', value: 'down', name: 'GPU Poor' }
];

const SPIN_COST = 100;
let tokens = 10000;
let isSpinning = false;

const tokenDisplay = document.getElementById('token-count');
const messageDisplay = document.getElementById('message');
const reels = [
    document.getElementById('reel1'),
    document.getElementById('reel2'),
    document.getElementById('reel3')
];
const spinButton = document.getElementById('spin-button');

function updateTokens(amount) {
    tokens += amount;
    tokenDisplay.textContent = tokens;
}

function getRandomSymbol() {
    return symbols[Math.floor(Math.random() * symbols.length)];
}

function checkWin(results) {
    const [r1, r2, r3] = results;
    
    if (r1.value === r2.value && r2.value === r3.value) {
        switch (r1.value) {
            case 'agi':
                updateTokens(5000);
                return `AGI Achieved! Humanity is saved/doomed. +5000 tokens!`;
            case 'gpu':
                updateTokens(2000);
                return `Secured H100s! +2000 tokens!`;
            case 'bot':
                updateTokens(1000);
                return `Replaced a Junior Dev! +1000 tokens!`;
            case 'spicy':
                updateTokens(500);
                return `Hallucinated a new framework! +500 tokens!`;
            case 'trash':
                updateTokens(-500);
                return `Model Collapse... AI eating AI garbage. -500 tokens.`;
            case 'down':
                updateTokens(0);
                return `Ran out of compute... Try raising more VC money.`;
            default:
                return `Jackpot!`;
        }
    } else if (r1.value === r2.value || r2.value === r3.value || r1.value === r3.value) {
        updateTokens(50);
        return `Partial match. Just like our test coverage. +50 tokens.`;
    } else {
        return `Context window exceeded. No match.`;
    }
}

function spin() {
    if (tokens < SPIN_COST) {
        messageDisplay.textContent = "Not enough compute tokens! Ask VC for more funding.";
        return;
    }

    if (isSpinning) return;
    
    isSpinning = true;
    spinButton.disabled = true;
    updateTokens(-SPIN_COST);
    messageDisplay.textContent = "Generating tokens... please wait...";

    // Start spinning animation
    reels.forEach(reel => reel.classList.add('spinning'));

    // Simulate API latency / spinning time
    const spinTime = 2000;
    
    // Animate random symbols during spin
    const spinInterval = setInterval(() => {
        reels.forEach(reel => {
            reel.textContent = getRandomSymbol().emoji;
        });
    }, 100);

    setTimeout(() => {
        clearInterval(spinInterval);
        reels.forEach(reel => reel.classList.remove('spinning'));

        const results = [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()];
        
        reels[0].textContent = results[0].emoji;
        reels[1].textContent = results[1].emoji;
        reels[2].textContent = results[2].emoji;

        const resultMessage = checkWin(results);
        messageDisplay.textContent = resultMessage;

        isSpinning = false;
        spinButton.disabled = false;
        
        if (tokens <= 0) {
            messageDisplay.textContent = "BANKRUPT! Your startup failed.";
            spinButton.disabled = true;
        }

    }, spinTime);
}

spinButton.addEventListener('click', spin);