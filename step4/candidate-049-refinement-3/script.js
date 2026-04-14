const SYMBOLS = {
    ROBOT: { id: 0, multiplier: 20, svg: `<svg viewBox="0 0 24 24" fill="none" stroke="var(--neon-gold)" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4M8 16h8M6 11V9a2 2 0 012-2h8a2 2 0 012 2v2"/></svg>`, label: "AGI Robot" },
    BRAIN: { id: 1, multiplier: 10, svg: `<svg viewBox="0 0 24 24" fill="none" stroke="var(--neon-cyan)" stroke-width="2"><path d="M12 4c-3 0-5 2.5-5 5v1c-1.5 0-3 1-3 3s1.5 3 3 3v1c0 2 2 4 5 4h0c3 0 5-2 5-4v-1c1.5 0 3-1 3-3s-1.5-3-3-3v-1c0-2.5-2-5-5-5z"/></svg>`, label: "Sentient Brain" },
    MONEY: { id: 2, multiplier: 5, svg: `<svg viewBox="0 0 24 24" fill="none" stroke="var(--neon-green)" stroke-width="2"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/></svg>`, label: "VC Funding" },
    BATTERY: { id: 3, multiplier: 3, svg: `<svg viewBox="0 0 24 24" fill="none" stroke="#facc15" stroke-width="2"><rect x="2" y="7" width="16" height="10" rx="2"/><path d="M22 11v2M6 12h8"/></svg>`, label: "GPU Power" },
    WARNING: { id: 4, multiplier: 0, svg: `<svg viewBox="0 0 24 24" fill="none" stroke="#f87171" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01"/></svg>`, label: "Hallucination" },
    WILD: { id: 5, multiplier: 0, svg: `<svg viewBox="0 0 24 24" fill="none" stroke="var(--neon-magenta)" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`, label: "Wild Star" },
    SCATTER: { id: 6, multiplier: 0, svg: `<svg viewBox="0 0 24 24" fill="none" stroke="var(--neon-purple)" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 00-10 10h10V2z"/><path d="M22 12a10 10 0 00-10-10v10h10z"/></svg>`, label: "Scatter Portal" }
};

const SYMBOL_KEYS = Object.keys(SYMBOLS);
const SYMBOL_HEIGHT = 90;

const PAYLINES_CONFIG = [
    { id: 0, points: [[40, 135], [130, 135], [220, 135]], color: '#f0f', positions: [{r:1,c:0}, {r:1,c:1}, {r:1,c:2}] },
    { id: 1, points: [[40, 45], [130, 45], [220, 45]], color: '#0ff', positions: [{r:0,c:0}, {r:0,c:1}, {r:0,c:2}] },
    { id: 2, points: [[40, 225], [130, 225], [220, 225]], color: '#4ade80', positions: [{r:2,c:0}, {r:2,c:1}, {r:2,c:2}] },
    { id: 3, points: [[40, 45], [130, 135], [220, 225]], color: '#ffd700', positions: [{r:0,c:0}, {r:1,c:1}, {r:2,c:2}] },
    { id: 4, points: [[40, 225], [130, 135], [220, 45]], color: '#a855f7', positions: [{r:2,c:0}, {r:1,c:1}, {r:0,c:2}] }
];

let currentBet = 10;
let balance = 1000;
let streak = 0;
let freeSpins = 0;

let globalVolume = 0.5;
let luckLevel = 0;
let moneyMultiplierLevel = 0;

const winJokes = [
    "You won! The AI model finally aligned with your wallet.",
    "Jackpot! Sam Altman is furiously taking notes.",
    "Win! AGI achieved: Artificial Gambling Intelligence.",
    "Tokens generated! Context window exceeded!",
    "Success! Your prompt engineering is flawless."
];

const lossJokes = [
    "No win. The AI hallucinated your payout.",
    "Loss. We blame the training data.",
    "Try again. The neural net is overfitting.",
    "Missed. GPU out of memory.",
    "No luck. The RLHF tuned it against you."
];

let isSpinning = false;
let currentGrid = [
    ['ROBOT', 'BRAIN', 'MONEY'],
    ['BATTERY', 'WILD', 'WARNING'],
    ['SCATTER', 'ROBOT', 'BATTERY']
];
let activeReels = [];

// DOM Elements
const balanceDisplay = document.getElementById('token-balance');
const streakDisplay = document.getElementById('streak-counter');
const freeSpinsDisplay = document.getElementById('free-spins-display');
const freeSpinsCount = document.getElementById('free-spins-count');
const messageBoard = document.getElementById('message-board');
const currentBetDisplay = document.getElementById('current-bet');
const spinBtn = document.getElementById('spin-btn');
const stopBtns = [
    document.getElementById('stop-0'),
    document.getElementById('stop-1'),
    document.getElementById('stop-2')
];
const resetBtn = document.getElementById('reset-btn');
const paylinesOverlay = document.getElementById('paylines-overlay');
const appBody = document.body;

// Audio
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let anticipationOsc = null;
let anticipationGain = null;

function playTone(freq, type, duration, vol) {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime);
    
    gainNode.gain.setValueAtTime(vol * globalVolume, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + duration);
}

function playReelStopSound() {
    playTone(150, 'triangle', 0.2, 0.2);
    setTimeout(() => playTone(100, 'sawtooth', 0.2, 0.2), 50);
}

function startAnticipationSound() {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    anticipationOsc = audioCtx.createOscillator();
    anticipationGain = audioCtx.createGain();
    
    anticipationOsc.type = 'sawtooth';
    anticipationOsc.frequency.setValueAtTime(200, audioCtx.currentTime);
    anticipationOsc.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 3);
    
    anticipationGain.gain.setValueAtTime(0.05 * globalVolume, audioCtx.currentTime);
    anticipationGain.gain.linearRampToValueAtTime(0.2 * globalVolume, audioCtx.currentTime + 3);
    
    anticipationOsc.connect(anticipationGain);
    anticipationGain.connect(audioCtx.destination);
    
    anticipationOsc.start();
}

function stopAnticipationSound() {
    if (anticipationOsc) {
        anticipationGain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
        setTimeout(() => {
            if (anticipationOsc) {
                anticipationOsc.stop();
                anticipationOsc = null;
            }
        }, 100);
    }
}

// Initialization
function initPaytable() {
    const list = document.getElementById('paytable-list');
    const order = ['ROBOT', 'BRAIN', 'MONEY', 'BATTERY'];
    order.forEach(key => {
        const sym = SYMBOLS[key];
        list.innerHTML += `<li>${sym.svg} ${sym.svg} ${sym.svg} = ${sym.multiplier}x (${sym.label})</li>`;
    });
}
initPaytable();

function initGrid() {
    for (let c = 0; c < 3; c++) {
        const strip = document.getElementById(`reel-${c}`);
        strip.innerHTML = '';
        for (let r = 0; r < 3; r++) {
            const box = document.createElement('div');
            box.className = 'symbol-box';
            box.innerHTML = SYMBOLS[currentGrid[r][c]].svg;
            strip.appendChild(box);
        }
        strip.style.transform = `translateY(0px)`;
    }
}
initGrid();

function getRandomSymbolWeighted(allowSpecials = true) {
    const pool = [
        ...Array(2 + luckLevel).fill('ROBOT'),
        ...Array(4 + luckLevel).fill('BRAIN'),
        ...Array(6).fill('MONEY'),
        ...Array(8).fill('BATTERY'),
        ...Array(5).fill('WARNING'),
    ];
    if (allowSpecials) {
        pool.push(...Array(2 + luckLevel).fill('WILD'));
        pool.push(...Array(2).fill('SCATTER'));
    }
    return pool[Math.floor(Math.random() * pool.length)];
}

function evaluateWins(grid) {
    const wins = [];
    PAYLINES_CONFIG.forEach(line => {
        const s1 = grid[line.positions[0].r][line.positions[0].c];
        const s2 = grid[line.positions[1].r][line.positions[1].c];
        const s3 = grid[line.positions[2].r][line.positions[2].c];
        
        const syms = [s1, s2, s3];
        const nonWilds = syms.filter(s => s !== 'WILD');
        
        let isWin = false;
        let winSymbol = null;
        
        if (nonWilds.length === 0) {
            isWin = true;
            winSymbol = 'ROBOT'; // All wilds counts as top payout
        } else {
            const firstNonWild = nonWilds[0];
            if (nonWilds.every(s => s === firstNonWild) && firstNonWild !== 'SCATTER' && firstNonWild !== 'WARNING') {
                isWin = true;
                winSymbol = firstNonWild;
            }
        }
        
        if (isWin) {
            wins.push({ lineId: line.id, symbol: winSymbol });
        }
    });
    return wins;
}

function checkAnticipation(grid) {
    for (let line of PAYLINES_CONFIG) {
        const s1 = grid[line.positions[0].r][line.positions[0].c];
        const s2 = grid[line.positions[1].r][line.positions[1].c];
        
        if ((s1 === s2 || s1 === 'WILD' || s2 === 'WILD') && s1 !== 'SCATTER' && s2 !== 'SCATTER' && s1 !== 'WARNING' && s2 !== 'WARNING') {
            return true;
        }
    }
    
    let scatterCount = 0;
    for(let r=0; r<3; r++) {
        if (grid[r][0] === 'SCATTER') scatterCount++;
        if (grid[r][1] === 'SCATTER') scatterCount++;
    }
    if (scatterCount >= 2) return true;

    return false;
}

function createNearMissGrid() {
    let grid = Array(3).fill(null).map(() => Array(3).fill(null).map(() => getRandomSymbolWeighted(false)));
    grid[1][0] = 'ROBOT';
    grid[1][1] = 'ROBOT';
    while(grid[1][2] === 'ROBOT' || grid[1][2] === 'WILD') {
        grid[1][2] = getRandomSymbolWeighted(false);
    }
    grid[0][2] = 'ROBOT'; // Just outside
    return grid;
}

function generateGrid() {
    let grid = Array(3).fill(null).map(() => Array(3).fill(null).map(() => getRandomSymbolWeighted()));
    let wins = evaluateWins(grid);
    if (wins.length === 0 && Math.random() < 0.25) { // 25% near miss chance
        grid = createNearMissGrid();
    }
    return grid;
}

function buildReelStrip(reelIndex, targetCol, anticipation) {
    const reelStrip = document.getElementById(`reel-${reelIndex}`);
    reelStrip.innerHTML = '';
    
    let spinLength = 30 + (reelIndex * 20); 
    if (anticipation && reelIndex === 2) {
        spinLength += 80;
    }
    
    const currentCol = [currentGrid[0][reelIndex], currentGrid[1][reelIndex], currentGrid[2][reelIndex]];
    const stripSymbols = [...currentCol];
    
    for(let i=0; i < spinLength; i++) {
        stripSymbols.push(getRandomSymbolWeighted());
    }
    stripSymbols.push(...targetCol);

    stripSymbols.forEach(sym => {
        const box = document.createElement('div');
        box.className = 'symbol-box';
        box.innerHTML = SYMBOLS[sym].svg;
        reelStrip.appendChild(box);
    });

    reelStrip.style.transition = 'none';
    reelStrip.style.transform = `translateY(0px)`;
    void reelStrip.offsetHeight;

    return { stripElement: reelStrip, totalSymbols: stripSymbols.length };
}

function startReelSpin(reelIndex, targetCol, anticipation) {
    const { stripElement, totalSymbols } = buildReelStrip(reelIndex, targetCol, anticipation);
    const targetY = - (totalSymbols - 3) * SYMBOL_HEIGHT;
    
    let duration = 1500 + (reelIndex * 500);
    if (anticipation && reelIndex === 2) duration += 3000;
    
    stripElement.style.transition = `transform ${duration}ms cubic-bezier(0.1, 0.7, 0.1, 1)`;
    stripElement.style.transform = `translateY(${targetY}px)`;
    
    return {
        element: stripElement,
        targetY: targetY,
        timeout: setTimeout(() => handleReelStop(reelIndex), duration),
        stopped: false,
        anticipation: anticipation
    };
}

function handleReelStop(index) {
    const reel = activeReels[index];
    if (reel.stopped) return;
    
    reel.stopped = true;
    playReelStopSound();
    stopBtns[index].disabled = true;
    stopBtns[index].classList.remove('anticipation');
    
    if (index === 1 && activeReels[2].anticipation) {
        startAnticipationSound();
        stopBtns[2].classList.add('anticipation');
    }
    
    if (index === 2) {
        stopAnticipationSound();
        setTimeout(finishSpin, 400);
    }
}

stopBtns.forEach((btn, index) => {
    btn.addEventListener('click', () => {
        const reel = activeReels[index];
        if (!reel || reel.stopped) return;
        
        clearTimeout(reel.timeout);
        reel.element.style.transition = `transform 300ms cubic-bezier(0.2, 0.8, 0.2, 1)`;
        reel.element.style.transform = `translateY(${reel.targetY}px)`;
        reel.timeout = setTimeout(() => handleReelStop(index), 300);
        
        // If player force-stops reel 1, and reel 2 has anticipation, trigger sound immediately
        if (index === 1 && activeReels[2] && activeReels[2].anticipation && !activeReels[2].stopped) {
             startAnticipationSound();
             stopBtns[2].classList.add('anticipation');
        }
    });
});

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
    if (balance < 10 && freeSpins === 0) {
        resetBtn.classList.remove('hidden');
        spinBtn.disabled = true;
    } else {
        resetBtn.classList.add('hidden');
        if (currentBet > balance && freeSpins === 0) {
            currentBet = Math.max(10, Math.floor(balance / 10) * 10);
            currentBetDisplay.textContent = currentBet;
        }
        spinBtn.disabled = isSpinning || (balance < currentBet && freeSpins === 0);
    }
}

function toggleBetButtons(disable) {
    document.getElementById('bet-minus').disabled = disable;
    document.getElementById('bet-plus').disabled = disable;
    document.getElementById('bet-max').disabled = disable;
}

function spin() {
    if (isSpinning || (balance < currentBet && freeSpins === 0)) return;

    if (audioCtx.state === 'suspended') audioCtx.resume();

    isSpinning = true;
    spinBtn.textContent = "SKIP";
    toggleBetButtons(true);
    paylinesOverlay.innerHTML = '';
    messageBoard.innerHTML = "<span style='color:#fff'>Spinning...</span>";
    
    if (freeSpins > 0) {
        freeSpins--;
        freeSpinsCount.textContent = freeSpins;
        if (freeSpins === 0) {
            appBody.classList.remove('free-spins-mode');
            freeSpinsDisplay.style.display = 'none';
        }
    } else {
        updateBalance(-currentBet);
    }

    const nextGrid = generateGrid();
    const hasAnticipation = checkAnticipation(nextGrid);
    
    activeReels = [];
    for(let c=0; c<3; c++) {
        const targetCol = [nextGrid[0][c], nextGrid[1][c], nextGrid[2][c]];
        activeReels.push(startReelSpin(c, targetCol, c === 2 ? hasAnticipation : false));
        stopBtns[c].disabled = false;
        stopBtns[c].classList.remove('anticipation');
    }
    
    if (hasAnticipation) {
        stopBtns[2].disabled = true; // Disable manual stop for reel 3 to force anticipation
    }

    currentGrid = nextGrid;
}

function drawPaylines(winningLines) {
    paylinesOverlay.innerHTML = '';
    winningLines.forEach(win => {
        const config = PAYLINES_CONFIG.find(p => p.id === win.lineId);
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const d = `M ${config.points[0][0]} ${config.points[0][1]} L ${config.points[1][0]} ${config.points[1][1]} L ${config.points[2][0]} ${config.points[2][1]}`;
        path.setAttribute('d', d);
        path.setAttribute('stroke', config.color);
        path.classList.add('payline-path', 'active');
        paylinesOverlay.appendChild(path);
    });
}

function triggerBigWin(winAmount) {
    const overlay = document.getElementById('big-win-overlay');
    const counter = document.getElementById('rollup-counter');
    overlay.classList.remove('hidden');
    
    startParticleShower();
    
    let current = 0;
    const duration = 3000;
    const startTime = performance.now();
    
    const tickInterval = setInterval(() => {
        const progress = Math.min(1, (performance.now() - startTime) / duration);
        playTone(300 + (progress * 500), 'square', 0.05, 0.1);
    }, 50);

    function updateCounter(time) {
        const elapsed = time - startTime;
        const progress = Math.min(1, elapsed / duration);
        
        current = Math.floor(progress * winAmount);
        counter.textContent = current;
        
        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        } else {
            clearInterval(tickInterval);
            playTone(1000, 'sine', 0.5, 0.3);
            setTimeout(() => playTone(1500, 'sine', 0.5, 0.3), 150);
            setTimeout(() => {
                overlay.classList.add('hidden');
                stopParticleShower();
            }, 3000);
        }
    }
    requestAnimationFrame(updateCounter);
}

// Particle System
let particles = [];
let particleAnim;
const canvas = document.getElementById('particles-canvas');
const ctx = canvas.getContext('2d');

function startParticleShower() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    particles = [];
    for(let i=0; i<150; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: -Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 5,
            vy: Math.random() * 5 + 5,
            size: Math.random() * 10 + 5,
            color: ['#ffd700', '#0ff', '#f0f', '#4ade80'][Math.floor(Math.random()*4)]
        });
    }
    
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            if (p.y > canvas.height) p.y = -p.size;
            
            ctx.fillStyle = p.color;
            ctx.shadowBlur = 10;
            ctx.shadowColor = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        });
        particleAnim = requestAnimationFrame(draw);
    }
    draw();
}
function stopParticleShower() {
    cancelAnimationFrame(particleAnim);
}

function finishSpin() {
    isSpinning = false;
    spinBtn.textContent = "SPIN";
    toggleBetButtons(false);
    checkResetButton();
    stopBtns.forEach(btn => btn.disabled = true);
    
    const wins = evaluateWins(currentGrid);
    
    let totalMultiplier = 0;
    wins.forEach(w => {
        totalMultiplier += SYMBOLS[w.symbol].multiplier;
    });
    
    let scatterCount = 0;
    for(let r=0; r<3; r++) {
        for(let c=0; c<3; c++) {
            if (currentGrid[r][c] === 'SCATTER') scatterCount++;
        }
    }
    
    if (scatterCount >= 3) {
        freeSpins += 10;
        freeSpinsDisplay.style.display = 'flex';
        freeSpinsCount.textContent = freeSpins;
        appBody.classList.add('free-spins-mode');
        playTone(600, 'sine', 0.2, 0.2);
        setTimeout(() => playTone(800, 'sine', 0.4, 0.2), 200);
        messageBoard.innerHTML = "FREE SPINS TRIGGERED! 3x Multiplier active.";
    }

    if (wins.length > 0) {
        streak++;
        drawPaylines(wins);
        
        let winAmount = currentBet * totalMultiplier;
        if (appBody.classList.contains('free-spins-mode')) {
            winAmount *= 3;
        }
        
        if (streak > 1) {
            winAmount += currentBet * (streak * 0.1);
        }
        winAmount = Math.floor(winAmount * (1 + (moneyMultiplierLevel * 0.5)));
        
        if (winAmount >= currentBet * 20) {
            triggerBigWin(winAmount);
        } else {
            // Normal win sound
            playTone(523.25, 'square', 0.2, 0.1);
            setTimeout(() => playTone(659.25, 'square', 0.2, 0.1), 150);
            setTimeout(() => playTone(783.99, 'square', 0.4, 0.1), 300);
        }
        
        updateBalance(winAmount);
        const joke = winJokes[Math.floor(Math.random() * winJokes.length)];
        messageBoard.innerHTML = `WIN! +${winAmount} Tokens!<br><span style="font-size: 0.7em; color: var(--text-muted)">${joke}</span>`;
    } else {
        streak = 0;
        let isWarning = false;
        // Check for warnings reducing payout implicitly by losing bet.
        for(let r=0; r<3; r++) {
            for(let c=0; c<3; c++) {
                if (currentGrid[r][c] === 'WARNING') isWarning = true;
            }
        }
        const joke = lossJokes[Math.floor(Math.random() * lossJokes.length)];
        if (isWarning) {
             messageBoard.innerHTML = `Hallucination Detected!<br><span style="font-size: 0.7em; color: var(--text-muted)">${joke}</span>`;
             setTimeout(() => playTone(200, 'sawtooth', 0.6, 0.1), 0);
        } else {
             messageBoard.innerHTML = `No Win. Try Again.<br><span style="font-size: 0.7em; color: var(--text-muted)">${joke}</span>`;
        }
    }
    
    streakDisplay.textContent = streak;
    if(streak > 2) {
        streakDisplay.style.color = 'var(--neon-magenta)';
        streakDisplay.style.textShadow = '0 0 10px var(--neon-magenta)';
    } else {
        streakDisplay.style.color = 'var(--neon-cyan)';
        streakDisplay.style.textShadow = '0 0 10px var(--neon-cyan)';
    }
}

// Event Listeners
document.getElementById('bet-minus').addEventListener('click', () => {
    if (currentBet > 10 && !isSpinning) {
        currentBet -= 10;
        currentBetDisplay.textContent = currentBet;
        playTone(400, 'triangle', 0.1, 0.1);
    }
});

document.getElementById('bet-plus').addEventListener('click', () => {
    if (currentBet < 100 && currentBet + 10 <= balance && !isSpinning) {
        currentBet += 10;
        currentBetDisplay.textContent = currentBet;
        playTone(600, 'triangle', 0.1, 0.1);
    }
});

document.getElementById('bet-max').addEventListener('click', () => {
    if (!isSpinning && balance >= 10) {
        currentBet = Math.min(100, Math.floor(balance / 10) * 10);
        currentBetDisplay.textContent = currentBet;
        playTone(800, 'square', 0.15, 0.1);
    }
});

const modal = document.getElementById('paytable-modal');
document.getElementById('paytable-btn').addEventListener('click', () => {
    modal.classList.remove('hidden');
    if (audioCtx.state === 'suspended') audioCtx.resume();
});
document.getElementById('close-modal').addEventListener('click', () => {
    modal.classList.add('hidden');
});
window.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.add('hidden');
});

resetBtn.addEventListener('click', () => {
    if (!isSpinning) {
        balance = 1000;
        currentBet = 10;
        currentBetDisplay.textContent = currentBet;
        updateBalance(0);
        streak = 0;
        freeSpins = 0;
        appBody.classList.remove('free-spins-mode');
        freeSpinsDisplay.style.display = 'none';
        streakDisplay.textContent = streak;
        messageBoard.innerHTML = "Tokens Replenished.";
        spinBtn.disabled = false;
        if (audioCtx.state === 'suspended') audioCtx.resume();
    }
});

spinBtn.addEventListener('click', () => {
    if (isSpinning) {
        activeReels.forEach((reel, index) => {
            if (!reel.stopped) {
                clearTimeout(reel.timeout);
                reel.element.style.transition = 'none';
                reel.element.style.transform = `translateY(${reel.targetY}px)`;
                handleReelStop(index);
            }
        });
    } else {
        spin();
    }
});

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && !spinBtn.disabled && (balance >= currentBet || freeSpins > 0)) {
        e.preventDefault(); 
        if (isSpinning) {
            activeReels.forEach((reel, index) => {
                if (!reel.stopped) {
                    clearTimeout(reel.timeout);
                    reel.element.style.transition = 'none';
                    reel.element.style.transform = `translateY(${reel.targetY}px)`;
                    handleReelStop(index);
                }
            });
        } else {
            spin();
        }
    }
});

document.getElementById('bet-reset').addEventListener('click', () => {
    if (!isSpinning && balance >= 10) {
        currentBet = 10;
        currentBetDisplay.textContent = currentBet;
        playTone(300, 'square', 0.1, 0.1);
    }
});

const shopModal = document.getElementById('shop-modal');
if (document.getElementById('shop-btn')) {
    document.getElementById('shop-btn').addEventListener('click', () => {
        shopModal.classList.remove('hidden');
    });
    document.getElementById('close-shop').addEventListener('click', () => {
        shopModal.classList.add('hidden');
    });

    document.getElementById('buy-luck').addEventListener('click', () => {
        if (balance >= 500) {
            updateBalance(-500);
            luckLevel++;
            document.getElementById('buy-luck').textContent = `Buy for 500 (Lvl ${luckLevel})`;
            playTone(600, 'sine', 0.1, 0.1);
        }
    });

    document.getElementById('buy-money').addEventListener('click', () => {
        if (balance >= 1000) {
            updateBalance(-1000);
            moneyMultiplierLevel++;
            document.getElementById('buy-money').textContent = `Buy for 1000 (Lvl ${moneyMultiplierLevel})`;
            playTone(600, 'sine', 0.1, 0.1);
        }
    });

    document.getElementById('buy-cosmetic').addEventListener('click', () => {
        if (balance >= 300 && !document.getElementById('cyber-bot')) {
            updateBalance(-300);
            const botElement = document.createElement('div');
            botElement.id = 'cyber-bot';
            botElement.innerHTML = '🤖';
            botElement.style.cssText = 'position: fixed; bottom: 20px; right: 20px; font-size: 4rem; animation: float 3s infinite ease-in-out; z-index: 10;';
            document.body.appendChild(botElement);
            document.getElementById('buy-cosmetic').textContent = "Purchased!";
            document.getElementById('buy-cosmetic').disabled = true;
            playTone(800, 'sine', 0.2, 0.2);
        }
    });
}

if (document.getElementById('volume-slider')) {
    document.getElementById('volume-slider').addEventListener('input', (e) => {
        globalVolume = parseFloat(e.target.value);
    });
}

checkResetButton();