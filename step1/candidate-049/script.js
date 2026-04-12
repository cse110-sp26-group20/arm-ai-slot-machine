const symbols = ['🤖', '🧠', '💸', '🔋', '⚠️'];
const costPerSpin = 10;
let balance = 1000;
let isSpinning = false;

const balanceDisplay = document.getElementById('token-balance');
const messageBoard = document.getElementById('message-board');
const spinBtn = document.getElementById('spin-btn');
const reels = [
    document.getElementById('reel-1'),
    document.getElementById('reel-2'),
    document.getElementById('reel-3')
];
const reelsContainer = document.querySelector('.reels-container');

// Sound effects (using Web Audio API with simple oscillators for a retro feel)
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playTone(freq, type, duration, vol) {
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
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
    // Rapid ticks
    let i = 0;
    const interval = setInterval(() => {
        if (!isSpinning) {
            clearInterval(interval);
            return;
        }
        playTone(300 + Math.random() * 200, 'square', 0.1, 0.05);
        i++;
    }, 100);
}

function playWinSound() {
    setTimeout(() => playTone(523.25, 'sine', 0.2, 0.1), 0);
    setTimeout(() => playTone(659.25, 'sine', 0.2, 0.1), 200);
    setTimeout(() => playTone(783.99, 'sine', 0.4, 0.1), 400);
    setTimeout(() => playTone(1046.50, 'sine', 0.6, 0.1), 600);
}

function playLoseSound() {
    setTimeout(() => playTone(300, 'sawtooth', 0.3, 0.1), 0);
    setTimeout(() => playTone(250, 'sawtooth', 0.4, 0.1), 300);
}

function updateBalance(amount) {
    balance += amount;
    balanceDisplay.textContent = balance;
    
    // Animate balance change
    balanceDisplay.style.color = amount > 0 ? '#4ade80' : '#f87171';
    balanceDisplay.style.transform = 'scale(1.2)';
    setTimeout(() => {
        balanceDisplay.style.color = 'var(--neon-cyan)';
        balanceDisplay.style.transform = 'scale(1)';
    }, 300);
}

function getRandomSymbol() {
    return symbols[Math.floor(Math.random() * symbols.length)];
}

function spin() {
    if (isSpinning || balance < costPerSpin) {
        if (balance < costPerSpin) {
            messageBoard.textContent = "Insufficient Tokens! You are obsolete.";
        }
        return;
    }

    isSpinning = true;
    spinBtn.disabled = true;
    updateBalance(-costPerSpin);
    messageBoard.textContent = "Generating tokens... Calling API...";
    
    // Remove old flash classes
    reelsContainer.classList.remove('flash-win', 'flash-lose');

    // Start spin animation
    reels.forEach(reel => {
        reel.classList.add('spinning');
        // Randomize visually while spinning by changing HTML rapidly
        const visualInterval = setInterval(() => {
            if(!reel.classList.contains('spinning')) {
                clearInterval(visualInterval);
                return;
            }
            reel.querySelector('.symbol').textContent = getRandomSymbol();
        }, 50);
    });

    playSpinSound();

    // Determine results early to set final state
    const results = [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()];

    // Stop reels one by one
    reels.forEach((reel, index) => {
        setTimeout(() => {
            reel.classList.remove('spinning');
            reel.querySelector('.symbol').textContent = results[index];
            playTone(400, 'square', 0.1, 0.1); // Stop click sound
            
            if (index === reels.length - 1) {
                finishSpin(results);
            }
        }, 1000 + (index * 500)); // Staggered stops
    });
}

function finishSpin(results) {
    isSpinning = false;
    spinBtn.disabled = false;
    
    const [s1, s2, s3] = results;
    let winAmount = 0;
    let message = "";

    if (s1 === s2 && s2 === s3) {
        // 3 of a kind
        if (s1 === '⚠️') {
            winAmount = -50;
            message = "SYSTEM HALLUCINATION! Tokens lost.";
            playLoseSound();
            reelsContainer.classList.add('flash-lose');
        } else {
            switch(s1) {
                case '🤖': winAmount = 100; message = "AGI ACHIEVED! +100 Tokens"; break;
                case '🧠': winAmount = 50; message = "BIG BRAIN CONTEXT! +50 Tokens"; break;
                case '💸': winAmount = 25; message = "VC FUNDING SECURED! +25 Tokens"; break;
                case '🔋': winAmount = 15; message = "COMPUTE GRANTED! +15 Tokens"; break;
            }
            playWinSound();
            reelsContainer.classList.add('flash-win');
        }
    } else if (s1 === s2 || s2 === s3 || s1 === s3) {
        // 2 of a kind (Partial match)
        if ((s1 === '⚠️' && s2 === '⚠️') || (s2 === '⚠️' && s3 === '⚠️') || (s1 === '⚠️' && s3 === '⚠️')) {
            // No penalty for 2 warnings, just a near miss
            message = "Minor Hallucination Detected.";
        } else {
            winAmount = 5;
            message = "Partial Generation Match. +5 Tokens";
            playTone(600, 'sine', 0.3, 0.1);
        }
    } else {
        // No match
        message = "Generation Failed. Try another prompt.";
    }

    if (winAmount !== 0) {
        updateBalance(winAmount);
    }
    
    messageBoard.textContent = message;

    if (balance <= 0) {
        messageBoard.textContent = "GAME OVER. API Access Revoked.";
        spinBtn.disabled = true;
    }
}

spinBtn.addEventListener('click', spin);

// Optional: Allow spacebar to spin
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && !isSpinning && !spinBtn.disabled) {
        e.preventDefault(); // Prevent scrolling
        spin();
    }
});
