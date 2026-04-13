const symbols = [
    { emoji: '🤖', name: 'AI Model', value: 20 },
    { emoji: '🧠', name: 'Neural Net', value: 30 },
    { emoji: '💾', name: 'Training Data', value: 15 },
    { emoji: '🔋', name: 'Compute Power', value: 25 },
    { emoji: '💸', name: 'Investor Cash', value: 50 },
    { emoji: '📉', name: 'Loss Gradient', value: 5 },
    { emoji: '💩', name: 'Hallucination', value: 0 }
];

const COST_PER_SPIN = 10;
let tokens = 1000;
let isSpinning = false;

const tokenCountEl = document.getElementById('token-count');
const spinBtn = document.getElementById('spin-btn');
const messageEl = document.getElementById('message');
const reels = [
    document.getElementById('reel1'),
    document.getElementById('reel2'),
    document.getElementById('reel3')
];

function updateTokens(amount) {
    tokens += amount;
    tokenCountEl.textContent = tokens;
}

function getRandomSymbol() {
    return symbols[Math.floor(Math.random() * symbols.length)];
}

function spinReels() {
    if (isSpinning) return;
    
    if (tokens < COST_PER_SPIN) {
        messageEl.textContent = "Error: 429 Too Many Requests. Out of tokens!";
        messageEl.style.color = "#ff4c4c";
        return;
    }

    isSpinning = true;
    spinBtn.disabled = true;
    updateTokens(-COST_PER_SPIN);
    messageEl.textContent = "Generating response... computing...";
    messageEl.style.color = "#aaa";

    let spinIntervals = [];
    
    reels.forEach((reel, index) => {
        reel.classList.add('spinning');
        
        // Make reels spin 
        let interval = setInterval(() => {
            reel.textContent = getRandomSymbol().emoji;
        }, 100);
        spinIntervals.push(interval);
    });

    // Stop reels one by one
    setTimeout(() => stopReel(0, spinIntervals), 1000);
    setTimeout(() => stopReel(1, spinIntervals), 1500);
    setTimeout(() => stopReel(2, spinIntervals), 2000);
}

function stopReel(index, intervals) {
    clearInterval(intervals[index]);
    reels[index].classList.remove('spinning');
    
    // Set final symbol
    const finalSymbol = getRandomSymbol();
    reels[index].textContent = finalSymbol.emoji;
    reels[index].dataset.symbol = finalSymbol.name;
    reels[index].dataset.value = finalSymbol.value;

    // If it's the last reel, evaluate results
    if (index === 2) {
        evaluateWin();
        isSpinning = false;
        spinBtn.disabled = false;
    }
}

function evaluateWin() {
    const r1 = reels[0].textContent;
    const r2 = reels[1].textContent;
    const r3 = reels[2].textContent;

    const v1 = parseInt(reels[0].dataset.value);

    messageEl.style.color = "#4ade80";

    if (r1 === r2 && r2 === r3) {
        if (r1 === '💩') {
            messageEl.textContent = "Massive Hallucination! The model lost its mind. -100 tokens penalty!";
            messageEl.style.color = "#ff4c4c";
            updateTokens(-100);
        } else {
            const winAmount = v1 * 10;
            messageEl.textContent = `Jackpot! Output perfectly aligns with human values! Won ${winAmount} tokens!`;
            updateTokens(winAmount);
        }
    } else if (r1 === r2 || r2 === r3 || r1 === r3) {
        // Find the matched symbol
        let matchedEmoji = r1 === r2 ? r1 : r3;
        let matchedSymbol = symbols.find(s => s.emoji === matchedEmoji);
        
        if (matchedEmoji === '💩') {
             messageEl.textContent = "Slight hallucination. Model went on a tangent. No win.";
             messageEl.style.color = "#ffaa00";
        } else {
             const winAmount = matchedSymbol.value * 2;
             messageEl.textContent = `Partial Match! Decent generation. Won ${winAmount} tokens.`;
             updateTokens(winAmount);
        }
    } else {
        messageEl.textContent = "Garbage output. Needs more RLHF. Try again.";
        messageEl.style.color = "#ffaa00";
    }
    
    if (tokens <= 0) {
        messageEl.textContent = "Account suspended for TOS violations (and you are broke). Please upgrade your API plan.";
        messageEl.style.color = "#ff4c4c";
        spinBtn.disabled = true;
    }
}

spinBtn.addEventListener('click', spinReels);