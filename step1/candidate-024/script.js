const symbolsList = [
    { icon: '🤖', name: 'AGI', winAmt: 50000, msg: 'AGI ACHIEVED!' },
    { icon: '🧠', name: 'Neural Net', winAmt: 10000, msg: 'Perfect Architecture Found!' },
    { icon: '⚡', name: 'Compute GPU', winAmt: 5000, msg: 'Acquired H100 Cluster!' },
    { icon: '💾', name: 'Training Data', winAmt: 2000, msg: 'Scraped the entire web!' },
    { icon: '🗑️', name: 'Hallucination', winAmt: -2000, msg: 'Catastrophic Forgetting!' }
];

let tokens = 10000;
const spinCost = 500;
let isSpinning = false;

const tokenDisplay = document.getElementById('token-count');
const spinBtn = document.getElementById('spin-btn');
const messageDisplay = document.getElementById('message');

const reels = [
    document.querySelector('#reel1 .symbols'),
    document.querySelector('#reel2 .symbols'),
    document.querySelector('#reel3 .symbols')
];

// Configuration for spin animation
const symbolsPerReel = 40;
const symbolHeight = 140;

function initReels() {
    reels.forEach(reel => {
        reel.innerHTML = '';
        for (let i = 0; i < symbolsPerReel; i++) {
            const randomIdx = Math.floor(Math.random() * symbolsList.length);
            const div = document.createElement('div');
            div.className = 'symbol';
            div.textContent = symbolsList[randomIdx].icon;
            reel.appendChild(div);
        }
        reel.style.transform = `translateY(-${(symbolsPerReel - 1) * symbolHeight}px)`;
    });
}

function updateTokens(amount) {
    tokens += amount;
    tokenDisplay.textContent = tokens;
    
    if (tokens < spinCost && !isSpinning) {
        spinBtn.disabled = true;
        if(tokens < 0) {
            tokenDisplay.style.color = 'var(--danger)';
            showMessage("Context Limit Reached. You are bankrupt in tokens.", "error");
        } else {
            showMessage("Insufficient tokens for next inference.", "error");
        }
    } else if (tokens >= spinCost && !isSpinning) {
        spinBtn.disabled = false;
        tokenDisplay.style.color = 'var(--accent)';
    }
}

function showMessage(msg, type = "") {
    messageDisplay.textContent = msg;
    messageDisplay.className = `message ${type}`;
}

function spin() {
    if (isSpinning || tokens < spinCost) return;

    isSpinning = true;
    spinBtn.disabled = true;
    updateTokens(-spinCost);
    showMessage("Generating response...", "");

    const spinPromises = reels.map((reel, index) => {
        return new Promise(resolve => {
            const targetSymbolIndex = Math.floor(Math.random() * symbolsList.length);
            
            reel.innerHTML = '';
            
            // The winning symbol goes at the top (index 0)
            const winDiv = document.createElement('div');
            winDiv.className = 'symbol';
            winDiv.textContent = symbolsList[targetSymbolIndex].icon;
            reel.appendChild(winDiv);

            // Fill the rest with random symbols
            for (let i = 1; i < symbolsPerReel; i++) {
                const randomIdx = Math.floor(Math.random() * symbolsList.length);
                const div = document.createElement('div');
                div.className = 'symbol';
                div.textContent = symbolsList[randomIdx].icon;
                reel.appendChild(div);
            }

            // Instantly jump to the bottom
            reel.style.transition = 'none';
            reel.style.transform = `translateY(-${(symbolsPerReel - 1) * symbolHeight}px)`;
            
            // Trigger reflow
            reel.offsetHeight;

            // Stop them sequentially
            const duration = 2000 + (index * 600);
            
            // Custom cubic bezier for that satisfying slot machine snap
            reel.style.transition = `transform ${duration}ms cubic-bezier(0.15, 0.85, 0.3, 1.1)`;
            reel.style.transform = `translateY(0)`;

            setTimeout(() => {
                resolve(symbolsList[targetSymbolIndex]);
            }, duration);
        });
    });

    Promise.all(spinPromises).then(results => {
        isSpinning = false;
        checkWin(results);
    });
}

function checkWin(results) {
    const r1 = results[0];
    const r2 = results[1];
    const r3 = results[2];

    if (r1.name === r2.name && r2.name === r3.name) {
        // 3 of a kind
        if (r1.name === 'Hallucination') {
            showMessage(`${r1.msg} Lost 2000 Tokens!`, "error");
            updateTokens(-2000);
        } else {
            showMessage(`${r1.msg} +${r1.winAmt} Tokens`, "win");
            updateTokens(r1.winAmt);
        }
    } else if (r1.name === r2.name || r2.name === r3.name || r1.name === r3.name) {
        // 2 of a kind
        let match = r1.name === r2.name ? r1 : (r2.name === r3.name ? r2 : r1);
        
        if (match.name === 'Hallucination') {
             showMessage("Minor hallucination detected. Lost 200 Tokens.", "warning");
             updateTokens(-200);
        } else {
             const winAmount = spinCost; // Get your money back
             showMessage(`Partial Alignment! Recovered ${winAmount} Tokens`, "win");
             updateTokens(winAmount);
        }
    } else {
        showMessage("Output discarded by safety filters.", "");
    }

    if (tokens >= spinCost) {
        spinBtn.disabled = false;
    }
}

spinBtn.addEventListener('click', spin);
initReels();