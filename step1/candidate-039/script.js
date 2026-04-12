const symbols = ['🤖', '🧠', '💰', '🛑', '🗑️', '⚡'];

const spinButton = document.getElementById('spin-button');
const balanceDisplay = document.getElementById('balance');
const messageArea = document.getElementById('message-area');
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

let balance = 1000;
const spinCost = 10;
let isSpinning = false;

function updateBalance(amount) {
    balance += amount;
    balanceDisplay.textContent = balance;
    if (balance < spinCost) {
        spinButton.disabled = true;
        spinButton.textContent = "INSUFFICIENT TOKENS";
        showMessage("402 Payment Required: Please buy more API credits.", 'loss');
    }
}

function showMessage(msg, type = '') {
    messageArea.textContent = msg;
    messageArea.className = 'message-area ' + type;
}

function getRandomSymbol() {
    return symbols[Math.floor(Math.random() * symbols.length)];
}

function spinReel(reelContainer, index) {
    return new Promise(resolve => {
        reelContainer.classList.add('spinning');
        
        // Stagger the stopping time of each reel
        const spinDuration = 1000 + (index * 500); 
        
        setTimeout(() => {
            reelContainer.classList.remove('spinning');
            const finalSymbol = getRandomSymbol();
            reels[index].textContent = finalSymbol;
            resolve(finalSymbol);
        }, spinDuration);
    });
}

function evaluateResult(results) {
    const [s1, s2, s3] = results;
    
    if (s1 === s2 && s2 === s3) {
        // Three of a kind
        switch (s1) {
            case '🤖':
                updateBalance(500);
                showMessage("AGI Achieved! (+500 Tokens)", 'win');
                break;
            case '🧠':
                updateBalance(200);
                showMessage("Galaxy Brain Moment! (+200 Tokens)", 'win');
                break;
            case '💰':
                updateBalance(100);
                showMessage("Series A Secured! (+100 Tokens)", 'win');
                break;
            case '🛑':
                updateBalance(-50);
                showMessage("Rate Limit Exceeded! (-50 Tokens penalty)", 'loss');
                break;
            case '🗑️':
                updateBalance(-100);
                showMessage("Total Hallucination! Output is Garbage. (-100 Tokens)", 'loss');
                break;
            case '⚡':
                updateBalance(50);
                showMessage("Compute Cluster Optimized! (+50 Tokens)", 'win');
                break;
        }
    } else if (s1 === s2 || s2 === s3 || s1 === s3) {
        // Two of a kind (Minor wins/losses)
        if (results.filter(s => s === '🗑️').length === 2) {
             updateBalance(-20);
             showMessage("Minor Hallucination Detected. (-20 Tokens)", 'loss');
        } else if (results.filter(s => s === '🛑').length === 2) {
             updateBalance(-10);
             showMessage("Approaching Rate Limit. (-10 Tokens)", 'loss');
        } else {
             updateBalance(5); // Small win
             showMessage("Partial Pattern Match! (+5 Tokens)", 'win');
        }
    } else {
        // No match
        showMessage("Output generated. Model seems confused. (0 Tokens won)", '');
    }
}

spinButton.addEventListener('click', async () => {
    if (isSpinning || balance < spinCost) return;
    
    isSpinning = true;
    spinButton.disabled = true;
    updateBalance(-spinCost);
    showMessage("Generating inference...", '');
    
    let intervals = [];
    reels.forEach((reel, i) => {
        intervals.push(setInterval(() => {
             reel.textContent = getRandomSymbol();
        }, 50));
    });

    try {
        const results = await Promise.all([
            spinReel(reelContainers[0], 0),
            spinReel(reelContainers[1], 1),
            spinReel(reelContainers[2], 2)
        ]);

        intervals.forEach(clearInterval);
        
        // Ensure the final symbols match what was resolved
        reels[0].textContent = results[0];
        reels[1].textContent = results[1];
        reels[2].textContent = results[2];

        evaluateResult(results);
    } finally {
        intervals.forEach(clearInterval); // Just in case
        isSpinning = false;
        if (balance >= spinCost) {
            spinButton.disabled = false;
        }
    }
});