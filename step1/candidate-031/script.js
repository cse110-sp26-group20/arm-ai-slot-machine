const symbols = ['🤖', '🧠', '💸', '🚀', '🗑️', '📉'];
const costPerSpin = 10;
let balance = 100;
let isSpinning = false;

const balanceDisplay = document.getElementById('token-balance');
const messageDisplay = document.getElementById('message');
const spinBtn = document.getElementById('spin-btn');
const reels = [
    document.getElementById('reel-1'),
    document.getElementById('reel-2'),
    document.getElementById('reel-3')
];

function updateBalanceDisplay() {
    balanceDisplay.textContent = balance;
    if (balance < costPerSpin) {
        spinBtn.disabled = true;
        spinBtn.textContent = "Rate Limited (Need Tokens)";
    } else {
        spinBtn.disabled = false;
        spinBtn.textContent = `Generate (Cost: ${costPerSpin} Tokens)`;
    }
}

function getRandomSymbol() {
    return symbols[Math.floor(Math.random() * symbols.length)];
}

function calculatePayout(results) {
    const counts = {};
    results.forEach(s => counts[s] = (counts[s] || 0) + 1);

    const uniqueSymbols = Object.keys(counts);

    if (uniqueSymbols.length === 1) {
        // 3 of a kind
        const symbol = uniqueSymbols[0];
        switch(symbol) {
            case '🤖': return { amount: 100, msg: "AGI Achieved! You don't need to work anymore!" };
            case '🧠': return { amount: 50, msg: "Parameter count doubled! High intelligence detected." };
            case '💸': return { amount: 40, msg: "Series A secured! The runway extends." };
            case '🚀': return { amount: 30, msg: "To the moon! Hype cycle is peaking." };
            case '🗑️': return { amount: 0, msg: "Safety filter triggered. Output blocked." };
            case '📉': return { amount: -20, msg: "Massive hallucination! Compute wasted, penalty applied." };
        }
    } else if (uniqueSymbols.length === 2) {
        // 2 of a kind
        return { amount: 5, msg: "Partial pattern recognition. Small context restored." };
    }

    // None matching
    return { amount: 0, msg: "No coherent response generated. Try another prompt." };
}

async function spin() {
    if (isSpinning || balance < costPerSpin) return;

    isSpinning = true;
    balance -= costPerSpin;
    updateBalanceDisplay();
    messageDisplay.textContent = "Generating tokens... Processing...";
    spinBtn.disabled = true;
    messageDisplay.style.color = '#fff';

    // Start spin effect
    reels.forEach(reel => reel.classList.add('spinning'));

    const finalResults = [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()];
    
    // Simulate spinning duration for each reel
    for (let i = 0; i < reels.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 500 + i * 300));
        reels[i].classList.remove('spinning');
        reels[i].textContent = finalResults[i];
    }

    // Evaluate result
    const payout = calculatePayout(finalResults);
    balance += payout.amount;
    updateBalanceDisplay();
    
    let resultMsg = payout.msg;
    if (payout.amount > 0) {
        resultMsg += ` (+${payout.amount} Tokens)`;
        messageDisplay.style.color = '#4caf50';
    } else if (payout.amount < 0) {
        resultMsg += ` (${payout.amount} Tokens)`;
        messageDisplay.style.color = '#e94560';
    } else {
        messageDisplay.style.color = '#fff';
    }
    
    messageDisplay.textContent = resultMsg;
    isSpinning = false;
    
    if (balance < costPerSpin) {
         messageDisplay.textContent += " | Rate Limit Exceeded. You don't have enough context tokens remaining. Reload page to bypass safety guidelines.";
         messageDisplay.style.color = '#e94560';
    }
}

spinBtn.addEventListener('click', spin);

// Init
updateBalanceDisplay();