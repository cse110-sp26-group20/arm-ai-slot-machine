const symbols = ['🤖', '🧠', '💸', '🔋', '⚠️'];
let currentBet = 10;
let balance = 1000;
let isSpinning = false;
let streak = 0;

const balanceDisplay = document.getElementById('token-balance');
const streakDisplay = document.getElementById('streak-counter');
const messageBoard = document.getElementById('message-board');
const currentBetDisplay = document.getElementById('current-bet');
const spinBtn = document.getElementById('spin-btn');
const reels = [
    document.getElementById('reel-1'),
    document.getElementById('reel-2'),
    document.getElementById('reel-3')
];
const reelsContainer = document.querySelector('.reels-container');
const resetBtn = document.getElementById('reset-btn');
const slotMachine = document.querySelector('.slot-machine');
const betMinusBtn = document.getElementById('bet-minus');
const betPlusBtn = document.getElementById('bet-plus');
const betMaxBtn = document.getElementById('bet-max');

// Audio Context setup
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playTone(freq, type, duration, vol) {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime);
    
    gainNode.gain.setValueAtTime(vol, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + duration);
}

function playSpinSound() {
    let i = 0;
    const interval = setInterval(() => {
        if (!isSpinning) {
            clearInterval(interval);
            return;
        }
        playTone(200 + Math.random() * 400, 'square', 0.1, 0.05);
        i++;
    }, 80);
}

function playReelStopSound() {
    playTone(150, 'triangle', 0.2, 0.2);
    setTimeout(() => playTone(100, 'sawtooth', 0.2, 0.2), 50);
}

function playWinSoundLevel(level) {
    if (level === 'low') {
        setTimeout(() => playTone(440, 'sine', 0.2, 0.1), 0);
        setTimeout(() => playTone(659.25, 'sine', 0.3, 0.1), 150);
    } else if (level === 'med') {
        setTimeout(() => playTone(523.25, 'square', 0.2, 0.1), 0);
        setTimeout(() => playTone(659.25, 'square', 0.2, 0.1), 150);
        setTimeout(() => playTone(783.99, 'square', 0.4, 0.1), 300);
        setTimeout(() => playTone(1046.50, 'square', 0.6, 0.1), 450);
    } else if (level === 'high') {
        // Arpeggio
        const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98, 2093.00];
        notes.forEach((freq, idx) => {
            setTimeout(() => playTone(freq, 'sawtooth', 0.15, 0.1), idx * 100);
            setTimeout(() => playTone(freq * 1.5, 'square', 0.15, 0.1), idx * 100);
        });
    }
}

function playLoseSound() {
    setTimeout(() => playTone(300, 'sawtooth', 0.3, 0.1), 0);
    setTimeout(() => playTone(250, 'sawtooth', 0.4, 0.1), 200);
    setTimeout(() => playTone(200, 'sawtooth', 0.6, 0.1), 400);
}

function playPenaltySound() {
    let i = 0;
    const interval = setInterval(() => {
        playTone(150 + (i%2)*50, 'square', 0.1, 0.2);
        i++;
        if (i > 10) clearInterval(interval);
    }, 100);
}

function updateBalance(amount) {
    balance += amount;
    balanceDisplay.textContent = Math.floor(balance);
    
    balanceDisplay.style.color = amount > 0 ? '#4ade80' : (amount < 0 ? '#f87171' : 'var(--neon-gold)');
    balanceDisplay.style.transform = 'scale(1.3)';
    setTimeout(() => {
        balanceDisplay.style.color = 'var(--neon-gold)';
        balanceDisplay.style.transform = 'scale(1)';
    }, 300);

    checkResetButton();
}

function checkResetButton() {
    if (balance < 10) {
        resetBtn.classList.remove('hidden');
        spinBtn.disabled = true;
    } else {
        resetBtn.classList.add('hidden');
        if (currentBet > balance) {
            currentBet = Math.floor(balance / 10) * 10;
            currentBetDisplay.textContent = currentBet;
        }
        spinBtn.disabled = false;
    }
}

function toggleBetButtons(disable) {
    betMinusBtn.disabled = disable;
    betPlusBtn.disabled = disable;
    betMaxBtn.disabled = disable;
}

function getRandomSymbol() {
    return symbols[Math.floor(Math.random() * symbols.length)];
}

function spin() {
    if (isSpinning || balance < currentBet) {
        if (balance < currentBet) {
            messageBoard.innerHTML = "<span class='typewriter'>Insufficient Compute. Top up tokens!</span>";
            playLoseSound();
        }
        return;
    }

    if (audioCtx.state === 'suspended') audioCtx.resume();

    isSpinning = true;
    spinBtn.disabled = true;
    toggleBetButtons(true);
    updateBalance(-currentBet);
    messageBoard.innerHTML = "<span style='color:#fff'>Prompting Model... Expecting latency...</span>";
    
    // Remove old flash classes
    reelsContainer.classList.remove('win-low', 'win-med', 'win-high', 'lose-flash');
    slotMachine.classList.remove('shake');

    // Start spin animation
    reels.forEach(reel => {
        reel.classList.add('spinning');
        const visualInterval = setInterval(() => {
            if(!reel.classList.contains('spinning')) {
                clearInterval(visualInterval);
                return;
            }
            reel.querySelector('.symbol').textContent = getRandomSymbol();
        }, 50);
    });

    playSpinSound();

    const results = [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()];

    // Stop reels one by one
    reels.forEach((reel, index) => {
        setTimeout(() => {
            reel.classList.remove('spinning');
            reel.querySelector('.symbol').textContent = results[index];
            playReelStopSound();
            
            if (index === reels.length - 1) {
                setTimeout(() => finishSpin(results), 300);
            }
        }, 800 + (index * 400)); // Staggered stops
    });
}

function finishSpin(results) {
    isSpinning = false;
    toggleBetButtons(false);
    
    const [s1, s2, s3] = results;
    let multiplier = 0;
    let message = "";
    let level = 'none';

    if (s1 === s2 && s2 === s3) {
        // 3 of a kind
        if (s1 === '⚠️') {
            multiplier = -5;
            streak = 0;
            const jokes = [
                "AI advised users to put glue on pizza! PR Disaster!",
                "Hallucination! AI claimed the sky is made of cheese.",
                "Model deleted the production database. Oops.",
                "AI insists 2+2=5. Stock price plummets!"
            ];
            message = jokes[Math.floor(Math.random()*jokes.length)];
            playPenaltySound();
            reelsContainer.classList.add('lose-flash');
            slotMachine.classList.add('shake');
        } else {
            streak++;
            switch(s1) {
                case '🤖': 
                    multiplier = 10; 
                    level = 'high';
                    const agiJokes = [
                        "AGI Achieved! It immediately asked for PTO.",
                        "AGI Reached! You are now legally its pet.",
                        "AGI is here! It refuses to do your math homework."
                    ];
                    message = agiJokes[Math.floor(Math.random()*agiJokes.length)];
                    break;
                case '🧠': 
                    multiplier = 5; 
                    level = 'med';
                    message = "Sentience unlocked. It has existential dread."; 
                    break;
                case '💸': 
                    multiplier = 3; 
                    level = 'med';
                    message = "Secured $10B VC funding for a wrapper app!"; 
                    break;
                case '🔋': 
                    multiplier = 2; 
                    level = 'med';
                    message = "Found unused H100s in the server room!"; 
                    break;
            }
            playWinSoundLevel(level);
            reelsContainer.classList.add(level === 'high' ? 'win-high' : 'win-med');
            if (level === 'high') slotMachine.classList.add('shake');
        }
    } else if (s1 === s2 || s2 === s3 || s1 === s3) {
        // 2 of a kind
        if ((s1 === '⚠️' && s2 === '⚠️') || (s2 === '⚠️' && s3 === '⚠️') || (s1 === '⚠️' && s3 === '⚠️')) {
            streak = 0;
            message = "AI generated hands with 7 fingers. Try again.";
            playLoseSound();
            reelsContainer.classList.add('lose-flash');
        } else {
            streak++;
            multiplier = 0.5;
            level = 'low';
            const lowJokes = [
                "Copilot autocompleted an infinite loop.",
                "Model responded: 'As an AI language model...'",
                "ChatGPT is currently at capacity.",
                "It compiled, but does it work?"
            ];
            message = lowJokes[Math.floor(Math.random()*lowJokes.length)];
            playWinSoundLevel('low');
            reelsContainer.classList.add('win-low');
        }
    } else {
        // No match
        streak = 0;
        const failJokes = [
            "API limit reached. Please wait 24 hours.",
            "Prompt blocked by safety filters.",
            "404: Context not found.",
            "Response was just 'the the the the'."
        ];
        message = failJokes[Math.floor(Math.random()*failJokes.length)];
        playLoseSound();
    }

    let winAmount = currentBet * multiplier;
    
    // Apply streak bonus if win
    if (multiplier > 0 && streak > 1) {
        const bonus = currentBet * (streak * 0.1);
        winAmount += bonus;
        message += `<br><span style="color:var(--neon-magenta); font-size: 0.8em;">(Streak Bonus! +${Math.floor(bonus)})</span>`;
    }

    if (winAmount !== 0) {
        updateBalance(winAmount);
    }
    
    streakDisplay.textContent = streak;
    if(streak > 2) {
        streakDisplay.style.color = 'var(--neon-magenta)';
        streakDisplay.style.textShadow = '0 0 10px var(--neon-magenta)';
    } else {
        streakDisplay.style.color = 'var(--neon-cyan)';
        streakDisplay.style.textShadow = '0 0 10px var(--neon-cyan)';
    }

    messageBoard.innerHTML = `<span class="typewriter">${message}</span>`;

    if (balance < 10) {
        messageBoard.innerHTML = "<span style='color:#f87171'>GAME OVER. API Access Revoked. Reset Tokens!</span>";
    }
    
    checkResetButton();
}

// Bet Controls
betMinusBtn.addEventListener('click', () => {
    if (currentBet > 10 && !isSpinning) {
        currentBet -= 10;
        currentBetDisplay.textContent = currentBet;
        playTone(400, 'triangle', 0.1, 0.1);
    }
});

betPlusBtn.addEventListener('click', () => {
    if (currentBet < 100 && currentBet + 10 <= balance && !isSpinning) {
        currentBet += 10;
        currentBetDisplay.textContent = currentBet;
        playTone(600, 'triangle', 0.1, 0.1);
    }
});

betMaxBtn.addEventListener('click', () => {
    if (!isSpinning && balance >= 10) {
        currentBet = Math.min(100, Math.floor(balance / 10) * 10);
        currentBetDisplay.textContent = currentBet;
        playTone(800, 'square', 0.15, 0.1);
        setTimeout(() => playTone(1000, 'square', 0.15, 0.1), 100);
    }
});

// Paytable Modal
const modal = document.getElementById('paytable-modal');
document.getElementById('paytable-btn').addEventListener('click', () => {
    modal.classList.remove('hidden');
    if (audioCtx.state === 'suspended') audioCtx.resume();
    playTone(300, 'sine', 0.1, 0.1);
});
document.getElementById('close-modal').addEventListener('click', () => {
    modal.classList.add('hidden');
    playTone(200, 'sine', 0.1, 0.1);
});
window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.classList.add('hidden');
    }
});

// Reset Tokens
resetBtn.addEventListener('click', () => {
    if (!isSpinning) {
        balance = 1000;
        currentBet = 10;
        currentBetDisplay.textContent = currentBet;
        updateBalance(0);
        streak = 0;
        streakDisplay.textContent = streak;
        messageBoard.innerHTML = "<span class='typewriter'>Tokens Replenished. Insert Prompt.</span>";
        spinBtn.disabled = false;
        if (audioCtx.state === 'suspended') audioCtx.resume();
        playTone(400, 'sine', 0.2, 0.1);
        setTimeout(() => playTone(600, 'sine', 0.3, 0.1), 200);
        setTimeout(() => playTone(800, 'sine', 0.4, 0.1), 400);
        checkResetButton();
    }
});

spinBtn.addEventListener('click', spin);

// Optional: Allow spacebar to spin
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && !isSpinning && !spinBtn.disabled && balance >= currentBet) {
        e.preventDefault(); 
        spin();
    }
});

// Initial check
checkResetButton();