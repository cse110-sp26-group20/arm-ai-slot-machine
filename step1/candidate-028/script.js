const symbols = [
    { emoji: '🤖', name: 'Robot', value: 20 },
    { emoji: '🧠', name: 'Brain', value: 30 },
    { emoji: '⚡', name: 'Compute', value: 50 },
    { emoji: '💸', name: 'Tokens', value: 100 },
    { emoji: '📉', name: 'Gradient Descent', value: 10 },
    { emoji: '🚀', name: 'Hype', value: 200 }
];

const spinCost = 10;
let tokens = 1000;
let isSpinning = false;

const tokenCountDisplay = document.getElementById('token-count');
const reel1 = document.getElementById('reel1');
const reel2 = document.getElementById('reel2');
const reel3 = document.getElementById('reel3');
const spinButton = document.getElementById('spin-button');
const messageArea = document.getElementById('message-area');

const winMessages = [
    "AGI achieved! Massive token payout!",
    "Zero-shot success! You hit the jackpot!",
    "Prompt engineering masterclass! Tokens awarded.",
    "Model weights updated successfully! Big win!",
    "Hallucination? No, that's a real win!"
];

const lossMessages = [
    "Context window exceeded. Try again.",
    "Rate limit hit. Tokens burned.",
    "Model hallucinated a win. Sorry, you lost.",
    "GPU out of memory. Tokens lost to the void.",
    "Your prompt was blocked by safety filters."
];

function updateTokenDisplay() {
    tokenCountDisplay.textContent = tokens;
    if (tokens < spinCost) {
        spinButton.disabled = true;
        messageArea.textContent = "Out of tokens! Time to ask VC for more funding.";
        messageArea.className = "message loss";
    }
}

function getRandomSymbol() {
    return symbols[Math.floor(Math.random() * symbols.length)];
}

function getRandomMessage(messages) {
    return messages[Math.floor(Math.random() * messages.length)];
}

async function spinReels() {
    if (tokens < spinCost || isSpinning) return;

    isSpinning = true;
    tokens -= spinCost;
    updateTokenDisplay();
    spinButton.disabled = true;
    
    messageArea.textContent = "Generating response... (Spinning)";
    messageArea.className = "message";

    const reels = [reel1, reel2, reel3];
    
    // Start spin animation
    reels.forEach(r => r.classList.add('spinning'));

    // Flashing symbols during spin
    const spinDuration = 2000; // 2 seconds
    const intervalTime = 100;
    
    let flashInterval = setInterval(() => {
        reels.forEach(r => {
            r.textContent = getRandomSymbol().emoji;
        });
    }, intervalTime);

    // Stop reels one by one
    await new Promise(resolve => setTimeout(resolve, spinDuration));
    
    clearInterval(flashInterval);

    const resultSymbols = [
        getRandomSymbol(),
        getRandomSymbol(),
        getRandomSymbol()
    ];

    // Sometimes bias towards losing to simulate "AI taxes" if they have lots of tokens
    if (tokens > 1500 && Math.random() > 0.3) {
        // Force a loss 70% of the time if they are winning too much
        resultSymbols[2] = symbols.find(s => s.emoji !== resultSymbols[0].emoji && s.emoji !== resultSymbols[1].emoji) || getRandomSymbol();
    }

    // Stop animations and set final results
    reels.forEach((r, index) => {
        setTimeout(() => {
            r.classList.remove('spinning');
            r.textContent = resultSymbols[index].emoji;
            
            // On last reel stop, evaluate win
            if (index === 2) {
                evaluateResult(resultSymbols);
            }
        }, index * 400); // Stagger stop times
    });
}

function evaluateResult(results) {
    const [s1, s2, s3] = results;

    if (s1.emoji === s2.emoji && s2.emoji === s3.emoji) {
        // 3 of a kind
        const winAmount = s1.value * 10;
        tokens += winAmount;
        messageArea.textContent = `${getRandomMessage(winMessages)} You won ${winAmount} tokens!`;
        messageArea.className = "message win";
    } else if (s1.emoji === s2.emoji || s2.emoji === s3.emoji || s1.emoji === s3.emoji) {
        // 2 of a kind
        const matchSymbol = s1.emoji === s2.emoji ? s1 : (s2.emoji === s3.emoji ? s2 : s1);
        const winAmount = matchSymbol.value;
        tokens += winAmount;
        messageArea.textContent = `Partial context matched! You recovered ${winAmount} tokens.`;
        messageArea.className = "message win";
    } else {
        // Loss
        messageArea.textContent = getRandomMessage(lossMessages);
        messageArea.className = "message loss";
    }

    updateTokenDisplay();
    isSpinning = false;
    if (tokens >= spinCost) {
        spinButton.disabled = false;
    }
}

spinButton.addEventListener('click', spinReels);

// Initial setup
updateTokenDisplay();
