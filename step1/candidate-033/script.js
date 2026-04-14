const symbols = ['🧠', '🤖', '⚡️', '💸', '📉', '🗑️'];
const spinCost = 10;
let balance = 1000;
let isSpinning = false;

const balanceEl = document.getElementById('balance');
const lastWinEl = document.getElementById('last-win');
const messageEl = document.getElementById('message');
const spinBtn = document.getElementById('spin-btn');
const slots = [
    document.getElementById('slot1'),
    document.getElementById('slot2'),
    document.getElementById('slot3')
];

// Audio effects using Web Audio API
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playTone(freq, type, duration, vol=0.1) {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    
    gain.gain.setValueAtTime(vol, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
}

function playSpinSound() {
    let i = 0;
    const interval = setInterval(() => {
        if (!isSpinning) {
            clearInterval(interval);
            return;
        }
        playTone(300 + Math.random() * 200, 'square', 0.1, 0.05);
    }, 100);
}

function playWinSound(amount) {
    playTone(600, 'sine', 0.2);
    setTimeout(() => playTone(800, 'sine', 0.3), 150);
    if (amount > 50) {
        setTimeout(() => playTone(1200, 'sine', 0.5), 300);
    }
}

function playLoseSound() {
    playTone(200, 'sawtooth', 0.3);
    setTimeout(() => playTone(150, 'sawtooth', 0.4), 200);
}

function updateStats() {
    balanceEl.textContent = balance;
    if (balance < spinCost) {
        spinBtn.disabled = true;
        messageEl.textContent = "Rate Limit Exceeded. Buy more tokens!";
        messageEl.className = "message lose-text";
    }
}

function getRandomSymbol() {
    return symbols[Math.floor(Math.random() * symbols.length)];
}

function calculateWin(results) {
    const counts = {};
    for (const sym of results) {
        counts[sym] = (counts[sym] || 0) + 1;
    }

    let maxCount = 0;
    let winningSymbol = null;
    for (const [sym, count] of Object.entries(counts)) {
        if (count > maxCount) {
            maxCount = count;
            winningSymbol = sym;
        }
    }

    if (maxCount === 3) {
        switch (winningSymbol) {
            case '🧠': return { amount: 500, msg: "AGI Achieved! Huge payout!" };
            case '🤖': return { amount: 200, msg: "Perfect Code Generated!" };
            case '⚡️': return { amount: 100, msg: "Lightning Fast Response!" };
            case '💸': return { amount: 50, msg: "Series A Secured!" };
            case '📉': return { amount: 10, msg: "Model Degradation..." };
            case '🗑️': return { amount: 0, msg: "Garbage In, Garbage Out." };
            default: return { amount: 50, msg: "Jackpot!" };
        }
    } else if (maxCount === 2) {
        return { amount: 5, msg: "Partial match. The prompt needs work." };
    }

    return { amount: 0, msg: "Hallucination. Try again." };
}

function spin() {
    if (isSpinning || balance < spinCost) return;

    isSpinning = true;
    balance -= spinCost;
    updateStats();
    
    spinBtn.disabled = true;
    messageEl.textContent = "Generating tokens...";
    messageEl.className = "message";
    lastWinEl.textContent = "0";

    playSpinSound();

    // Visual spinning effect
    const spinIntervals = slots.map((slot, i) => {
        slot.classList.add('spin-anim');
        return setInterval(() => {
            slot.textContent = getRandomSymbol();
        }, 100);
    });

    const results = [];

    // Stop slots one by one
    slots.forEach((slot, i) => {
        setTimeout(() => {
            clearInterval(spinIntervals[i]);
            slot.classList.remove('spin-anim');
            const finalSymbol = getRandomSymbol();
            slot.textContent = finalSymbol;
            results.push(finalSymbol);
            playTone(400 + (i * 100), 'triangle', 0.1);

            if (i === slots.length - 1) {
                finishSpin(results);
            }
        }, 1000 + (i * 500)); // Stop each reel half a second after the previous
    });
}

function finishSpin(results) {
    isSpinning = false;
    spinBtn.disabled = balance < spinCost;
    
    const win = calculateWin(results);
    
    if (win.amount > 0) {
        balance += win.amount;
        lastWinEl.textContent = win.amount;
        messageEl.textContent = win.msg + ` (+${win.amount} Tokens)`;
        messageEl.className = "message win-text";
        playWinSound(win.amount);
    } else {
        messageEl.textContent = win.msg;
        messageEl.className = "message lose-text";
        playLoseSound();
    }
    
    updateStats();
}

spinBtn.addEventListener('click', spin);
updateStats();