const symbols = [
    { char: '🍓', name: 'Project Strawberry', value: 300, joke: 'AGI achieved internally!' },
    { char: '⚡', name: 'H100 GPU', value: 200, joke: 'Nvidia stock goes brrrr.' },
    { char: '💸', name: 'OpenAI Bill', value: 100, joke: 'Sam Altman thanks you for your contribution.' },
    { char: '🧠', name: 'Galaxy Brain', value: 50, joke: 'Parameters go up, intelligence goes down.' },
    { char: '🤖', name: 'Generic AI', value: 10, joke: 'As an AI language model, I cannot provide a jackpot.' },
    { char: '📉', name: 'Hallucination', value: -50, joke: 'I am confident 2+2=5.' },
    { char: '💩', name: 'Bad Output', value: -10, joke: 'Needs more RLHF.' }
];

let balance = 8192;
const INITIAL_BALANCE = 8192;
let currentBet = 100;
let streak = 0;
let multiplier = 1;

const balanceEl = document.getElementById('balance');
const betEl = document.getElementById('current-bet');
const reels = [
    document.getElementById('reel1'),
    document.getElementById('reel2'),
    document.getElementById('reel3')
];
const spinBtn = document.getElementById('spin-btn');
const decreaseBetBtn = document.getElementById('decrease-bet');
const increaseBetBtn = document.getElementById('increase-bet');
const resetBtn = document.getElementById('reset-btn');
const messageEl = document.getElementById('message');
const terminalEl = document.getElementById('terminal-log');
const streakEl = document.getElementById('streak');
const multiplierEl = document.getElementById('multiplier');
const machineEl = document.querySelector('.slot-machine');
const payoutsBtn = document.getElementById('payouts-btn');
const payoutsModal = document.getElementById('payouts-modal');
const closeBtn = document.querySelector('.close-btn');
const payoutsList = document.getElementById('payouts-list');

// Populate Payouts Modal
symbols.forEach(sym => {
    const div = document.createElement('div');
    div.className = 'payout-item';
    div.innerHTML = `<span>${sym.char} ${sym.name}</span> <span>${sym.value > 0 ? '+' : ''}${sym.value}x</span>`;
    payoutsList.appendChild(div);
});

payoutsBtn.addEventListener('click', () => {
    initAudio();
    playCoinSound();
    payoutsModal.classList.remove('hidden');
});
closeBtn.addEventListener('click', () => payoutsModal.classList.add('hidden'));

// --- Audio Synth System ---
let audioCtx;
function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

function playTone(freq, type, duration, vol = 0.1) {
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gainNode.gain.setValueAtTime(vol, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
}

function playSpinSound() {
    let i = 0;
    const interval = setInterval(() => {
        playTone(300 + Math.random() * 200, 'square', 0.05, 0.05);
        i++;
        if (i > 15) clearInterval(interval);
    }, 100);
}

function playWinSound(level) {
    if (level === 'small') {
        playTone(400, 'sine', 0.1);
        setTimeout(() => playTone(600, 'sine', 0.2), 100);
    } else if (level === 'big') {
        playTone(500, 'triangle', 0.2);
        setTimeout(() => playTone(700, 'triangle', 0.2), 200);
        setTimeout(() => playTone(1000, 'triangle', 0.4), 400);
        setTimeout(() => playTone(1200, 'triangle', 0.6), 600);
    }
}

function playLoseSound() {
    playTone(200, 'sawtooth', 0.3);
    setTimeout(() => playTone(150, 'sawtooth', 0.4), 300);
}

function playCoinSound() {
    playTone(900, 'sine', 0.1, 0.05);
}

// --- Logic ---

function logTerminal(message) {
    const time = new Date().toLocaleTimeString();
    terminalEl.innerHTML += `> [${time}] ${message}<br>`;
    terminalEl.scrollTop = terminalEl.scrollHeight;
}

function updateBet(amount) {
    initAudio();
    playCoinSound();
    currentBet += amount;
    if (currentBet < 10) currentBet = 10;
    if (currentBet > 1000) currentBet = 1000;
    if (currentBet > balance && balance >= 10) currentBet = balance; // can't bet more than balance, unless out
    betEl.textContent = currentBet;
    checkBalance();
}

function updateBalance(amount) {
    balance += amount;
    balanceEl.textContent = balance;
    checkBalance();
}

function checkBalance() {
    if (balance < currentBet) {
        if (balance >= 10) {
            // Adjust bet down to remaining balance if possible
            currentBet = balance;
            betEl.textContent = currentBet;
            spinBtn.disabled = false;
            spinBtn.textContent = `Generate Response (Cost: ${currentBet})`;
        } else {
            spinBtn.disabled = true;
            spinBtn.textContent = 'Out of Compute';
            resetBtn.classList.remove('hidden');
        }
    } else {
        spinBtn.disabled = false;
        spinBtn.textContent = `Generate Response (Cost: ${currentBet})`;
        resetBtn.classList.add('hidden');
    }
}

decreaseBetBtn.addEventListener('click', () => updateBet(-10));
increaseBetBtn.addEventListener('click', () => updateBet(10));

resetBtn.addEventListener('click', () => {
    initAudio();
    playWinSound('big');
    balance = INITIAL_BALANCE;
    currentBet = 100;
    betEl.textContent = currentBet;
    streak = 0;
    multiplier = 1;
    updateStreakDisplay();
    updateBalance(0);
    logTerminal("INFO: Series A funding secured. Context window restored.");
    messageEl.textContent = "VCs gave you more compute! Time to burn it.";
    machineEl.classList.remove('flash-win', 'super-flash-win');
});

function getRandomSymbol() {
    return symbols[Math.floor(Math.random() * symbols.length)];
}

function updateStreakDisplay() {
    streakEl.textContent = streak;
    if (streak > 1) {
        multiplierEl.textContent = `x${multiplier}`;
        multiplierEl.classList.remove('hidden');
        multiplierEl.style.animation = 'none';
        setTimeout(() => multiplierEl.style.animation = 'pulse 0.5s', 10);
    } else {
        multiplierEl.classList.add('hidden');
    }
}

function spin() {
    initAudio();
    if (balance < currentBet) return;
    
    updateBalance(-currentBet);
    logTerminal(`Prompting model... (Cost: ${currentBet} tokens)`);
    messageEl.textContent = 'Generating response...';
    spinBtn.disabled = true;
    decreaseBetBtn.disabled = true;
    increaseBetBtn.disabled = true;
    payoutsBtn.disabled = true;

    machineEl.classList.remove('flash-win', 'super-flash-win');
    playSpinSound();

    // Start spinning animation
    reels.forEach(reel => reel.classList.add('spinning'));

    let spinTimes = [1000, 1500, 2000];
    let results = [];

    reels.forEach((reel, index) => {
        setTimeout(() => {
            reel.classList.remove('spinning');
            const symbol = getRandomSymbol();
            reel.querySelector('.reel-inner').textContent = symbol.char;
            results[index] = symbol;

            if (index === reels.length - 1) {
                evaluateResult(results);
            }
        }, spinTimes[index]);
    });
}

function evaluateResult(results) {
    spinBtn.disabled = false;
    decreaseBetBtn.disabled = false;
    increaseBetBtn.disabled = false;
    payoutsBtn.disabled = false;
    
    const chars = results.map(r => r.char);
    const uniqueChars = [...new Set(chars)];
    
    let baseWin = 0;
    let isWin = false;
    let joke = '';
    
    if (uniqueChars.length === 1) {
        // 3 of a kind
        const symbol = results[0];
        baseWin = symbol.value * currentBet;
        joke = symbol.joke;
        isWin = symbol.value > 0;
        
        if (isWin) {
            streak++;
            multiplier = Math.min(5, streak); // Max 5x multiplier
            const finalWin = baseWin * multiplier;
            messageEl.innerHTML = `<strong>JACKPOT!</strong> ${joke}<br>Won ${finalWin} tokens! (Streak x${multiplier})`;
            logTerminal(`SUCCESS: Perfect alignment. Gained ${finalWin} tokens.`);
            playWinSound('big');
            machineEl.classList.add('super-flash-win');
            updateBalance(finalWin);
        } else {
            streak = 0;
            multiplier = 1;
            messageEl.innerHTML = `<strong>TOTAL FAILURE!</strong> ${joke}<br>Lost ${Math.abs(baseWin)} tokens!`;
            logTerminal(`CRITICAL: Model went rogue. Lost ${Math.abs(baseWin)} tokens.`);
            playLoseSound();
            updateBalance(baseWin); // baseWin is negative
        }
    } else if (uniqueChars.length === 2) {
        // 2 of a kind
        const charCount = {};
        chars.forEach(c => charCount[c] = (charCount[c] || 0) + 1);
        const winningChar = Object.keys(charCount).find(k => charCount[k] === 2);
        const symbol = symbols.find(s => s.char === winningChar);
        
        baseWin = symbol.value * (currentBet / 10); // scale down 2-of-a-kind, based on bet
        if (baseWin === 0 && symbol.value !== 0) {
            baseWin = symbol.value > 0 ? 1 : -1; // ensure minimum win/loss
        }
        joke = symbol.joke;
        isWin = symbol.value > 0;
        
        if (isWin) {
            streak++;
            multiplier = Math.min(5, streak);
            const finalWin = Math.floor(baseWin * multiplier);
            messageEl.innerHTML = `Decent Output. ${joke}<br>Recovered ${finalWin} tokens. (Streak x${multiplier})`;
            logTerminal(`INFO: Acceptable generation. Gained ${finalWin} tokens.`);
            playWinSound('small');
            machineEl.classList.add('flash-win');
            updateBalance(finalWin);
        } else {
            streak = 0;
            multiplier = 1;
            messageEl.innerHTML = `Minor Hallucination. ${joke}<br>Penalty: ${Math.abs(Math.floor(baseWin))} tokens.`;
            logTerminal(`WARNING: Factual inaccuracies. Lost ${Math.abs(Math.floor(baseWin))} tokens.`);
            playLoseSound();
            updateBalance(Math.floor(baseWin));
        }
    } else {
        // All different
        streak = 0;
        multiplier = 1;
        messageEl.textContent = 'Gibberish Output. Waste of compute. GPT-5 delayed again.';
        logTerminal(`ERROR: Output failed safety alignment. 0 tokens refunded.`);
        playLoseSound();
    }
    
    updateStreakDisplay();
    checkBalance();
}

spinBtn.addEventListener('click', spin);

// Initialize
checkBalance();