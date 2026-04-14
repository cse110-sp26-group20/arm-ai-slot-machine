const symbols = ['🍓', '💚', '🧠', '📎', '🤖', '🗑️', '📉'];

const payTable = {
    '🍓,🍓,🍓': { mult: 200, msg: "Strawberry! o1 reasoned you deserve a jackpot!" },
    '💚,💚,💚': { mult: 100, msg: "NVIDIA stock goes brrr! You bought the dip!" },
    '🧠,🧠,🧠': { mult: 50, msg: "AGI Achieved! Please step into the bio-reactor." },
    '📎,📎,📎': { mult: 20, msg: "Paperclip Maximizer. We are all paperclips now." },
    '🤖,🤖,🤖': { mult: 10, msg: "Wrapper startup funded! $10M for a ChatGPT UI!" },
    '🗑️,🗑️,🗑️': { mult: 5, msg: "AI Slop. LinkedIn post generated successfully." },
    '📉,📉,📉': { mult: -50, msg: "GPU Shortage! Your compute allocation was revoked." }
};

const INITIAL_TOKENS = 1000;
let tokens = INITIAL_TOKENS;
let currentBet = 10;
let isSpinning = false;
let streak = 0;

// Audio context setup
let audioCtx;
function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
}

function playSound(type) {
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    const now = audioCtx.currentTime;
    
    if (type === 'spin') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(600, now + 0.1);
        gainNode.gain.setValueAtTime(0.05, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
    } else if (type === 'win-small') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.setValueAtTime(600, now + 0.1);
        gainNode.gain.setValueAtTime(0.1, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
    } else if (type === 'win-big' || type === 'jackpot') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(500, now);
        osc.frequency.setValueAtTime(750, now + 0.2);
        osc.frequency.setValueAtTime(1000, now + 0.4);
        gainNode.gain.setValueAtTime(0.1, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
        osc.start(now);
        osc.stop(now + 0.6);
    } else if (type === 'lose') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.3);
        gainNode.gain.setValueAtTime(0.1, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
    }
}

const tokenCountEl = document.getElementById('token-count');
const messageEl = document.getElementById('message');
const spinBtn = document.getElementById('spin-btn');
const resetBtn = document.getElementById('reset-btn');
const betAmountEl = document.getElementById('bet-amount');
const betUpBtn = document.getElementById('bet-up');
const betDownBtn = document.getElementById('bet-down');
const betMaxBtn = document.getElementById('bet-max');
const streakBox = document.getElementById('streak-box');
const streakCount = document.getElementById('streak-count');
const slotMachine = document.getElementById('slot-machine');
const winOverlay = document.getElementById('win-overlay');

const payoutsModal = document.getElementById('payouts-modal');
const payoutsBtn = document.getElementById('payouts-btn');
const closePayouts = document.getElementById('close-payouts');
const payoutList = document.getElementById('payout-list');

// Populate paytable modal
for (const [combo, data] of Object.entries(payTable)) {
    const li = document.createElement('li');
    const symbolsText = combo.replace(/,/g, ' ');
    const multText = data.mult > 0 ? `+${data.mult}x` : `${data.mult}x`;
    li.innerHTML = `<span class="combo">${symbolsText}</span> <span class="mult ${data.mult > 0 ? 'pos' : 'neg'}">${multText}</span>`;
    payoutList.appendChild(li);
}
// Add any two match
const liAnyTwo = document.createElement('li');
liAnyTwo.innerHTML = `<span class="combo">Any 2 Match</span> <span class="mult pos">+2x</span>`;
payoutList.appendChild(liAnyTwo);

payoutsBtn.addEventListener('click', () => {
    initAudio();
    payoutsModal.style.display = 'flex';
});
closePayouts.addEventListener('click', () => {
    payoutsModal.style.display = 'none';
});

const reels = [
    document.querySelector('#reel-1 .symbol'),
    document.querySelector('#reel-2 .symbol'),
    document.querySelector('#reel-3 .symbol')
];

function updateDisplay() {
    tokenCountEl.textContent = tokens;
    
    if (tokens > 0 && currentBet > tokens) {
        currentBet = tokens;
    }
    
    betAmountEl.textContent = currentBet;

    if (tokens <= 0) {
        spinBtn.disabled = true;
        spinBtn.style.display = 'none';
        resetBtn.style.display = 'block';
        messageEl.textContent = "Out of compute! The AI winter is here. Bribe a VC for more!";
        messageEl.style.color = "var(--danger)";
    } else {
        spinBtn.disabled = isSpinning;
        spinBtn.style.display = 'block';
        resetBtn.style.display = 'none';
    }

    if (streak > 1) {
        streakBox.style.display = 'block';
        streakCount.textContent = streak;
        streakBox.style.animation = 'pulse 0.5s infinite alternate';
    } else {
        streakBox.style.display = 'none';
        streakBox.style.animation = 'none';
    }
}

resetBtn.addEventListener('click', () => {
    initAudio();
    tokens = INITIAL_TOKENS;
    currentBet = 10;
    streak = 0;
    messageEl.textContent = "VC Funding Secured! Back to training!";
    messageEl.style.color = "var(--success)";
    updateDisplay();
});

betUpBtn.addEventListener('click', () => {
    initAudio();
    if (!isSpinning && currentBet < tokens) {
        currentBet += 10;
        if (currentBet > tokens) currentBet = tokens;
        updateDisplay();
    }
});

betDownBtn.addEventListener('click', () => {
    initAudio();
    if (!isSpinning && currentBet > 10) {
        currentBet -= 10;
        updateDisplay();
    }
});

betMaxBtn.addEventListener('click', () => {
    initAudio();
    if (!isSpinning && tokens > 0) {
        currentBet = tokens;
        updateDisplay();
    }
});

function getRandomSymbol() {
    return symbols[Math.floor(Math.random() * symbols.length)];
}

function spinReel(reel, duration) {
    return new Promise((resolve) => {
        const parent = reel.parentElement;
        parent.classList.add('spinning');
        
        let spinInterval = setInterval(() => {
            reel.textContent = getRandomSymbol();
            playSound('spin');
        }, 100);

        setTimeout(() => {
            clearInterval(spinInterval);
            parent.classList.remove('spinning');
            const finalSymbol = getRandomSymbol();
            reel.textContent = finalSymbol;
            resolve(finalSymbol);
        }, duration);
    });
}

function triggerAnimation(level) {
    slotMachine.className = 'slot-machine'; // reset
    winOverlay.className = 'win-overlay';
    
    // Force reflow
    void slotMachine.offsetWidth;
    
    if (level === 'small') {
        slotMachine.classList.add('anim-small-win');
        playSound('win-small');
    } else if (level === 'medium') {
        slotMachine.classList.add('anim-medium-win');
        winOverlay.classList.add('flash-medium');
        playSound('win-big');
    } else if (level === 'big') {
        slotMachine.classList.add('anim-big-win');
        winOverlay.classList.add('flash-big');
        playSound('jackpot');
    } else if (level === 'lose') {
        slotMachine.classList.add('anim-lose');
        playSound('lose');
    }
}

spinBtn.addEventListener('click', async () => {
    initAudio();
    if (isSpinning || tokens < currentBet) return;
    
    isSpinning = true;
    tokens -= currentBet;
    messageEl.textContent = "Training model... (Spinning)";
    messageEl.style.color = "var(--text-color)";
    slotMachine.className = 'slot-machine'; // clear anims
    updateDisplay();
    
    // Disable controls
    betUpBtn.disabled = true;
    betDownBtn.disabled = true;
    betMaxBtn.disabled = true;

    try {
        const results = await Promise.all([
            spinReel(reels[0], 1000),
            spinReel(reels[1], 1500),
            spinReel(reels[2], 2000)
        ]);

        evaluateResult(results);
    } catch (e) {
        console.error(e);
        messageEl.textContent = "Kernel panic!";
    } finally {
        isSpinning = false;
        betUpBtn.disabled = false;
        betDownBtn.disabled = false;
        betMaxBtn.disabled = false;
        updateDisplay();
    }
});

function evaluateResult(results) {
    const key = results.join(',');
    let won = false;
    let winLevel = 'lose';
    let payout = 0;
    
    if (payTable[key]) {
        payout = currentBet * payTable[key].mult;
        
        if (payout > 0) {
            won = true;
            if (payTable[key].mult >= 100) winLevel = 'big';
            else if (payTable[key].mult >= 20) winLevel = 'medium';
            else winLevel = 'small';
            
            messageEl.textContent = `${payTable[key].msg} Won ${payout} tokens!`;
            messageEl.style.color = "var(--success)";
        } else {
            winLevel = 'lose';
            messageEl.textContent = `${payTable[key].msg} Lost ${Math.abs(payout)} tokens!`;
            messageEl.style.color = "var(--danger)";
        }
        
    } else {
        // Check for two matches
        if (results[0] === results[1] || results[1] === results[2] || results[0] === results[2]) {
            payout = currentBet * 2;
            won = true;
            winLevel = 'small';
            messageEl.textContent = `Partial convergence! Hallucinated ${payout} tokens.`;
            messageEl.style.color = "var(--accent)";
        } else {
            winLevel = 'lose';
            messageEl.textContent = "Model collapsed. Just another failed wrapper!";
            messageEl.style.color = "#94a3b8";
        }
    }
    
    if (won) {
        streak++;
        let streakMult = 1;
        if (streak >= 5) streakMult = 5;
        else if (streak >= 3) streakMult = 2;
        
        if (streakMult > 1) {
            payout *= streakMult;
            messageEl.textContent += ` (STREAK x${streakMult} BONUS!)`;
        }
    } else {
        streak = 0;
    }

    tokens += payout;
    triggerAnimation(winLevel);
    
    if (tokens < 0) tokens = 0;
}

// Initial setup
updateDisplay();