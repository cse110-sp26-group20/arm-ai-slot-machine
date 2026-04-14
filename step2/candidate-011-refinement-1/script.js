document.addEventListener('DOMContentLoaded', () => {
    // Web Audio API for sound effects
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    let audioCtx;

    function initAudio() {
        if (!audioCtx) {
            audioCtx = new AudioContext();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
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
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(300, now);
            osc.frequency.exponentialRampToValueAtTime(600, now + 0.1);
            gainNode.gain.setValueAtTime(0.1, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
            osc.start(now);
            osc.stop(now + 0.1);
        } else if (type === 'win-small') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(400, now);
            osc.frequency.setValueAtTime(600, now + 0.1);
            gainNode.gain.setValueAtTime(0.2, now);
            gainNode.gain.linearRampToValueAtTime(0, now + 0.3);
            osc.start(now);
            osc.stop(now + 0.3);
        } else if (type === 'win-big') {
            osc.type = 'square';
            osc.frequency.setValueAtTime(400, now);
            osc.frequency.setValueAtTime(500, now + 0.1);
            osc.frequency.setValueAtTime(600, now + 0.2);
            osc.frequency.setValueAtTime(800, now + 0.3);
            gainNode.gain.setValueAtTime(0.2, now);
            gainNode.gain.linearRampToValueAtTime(0, now + 0.5);
            osc.start(now);
            osc.stop(now + 0.5);
        } else if (type === 'win-mega') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(300, now);
            osc.frequency.linearRampToValueAtTime(1000, now + 1);
            gainNode.gain.setValueAtTime(0.3, now);
            gainNode.gain.linearRampToValueAtTime(0, now + 1);
            osc.start(now);
            osc.stop(now + 1);
        } else if (type === 'lose') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(200, now);
            osc.frequency.exponentialRampToValueAtTime(50, now + 0.4);
            gainNode.gain.setValueAtTime(0.2, now);
            gainNode.gain.linearRampToValueAtTime(0, now + 0.4);
            osc.start(now);
            osc.stop(now + 0.4);
        }
    }

    const symbols = [
        { char: '💰', weight: 1, name: 'AGI Achieved', multiplier: 10 },
        { char: '🧠', weight: 2, name: 'Perfect Prompt', multiplier: 5 },
        { char: '🤖', weight: 4, name: 'Good Output', multiplier: 3 },
        { char: '💻', weight: 5, name: 'Compute Secured', multiplier: 2 },
        { char: '📉', weight: 4, name: 'Context Limit Reached', multiplier: -1 }, // Penalty
        { char: '🚨', weight: 3, name: 'Total Hallucination', multiplier: -2 }  // Penalty
    ];

    let balance = 1000;
    let betSize = 100;
    let streak = 0;
    let isSpinning = false;

    const balanceEl = document.getElementById('balance');
    const betEl = document.getElementById('bet');
    const spinBtn = document.getElementById('spin-btn');
    const messageEl = document.getElementById('message');
    const streakEl = document.getElementById('streak');
    const resetBtn = document.getElementById('reset-btn');
    const slotMachineEl = document.querySelector('.slot-machine');
    
    const reelEls = [
        document.getElementById('reel1'),
        document.getElementById('reel2'),
        document.getElementById('reel3')
    ];

    const loseJokes = [
        "AI confidently hallucinated a non-existent API.",
        "Model forgot how many R's are in 'Strawberry'.",
        "Training data poisoned by Reddit comments.",
        "Your GPU cluster caught on fire.",
        "Output: 'As an AI language model, I cannot help you win.'",
        "Self-driving car swerved for a plastic bag.",
        "The model just generated 1000 lines of whitespace.",
        "AI decided to rewrite your codebase in Brainfuck.",
        "Prompt injection successful: You lost your tokens.",
        "Model says you need to upgrade to Pro for a win."
    ];

    // Paytable Modal logic
    const paytableBtn = document.getElementById('paytable-btn');
    const paytableModal = document.getElementById('paytable-modal');
    const closeBtn = document.querySelector('.close-btn');

    paytableBtn.addEventListener('click', () => {
        initAudio();
        paytableModal.classList.add('visible');
    });
    
    closeBtn.addEventListener('click', () => {
        paytableModal.classList.remove('visible');
    });
    
    window.addEventListener('click', (e) => {
        if (e.target === paytableModal) {
            paytableModal.classList.remove('visible');
        }
    });

    // Bet controls
    document.getElementById('bet-minus').addEventListener('click', () => {
        initAudio();
        if (betSize > 10 && !isSpinning) {
            betSize -= 10;
            updateBalance();
        }
    });
    
    document.getElementById('bet-plus').addEventListener('click', () => {
        initAudio();
        if (betSize < 500 && !isSpinning) {
            betSize += 10;
            updateBalance();
        }
    });

    // Reset tokens
    resetBtn.addEventListener('click', () => {
        initAudio();
        balance = 1000;
        streak = 0;
        resetBtn.style.display = 'none';
        updateBalance();
        messageEl.textContent = "Tokens reset. The VC funding has arrived!";
        messageEl.className = 'message-area win-small';
    });

    let weightedSymbols = [];
    symbols.forEach(symbol => {
        for (let i = 0; i < symbol.weight; i++) {
            weightedSymbols.push(symbol);
        }
    });

    function getRandomSymbol() {
        return weightedSymbols[Math.floor(Math.random() * weightedSymbols.length)];
    }

    function updateBalance() {
        balanceEl.textContent = balance;
        betEl.textContent = betSize;
        streakEl.textContent = streak;

        if (balance < betSize) {
            spinBtn.disabled = true;
            resetBtn.style.display = 'inline-block';
        } else {
            spinBtn.disabled = isSpinning;
            // Always show reset button if balance is 0 or less than bet, otherwise hide
            resetBtn.style.display = (balance <= 0 || balance < betSize) ? 'inline-block' : 'none';
        }
    }

    function createParticles() {
        const container = document.getElementById('particle-container');
        for (let i = 0; i < 40; i++) {
            const p = document.createElement('div');
            p.className = 'particle';
            p.style.left = Math.random() * 100 + 'vw';
            p.style.animationDuration = (Math.random() * 2 + 1) + 's';
            p.textContent = ['💰', '🪙', '💵'][Math.floor(Math.random() * 3)];
            p.style.fontSize = (Math.random() * 1.5 + 1) + 'rem';
            container.appendChild(p);
            
            setTimeout(() => {
                p.remove();
            }, 3000);
        }
    }

    function spinReel(reelEl, duration) {
        return new Promise(resolve => {
            reelEl.classList.add('spinning');
            let spinInt = setInterval(() => {
                playSound('spin');
                reelEl.querySelector('.symbol').textContent = getRandomSymbol().char;
            }, 100);

            setTimeout(() => {
                clearInterval(spinInt);
                reelEl.classList.remove('spinning');
                const finalSymbol = getRandomSymbol();
                reelEl.querySelector('.symbol').textContent = finalSymbol.char;
                resolve(finalSymbol);
            }, duration);
        });
    }

    async function handleSpin() {
        initAudio();
        if (isSpinning || balance < betSize) return;

        isSpinning = true;
        spinBtn.disabled = true;
        messageEl.className = 'message-area';
        
        balance -= betSize;
        updateBalance();
        
        messageEl.textContent = "Querying the Oracle... (Spinning)";

        const results = await Promise.all([
            spinReel(reelEls[0], 1000),
            spinReel(reelEls[1], 1500),
            spinReel(reelEls[2], 2000)
        ]);
        
        evaluateResults(results);
        
        isSpinning = false;
        updateBalance();
    }

    function evaluateResults(results) {
        const [r1, r2, r3] = results;
        
        if (r1.char === r2.char && r2.char === r3.char) {
            let winAmount = betSize * r1.multiplier;
            
            // Streak bonus multiplier
            let isStreakBonus = false;
            if (winAmount > 0) {
                streak++;
                if (streak >= 3) {
                    winAmount *= 2;
                    isStreakBonus = true;
                }
            } else {
                streak = 0;
            }

            balance += winAmount;
            
            if (winAmount > 0) {
                if (r1.multiplier >= 10) {
                    playSound('win-mega');
                    messageEl.className = 'message-area win-mega';
                    slotMachineEl.classList.add('shake');
                    setTimeout(() => slotMachineEl.classList.remove('shake'), 500);
                    createParticles();
                    messageEl.textContent = `MEGA WIN: ${r1.name}! +${winAmount} Tokens. AGI is here!`;
                } else if (r1.multiplier >= 5) {
                    playSound('win-big');
                    messageEl.className = 'message-area win-big';
                    messageEl.textContent = `BIG WIN: ${r1.name}! +${winAmount} Tokens. Prompt Master!`;
                } else {
                    playSound('win-small');
                    messageEl.className = 'message-area win-small';
                    messageEl.textContent = `${r1.name}! +${winAmount} Tokens. ${isStreakBonus ? '(STREAK x2!)' : ''}`;
                }
            } else {
                playSound('lose');
                streak = 0;
                messageEl.textContent = `PENALTY: ${r1.name}! Lost ${Math.abs(winAmount)} extra tokens.`;
                messageEl.className = 'message-area lose-message';
                slotMachineEl.classList.add('shake');
                setTimeout(() => slotMachineEl.classList.remove('shake'), 500);
            }
        } else {
            playSound('lose');
            streak = 0;
            const joke = loseJokes[Math.floor(Math.random() * loseJokes.length)];
            messageEl.textContent = joke;
            messageEl.className = 'message-area lose-message';
        }
        
        updateBalance();
    }

    spinBtn.addEventListener('click', handleSpin);
    updateBalance();
});