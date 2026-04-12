const symbols = ['✨', '🖥️', '🧠', '🤖', '💸', '🗑️'];
const costPerSpin = 50;
let balance = 1000;
let isSpinning = false;

const balanceDisplay = document.getElementById('balance');
const reels = [
    document.getElementById('reel1'),
    document.getElementById('reel2'),
    document.getElementById('reel3')
];
const spinBtn = document.getElementById('spinBtn');
const messageDisplay = document.getElementById('message');

function updateBalance(amount) {
    balance += amount;
    balanceDisplay.textContent = balance;
    if (balance < costPerSpin) {
        spinBtn.disabled = true;
        spinBtn.textContent = "Rate Limit Exceeded (No Tokens)";
    }
}

function getRandomSymbol() {
    return symbols[Math.floor(Math.random() * symbols.length)];
}

function evaluateSpin(result) {
    const [s1, s2, s3] = result;
    
    if (s1 === s2 && s2 === s3) {
        if (s1 === '✨') return { payout: 2000, msg: "AGI ACHIEVED! MAJOR JACKPOT!" };
        if (s1 === '🖥️') return { payout: 1000, msg: "Compute Cluster Secured! BIG WIN!" };
        if (s1 === '🧠') return { payout: 500, msg: "Galaxy Brain Response! Nice Win!" };
        if (s1 === '🗑️') return { payout: -200, msg: "COMPLETE HALLUCINATION! You lose extra tokens!" };
        return { payout: 300, msg: "Consistent Output! Good job." };
    }
    
    if (s1 === s2 || s2 === s3 || s1 === s3) {
        return { payout: 100, msg: "Partial Match. Acceptable Output." };
    }
    
    return { payout: 0, msg: "Nonsense Output. Tokens Wasted." };
}

function spin() {
    if (isSpinning || balance < costPerSpin) return;
    
    isSpinning = true;
    updateBalance(-costPerSpin);
    spinBtn.disabled = true;
    messageDisplay.textContent = "Generating Response...";
    messageDisplay.style.color = "#e2e8f0";

    const spinDuration = 2000;
    const intervalTime = 100;
    let elapsed = 0;

    reels.forEach(reel => reel.classList.add('spinning'));

    const spinInterval = setInterval(() => {
        reels.forEach(reel => {
            reel.textContent = getRandomSymbol();
        });
        elapsed += intervalTime;

        if (elapsed >= spinDuration) {
            clearInterval(spinInterval);
            finishSpin();
        }
    }, intervalTime);
}

function finishSpin() {
    reels.forEach(reel => reel.classList.remove('spinning'));
    
    // Final result
    const finalSymbols = [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()];
    reels.forEach((reel, index) => {
        reel.textContent = finalSymbols[index];
    });

    const result = evaluateSpin(finalSymbols);
    
    if (result.payout > 0) {
        messageDisplay.style.color = "#10b981"; // Green
    } else if (result.payout < 0) {
        messageDisplay.style.color = "#ef4444"; // Red
    } else {
        messageDisplay.style.color = "#94a3b8"; // Gray
    }

    messageDisplay.textContent = result.msg;
    updateBalance(result.payout);
    
    isSpinning = false;
    if (balance >= costPerSpin) {
        spinBtn.disabled = false;
    }
}

spinBtn.addEventListener('click', spin);