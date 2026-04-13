const symbols = ['🧠', '🤖', '✨', '📉', '🗑️', '💸'];
const symbolWeights = [3, 4, 2, 5, 5, 2]; // Higher weight = more common
let balance = 1000;
const costPerSpin = 50;

const reels = [
    document.getElementById('reel1'),
    document.getElementById('reel2'),
    document.getElementById('reel3')
];
const balanceDisplay = document.getElementById('token-balance');
const spinBtn = document.getElementById('spin-btn');
const messageDisplay = document.getElementById('message');

function getRandomSymbol() {
    const totalWeight = symbolWeights.reduce((a, b) => a + b, 0);
    let randomNum = Math.random() * totalWeight;
    for (let i = 0; i < symbols.length; i++) {
        if (randomNum < symbolWeights[i]) {
            return symbols[i];
        }
        randomNum -= symbolWeights[i];
    }
    return symbols[0];
}

function updateBalance(amount) {
    balance += amount;
    balanceDisplay.textContent = balance;
}

function showMessage(text, className) {
    messageDisplay.textContent = text;
    messageDisplay.className = 'message ' + className;
}

function evaluateWin(results) {
    if (results[0] === results[1] && results[1] === results[2]) {
        // Jackpot
        if (results[0] === '✨') {
            updateBalance(1000);
            showMessage("✨ AGI ACHIEVED! +1000 Tokens! ✨", "jackpot");
        } else if (results[0] === '💸') {
            updateBalance(500);
            showMessage("💸 VC FUNDING SECURED! +500 Tokens!", "win");
        } else if (results[0] === '🗑️') {
            updateBalance(-100);
            showMessage("🗑️ MODE COLLAPSE! You lost 100 extra tokens!", "lose");
        } else {
            updateBalance(200);
            showMessage(`${results[0]} Perfect Alignment! +200 Tokens!`, "win");
        }
    } else if (results[0] === results[1] || results[1] === results[2] || results[0] === results[2]) {
        // Two matches
        updateBalance(25);
        showMessage("Partial reasoning step... +25 Tokens.", "win");
    } else {
        showMessage("Hallucination. The model output was garbage.", "lose");
    }
}

async function spin() {
    if (balance < costPerSpin) {
        showMessage("Out of Context Window! Please upgrade your tier.", "lose");
        return;
    }

    updateBalance(-costPerSpin);
    spinBtn.disabled = true;
    showMessage("Generating...", "");

    // Add spinning animation class
    reels.forEach(reel => reel.classList.add('spinning'));

    const spinDurations = [1000, 1500, 2000];
    const finalResults = [];

    for (let i = 0; i < reels.length; i++) {
        await new Promise(resolve => {
            let interval = setInterval(() => {
                reels[i].textContent = getRandomSymbol();
            }, 100);

            setTimeout(() => {
                clearInterval(interval);
                reels[i].classList.remove('spinning');
                const finalSymbol = getRandomSymbol();
                reels[i].textContent = finalSymbol;
                finalResults.push(finalSymbol);
                resolve();
            }, spinDurations[i]);
        });
    }

    evaluateWin(finalResults);
    spinBtn.disabled = false;
}

spinBtn.addEventListener('click', spin);