const symbols = ['🤖', '🧠', '💬', '🗑️', '📉', '✨'];
// 🤖 - AI
// 🧠 - Brain/Compute
// 💬 - Prompt
// 🗑️ - Garbage output
// 📉 - Loss
// ✨ - Hallucination/Magic

const payouts = {
    '✨✨✨': 1000, // Jackpot hallucination
    '🤖🤖🤖': 500,
    '🧠🧠🧠': 300,
    '💬💬💬': 200,
    '🗑️🗑️🗑️': 10, // Trash tier
    '📉📉📉': 0, // Total loss
};

let tokens = 1000;
const spinCost = 100;

const tokensDisplay = document.getElementById('tokens');
const messageDisplay = document.getElementById('message');
const spinButton = document.getElementById('spin-button');
const reels = [
    document.getElementById('reel1'),
    document.getElementById('reel2'),
    document.getElementById('reel3')
];

function updateTokens() {
    tokensDisplay.textContent = tokens;
    if (tokens < spinCost) {
        spinButton.disabled = true;
        messageDisplay.textContent = "Context limit reached. Please upgrade to Pro.";
    }
}

function getRandomSymbol() {
    return symbols[Math.floor(Math.random() * symbols.length)];
}

function spin() {
    if (tokens < spinCost) return;

    tokens -= spinCost;
    updateTokens();
    messageDisplay.textContent = "Generating response...";
    spinButton.disabled = true;

    // Visual spinning effect
    let spinCount = 0;
    const maxSpins = 20;
    const spinInterval = setInterval(() => {
        reels.forEach(reel => {
            reel.textContent = getRandomSymbol();
            reel.classList.add('spinning');
        });
        spinCount++;

        if (spinCount >= maxSpins) {
            clearInterval(spinInterval);
            finishSpin();
        }
    }, 50);
}

function finishSpin() {
    reels.forEach(reel => reel.classList.remove('spinning'));
    
    // Final result
    const result = [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()];
    reels.forEach((reel, index) => {
        reel.textContent = result[index];
    });

    calculateWin(result);
    if (tokens >= spinCost) {
        spinButton.disabled = false;
    }
}

function calculateWin(result) {
    const resultString = result.join('');
    
    if (payouts[resultString] !== undefined) {
        const winAmount = payouts[resultString];
        if (winAmount > 0) {
            tokens += winAmount;
            messageDisplay.textContent = `High quality output! You regained ${winAmount} tokens.`;
        } else {
             messageDisplay.textContent = `Model collapsed! You won nothing.`;
        }
    } else {
        // Check for 2 of a kind
        if (result[0] === result[1] || result[1] === result[2] || result[0] === result[2]) {
            const winAmount = 50;
            tokens += winAmount;
            messageDisplay.textContent = `Partial coherence. Refunded ${winAmount} tokens.`;
        } else {
            messageDisplay.textContent = `Meaningless slop generated. Tokens wasted.`;
        }
    }
    updateTokens();
}

spinButton.addEventListener('click', spin);
updateTokens();
