const symbols = ['🤖', '🧠', '💸', '🗑️', '🔋'];
const SPIN_COST = 10;

let tokens = 1000;
let isSpinning = false;

const tokenCountEl = document.getElementById('token-count');
const spinBtn = document.getElementById('spin-button');
const messageEl = document.getElementById('message');
const reels = [
    document.getElementById('reel1').querySelector('.symbol'),
    document.getElementById('reel2').querySelector('.symbol'),
    document.getElementById('reel3').querySelector('.symbol')
];
const container = document.querySelector('.container');

// Sound effects (using Web Audio API for a raw feel)
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playTone(freq, type, duration, vol=0.1) {
    if(audioCtx.state === 'suspended') audioCtx.resume();
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
    }, 100);
}

function playWinSound() {
    playTone(440, 'sine', 0.1, 0.2);
    setTimeout(() => playTone(554.37, 'sine', 0.1, 0.2), 100);
    setTimeout(() => playTone(659.25, 'sine', 0.2, 0.2), 200);
    setTimeout(() => playTone(880, 'sine', 0.4, 0.2), 300);
}

function playLoseSound() {
    playTone(300, 'sawtooth', 0.3, 0.2);
    setTimeout(() => playTone(250, 'sawtooth', 0.4, 0.2), 200);
}

function updateTokens(amount) {
    tokens += amount;
    tokenCountEl.textContent = tokens;
    
    if (tokens < SPIN_COST) {
        spinBtn.disabled = true;
        spinBtn.textContent = "OUT OF COMPUTE";
        messageEl.textContent = "API Error: 429 Too Many Requests (You're broke). Refresh to get more VC funding.";
        messageEl.style.color = "var(--lose-color)";
    }
}

function getRandomSymbol() {
    return symbols[Math.floor(Math.random() * symbols.length)];
}

function animateReel(reelEl, finalSymbol, duration) {
    return new Promise(resolve => {
        let startTime = null;
        const spinSpeed = 50; // ms per symbol change
        
        function step(timestamp) {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;
            
            if (progress < duration) {
                if (Math.floor(progress / spinSpeed) % 2 === 0) {
                     reelEl.textContent = getRandomSymbol();
                     reelEl.style.transform = `translateY(${Math.random() * 10 - 5}px)`;
                }
                requestAnimationFrame(step);
            } else {
                reelEl.textContent = finalSymbol;
                reelEl.style.transform = 'translateY(0)';
                playTone(600, 'triangle', 0.1, 0.1); // click sound for stop
                resolve(finalSymbol);
            }
        }
        
        requestAnimationFrame(step);
    });
}

function checkWin(results) {
    const [s1, s2, s3] = results;
    container.classList.remove('jackpot-anim');
    
    if (s1 === s2 && s2 === s3) {
        let winAmount = 0;
        let msg = "";
        
        switch (s1) {
            case '💸':
                winAmount = 100;
                msg = "JACKPOT! Series A funding secured! (+100 Tokens)";
                container.classList.add('jackpot-anim');
                playWinSound();
                break;
            case '🧠':
                winAmount = 50;
                msg = "AGI Achieved internally! (Sam Altman is typing...) (+50 Tokens)";
                playWinSound();
                break;
            case '🔋':
                winAmount = 30;
                msg = "H100 Cluster acquired! Inference speed go brrr. (+30 Tokens)";
                playWinSound();
                break;
            case '🤖':
                winAmount = 20;
                msg = "Multi-agent framework successfully overcomplicated a simple task. (+20 Tokens)";
                playWinSound();
                break;
            case '🗑️':
                winAmount = -50;
                msg = "CRITICAL HALLUCINATION! The model told a user to eat rocks. Lawyers involved. (-50 Tokens)";
                playLoseSound();
                messageEl.style.color = "var(--lose-color)";
                break;
        }
        
        if (winAmount > 0) {
            messageEl.style.color = "var(--win-color)";
            messageEl.style.textShadow = "0 0 10px var(--win-color)";
        }
        
        updateTokens(winAmount);
        return msg;
    } else {
        // Two of a kind or nothing
        const msgs = [
            "Context window truncated. Try again.",
            "Model parameters updated. Nothing happened.",
            "Waiting for GPU availability...",
            "Output filtered by safety guidelines.",
            "Temperature set too high, random garbage generated.",
            "Prompt engineering failed.",
            "Just another wrapper app spin."
        ];
        messageEl.style.color = "white";
        messageEl.style.textShadow = "none";
        return msgs[Math.floor(Math.random() * msgs.length)];
    }
}

spinBtn.addEventListener('click', async () => {
    if (isSpinning || tokens < SPIN_COST) return;
    
    isSpinning = true;
    spinBtn.disabled = true;
    updateTokens(-SPIN_COST);
    
    messageEl.textContent = "Generating tokens... Please wait warmly...";
    messageEl.style.color = "white";
    messageEl.style.textShadow = "none";
    
    playSpinSound();
    
    // Determine results beforehand
    const results = [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()];
    
    // Animate reels stopping one by one
    const p1 = animateReel(reels[0], results[0], 1000);
    const p2 = animateReel(reels[1], results[1], 1500);
    const p3 = animateReel(reels[2], results[2], 2000);
    
    await Promise.all([p1, p2, p3]);
    
    isSpinning = false;
    spinBtn.disabled = false;
    
    const outcomeMessage = checkWin(results);
    messageEl.textContent = outcomeMessage;
    
    // Check if out of tokens right after spin finishes
    if (tokens < SPIN_COST) {
         spinBtn.disabled = true;
    }
});
