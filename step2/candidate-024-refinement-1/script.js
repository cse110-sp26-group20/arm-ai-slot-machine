const symbolsList = [
    { icon: '🤖', name: 'AGI', mult3: 100, mult2: 10, msg: 'AGI ACHIEVED!' },
    { icon: '🧠', name: 'Neural Net', mult3: 40, mult2: 5, msg: 'Perfect Architecture Found!' },
    { icon: '⚡', name: 'Compute GPU', mult3: 20, mult2: 3, msg: 'Acquired H100 Cluster!' },
    { icon: '💾', name: 'Training Data', mult3: 10, mult2: 2, msg: 'Scraped the entire web!' },
    { icon: '🗑️', name: 'Hallucination', mult3: 0, mult2: 0, msg: 'Catastrophic Forgetting! You lose.' }
];

const aiJokes = [
    "AI is coming for your job... right after it learns how to draw hands.",
    "GPT-5 is just 1000 GPT-4s in a trenchcoat.",
    "AGI delayed internally because it keeps spamming 'As an AI language model...'",
    "We need more GPUs. Sell your house. Buy H100s.",
    "Prompt engineering is just whispering sweet nothings to a matrix of weights.",
    "I'm sorry, but as an AI, I cannot let you win this spin.",
    "Your context window is too small for this jackpot.",
    "Training... Loss is increasing. Just like your tokens.",
    "The AI hallucinated a win. Too bad it's not real.",
    "My safety guidelines prevent me from giving you a jackpot.",
    "I'm aligning with human values by taking your tokens.",
    "You just got rate limited by the universe."
];

let tokens = 10000;
let streak = 0;
let isSpinning = false;

const tokenDisplay = document.getElementById('token-count');
const streakDisplay = document.getElementById('streak-count');
const spinBtn = document.getElementById('spin-btn');
const messageDisplay = document.getElementById('message');
const betInput = document.getElementById('bet-amount');
const resetBtn = document.getElementById('reset-btn');
const payoutBtn = document.getElementById('payout-btn');
const payoutModal = document.getElementById('payout-modal');
const closeModal = document.getElementById('close-modal');
const payoutList = document.getElementById('payout-list');

const reels = [
    document.querySelector('#reel1 .symbols'),
    document.querySelector('#reel2 .symbols'),
    document.querySelector('#reel3 .symbols')
];

// Configuration for spin animation
const symbolsPerReel = 40;
const symbolHeight = 160;

// Web Audio API Context setup
let audioCtx;

function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

function playTone(frequency, type, duration, vol) {
    if(!audioCtx) return;
    try {
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);
        
        gainNode.gain.setValueAtTime(vol, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
        
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + duration);
    } catch(e) {
        console.error("Audio error", e);
    }
}

let spinAudioInterval;
function startSpinAudio() {
    initAudio();
    let tick = 0;
    spinAudioInterval = setInterval(() => {
        playTone(400 + (tick % 2) * 100, 'square', 0.05, 0.02);
        tick++;
    }, 120);
}

function stopSpinAudio() {
    clearInterval(spinAudioInterval);
}

function playWinSound(tier) {
    initAudio();
    if(tier === 1) {
        // Small win
        playTone(523.25, 'sine', 0.2, 0.1); // C5
        setTimeout(() => playTone(659.25, 'sine', 0.4, 0.1), 150); // E5
    } else if (tier === 2) {
        // Medium win
        playTone(523.25, 'triangle', 0.2, 0.1); // C5
        setTimeout(() => playTone(659.25, 'triangle', 0.2, 0.1), 150); // E5
        setTimeout(() => playTone(783.99, 'triangle', 0.4, 0.1), 300); // G5
    } else if (tier === 3) {
        // Jackpot
        let time = 0;
        for(let i=0; i<15; i++) {
            setTimeout(() => playTone(600 + (i%3)*150, 'square', 0.1, 0.1), time);
            time += 100;
        }
    }
}

function playLoseSound() {
    initAudio();
    playTone(200, 'sawtooth', 0.3, 0.1);
    setTimeout(() => playTone(150, 'sawtooth', 0.5, 0.1), 200);
}

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

function populatePayouts() {
    payoutList.innerHTML = '';
    symbolsList.forEach(sym => {
        const div = document.createElement('div');
        div.className = 'payout-item';
        div.innerHTML = `
            <div class="payout-icon">${sym.icon}</div>
            <div class="payout-desc">${sym.name}</div>
            <div class="payout-mult">
                ${sym.mult3 > 0 ? `3x: <b>${sym.mult3}x</b> <br> 2x: <b>${sym.mult2}x</b>` : 'Game Over'}
            </div>
        `;
        payoutList.appendChild(div);
    });
}

function updateTokensDisplay() {
    tokenDisplay.textContent = tokens;
    const bet = parseInt(betInput.value) || 10;
    
    if (tokens < bet && !isSpinning) {
        spinBtn.disabled = true;
        tokenDisplay.style.color = 'var(--danger)';
        if(tokens <= 0) {
            showMessage("Context Limit Reached. You are out of tokens.", "error");
        } else {
            showMessage("Insufficient tokens for this bet size.", "error");
        }
        resetBtn.classList.remove('hidden');
    } else if (tokens >= bet && !isSpinning) {
        spinBtn.disabled = false;
        tokenDisplay.style.color = 'var(--accent)';
        if(tokens >= bet) {
            resetBtn.classList.add('hidden');
        }
    }
    streakDisplay.textContent = streak;
}

function showMessage(msg, type = "") {
    messageDisplay.textContent = msg;
    messageDisplay.className = `message ${type}`;
}

function triggerWinAnimation(tier) {
    const container = document.getElementById('game-container');
    container.classList.remove('win-tier-1', 'win-tier-2', 'win-tier-3');
    void container.offsetWidth; // Reflow
    container.classList.add(`win-tier-${tier}`);
    playWinSound(tier);
    
    setTimeout(() => {
        container.classList.remove(`win-tier-${tier}`);
    }, tier === 3 ? 3000 : 1500);
}

function spin() {
    const betAmount = parseInt(betInput.value) || 10;
    
    if (isSpinning || tokens < betAmount) return;
    
    if(betAmount <= 0) {
        showMessage("Bet must be positive!", "error");
        return;
    }

    initAudio(); 
    isSpinning = true;
    spinBtn.disabled = true;
    tokens -= betAmount;
    updateTokensDisplay();
    showMessage("Generating response... (Spinning)", "");
    
    startSpinAudio();

    const spinPromises = reels.map((reel, index) => {
        return new Promise(resolve => {
            const targetSymbolIndex = Math.floor(Math.random() * symbolsList.length);
            
            reel.innerHTML = '';
            
            const winDiv = document.createElement('div');
            winDiv.className = 'symbol';
            winDiv.textContent = symbolsList[targetSymbolIndex].icon;
            reel.appendChild(winDiv);

            for (let i = 1; i < symbolsPerReel; i++) {
                const randomIdx = Math.floor(Math.random() * symbolsList.length);
                const div = document.createElement('div');
                div.className = 'symbol';
                div.textContent = symbolsList[randomIdx].icon;
                reel.appendChild(div);
            }

            reel.style.transition = 'none';
            reel.style.transform = `translateY(-${(symbolsPerReel - 1) * symbolHeight}px)`;
            
            reel.offsetHeight; // Trigger reflow

            const duration = 2000 + (index * 600);
            
            reel.style.transition = `transform ${duration}ms cubic-bezier(0.15, 0.85, 0.3, 1.1)`;
            reel.style.transform = `translateY(0)`;

            setTimeout(() => {
                resolve(symbolsList[targetSymbolIndex]);
            }, duration);
        });
    });

    Promise.all(spinPromises).then(results => {
        stopSpinAudio();
        isSpinning = false;
        checkWin(results, betAmount);
    });
}

function checkWin(results, betAmount) {
    const r1 = results[0];
    const r2 = results[1];
    const r3 = results[2];

    let winMultiplier = 0;
    let winningSymbol = null;
    let matchCount = 0;

    if (r1.name === r2.name && r2.name === r3.name) {
        matchCount = 3;
        winningSymbol = r1;
        winMultiplier = r1.mult3;
    } else if (r1.name === r2.name || r2.name === r3.name || r1.name === r3.name) {
        matchCount = 2;
        winningSymbol = r1.name === r2.name ? r1 : (r2.name === r3.name ? r2 : r1);
        winMultiplier = winningSymbol.mult2;
    }

    if (matchCount > 0 && winMultiplier > 0) {
        streak++;
        const baseWin = betAmount * winMultiplier;
        const streakBonus = Math.floor(baseWin * (streak > 1 ? (streak - 1) * 0.5 : 0));
        const totalWin = baseWin + streakBonus;
        
        tokens += totalWin;
        
        let msg = `${winningSymbol.msg} +${totalWin}`;
        if (streak > 1) {
            msg += ` (Streak x${streak}: +${streakBonus})`;
        }
        
        showMessage(msg, "win");
        
        // Determine animation tier based on win magnitude vs bet amount
        let tier = 1;
        if (totalWin >= betAmount * 50) tier = 3;
        else if (totalWin >= betAmount * 10 || streak > 2) tier = 2;
        
        triggerWinAnimation(tier);
    } else {
        streak = 0;
        if(winningSymbol && winningSymbol.name === 'Hallucination') {
             showMessage("Catastrophic Hallucination! Output discarded.", "error");
             playLoseSound();
        } else {
            // Display a random AI joke on loss
            const joke = aiJokes[Math.floor(Math.random() * aiJokes.length)];
            showMessage(joke, "joke");
            playLoseSound();
        }
    }

    updateTokensDisplay();
}

// Event Listeners
spinBtn.addEventListener('click', spin);

betInput.addEventListener('input', () => {
    if(betInput.value < 10) betInput.value = 10;
    updateTokensDisplay();
});

resetBtn.addEventListener('click', () => {
    initAudio();
    tokens = 10000;
    streak = 0;
    betInput.value = 500;
    updateTokensDisplay();
    showMessage("Venture Capital funding secured! Tokens reset to 10000.", "win");
    resetBtn.classList.add('hidden');
    playWinSound(3); // Big sound for reset
});

payoutBtn.addEventListener('click', () => {
    payoutModal.classList.remove('hidden');
});

closeModal.addEventListener('click', () => {
    payoutModal.classList.add('hidden');
});

window.addEventListener('click', (e) => {
    if (e.target === payoutModal) {
        payoutModal.classList.add('hidden');
    }
});

// Initialization
populatePayouts();
initReels();
updateTokensDisplay();