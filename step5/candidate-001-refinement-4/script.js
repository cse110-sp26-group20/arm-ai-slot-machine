const svgs = {
    'AGI': `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="none" stroke="#ff00ff" stroke-width="4" filter="drop-shadow(0 0 8px #ff00ff)"/><path d="M50 20 Q80 50 50 80 Q20 50 50 20" fill="none" stroke="#00ffff" stroke-width="4" filter="drop-shadow(0 0 5px #00ffff)"/><circle cx="50" cy="50" r="10" fill="#fff" filter="drop-shadow(0 0 15px #fff)"/></svg>`,
    'TENSOR': `<svg viewBox="0 0 100 100"><polygon points="50,15 85,35 85,65 50,85 15,65 15,35" fill="none" stroke="#00ffcc" stroke-width="6" filter="drop-shadow(0 0 8px #00ffcc)"/><path d="M50,15 L50,50 L85,65 M50,50 L15,65" stroke="#00ffcc" stroke-width="4"/></svg>`,
    'GPU': `<svg viewBox="0 0 100 100"><rect x="20" y="20" width="60" height="60" fill="#111" stroke="#ffaa00" stroke-width="5" rx="8" filter="drop-shadow(0 0 8px #ffaa00)"/><circle cx="50" cy="50" r="15" fill="#ffaa00"/><path d="M10 30h10 M10 50h10 M10 70h10 M80 30h10 M80 50h10 M80 70h10 M30 10v10 M50 10v10 M70 10v10 M30 80v10 M50 80v10 M70 80v10" stroke="#ffaa00" stroke-width="4"/></svg>`,
    'CPU': `<svg viewBox="0 0 100 100"><rect x="25" y="25" width="50" height="50" fill="none" stroke="#00aaff" stroke-width="6" filter="drop-shadow(0 0 8px #00aaff)"/><rect x="35" y="35" width="30" height="30" fill="#00aaff" filter="drop-shadow(0 0 5px #00aaff)"/></svg>`,
    'DATA': `<svg viewBox="0 0 100 100"><ellipse cx="50" cy="30" rx="30" ry="10" fill="none" stroke="#22c55e" stroke-width="5" filter="drop-shadow(0 0 8px #22c55e)"/><path d="M20 30 v40 a30 10 0 0 0 60 0 v-40" fill="none" stroke="#22c55e" stroke-width="5"/><ellipse cx="50" cy="50" rx="30" ry="10" fill="none" stroke="#22c55e" stroke-width="5"/><ellipse cx="50" cy="70" rx="30" ry="10" fill="none" stroke="#22c55e" stroke-width="5"/></svg>`,
    'BUG': `<svg viewBox="0 0 100 100"><ellipse cx="50" cy="50" rx="15" ry="25" fill="#ef4444" filter="drop-shadow(0 0 15px #ef4444)"/><path d="M35 40 L20 30 M35 50 L10 50 M35 60 L20 70 M65 40 L80 30 M65 50 L90 50 M65 60 L80 70" stroke="#ef4444" stroke-width="5" stroke-linecap="round"/><circle cx="43" cy="35" r="4" fill="#fff"/><circle cx="57" cy="35" r="4" fill="#fff"/></svg>`,
    'PROMPT': `<svg viewBox="0 0 100 100"><rect x="10" y="20" width="80" height="60" fill="#020617" stroke="#e2e8f0" stroke-width="4" rx="5" filter="drop-shadow(0 0 8px #fff)"/><text x="20" y="55" font-family="monospace" font-size="30" fill="#22c55e" font-weight="bold" filter="drop-shadow(0 0 5px #22c55e)">>_</text></svg>`
};

const symbolWeights = { 'AGI': 5, 'TENSOR': 10, 'GPU': 15, 'CPU': 20, 'DATA': 25, 'BUG': 5, 'PROMPT': 6 };
const totalWeight = Object.values(symbolWeights).reduce((a, b) => a + b, 0);

const payTable = { 'AGI': 50, 'TENSOR': 20, 'GPU': 10, 'CPU': 5, 'DATA': 2 };

const paylines = [
    [{c:0, r:1}, {c:1, r:1}, {c:2, r:1}],
    [{c:0, r:0}, {c:1, r:0}, {c:2, r:0}],
    [{c:0, r:2}, {c:1, r:2}, {c:2, r:2}],
    [{c:0, r:0}, {c:1, r:1}, {c:2, r:2}],
    [{c:0, r:2}, {c:1, r:1}, {c:2, r:0}]
];

const winJokes = [
    "Model weights optimized! Massive yield! 🧠",
    "AGI Achieved! Prepare for takeover! 🤖",
    "Data pipeline overflowing with credits! 📊",
    "Neural pathways aligned perfectly! ✨",
    "Zero loss gradient! Perfect validation! 📈",
    "You just prompted a jackpot! 💻"
];

const lossJokes = [
    "Overfitting detected. Credits lost. 📉",
    "Gradient vanishing... Try higher learning rate (bet more). 🛑",
    "Hallucination error: You thought you won. 🤡",
    "404: Optimal weights not found. 🔍",
    "Compute limits reached. Run failed. ⚙️",
    "Model collapsed. Adjust hyper-parameters. 🤖"
];

// Upgrades Data Structure
const upgrades = {
    luck: { id: 'luck', name: "🍀 Luck Optimizer", baseCost: 500, costMult: 1.5, level: 0, maxLevel: 5, value: 1.0, valueStep: 0.1, desc: "Increases chance of higher tier symbols." },
    money: { id: 'money', name: "💰 Yield Multiplier", baseCost: 1000, costMult: 2.0, level: 0, maxLevel: 5, value: 1.0, valueStep: 0.2, desc: "Multiplies all base credit returns." },
    speed: { id: 'speed', name: "⚡ Overclock Compute", baseCost: 300, costMult: 1.5, level: 0, maxLevel: 3, value: 1.0, valueStep: 0.25, desc: "Speeds up reel animations." },
    cosmetic: { id: 'cosmetic', name: "🤖 AI Companion", baseCost: 200, costMult: 3.0, level: 0, maxLevel: 3, value: 0, valueStep: 1, desc: "Summons and upgrades your AI assistant." },
    passive: { id: 'passive', name: "🔋 Data Mining", baseCost: 600, costMult: 1.8, level: 0, maxLevel: 5, value: 0, valueStep: 2, desc: "Generates passive credits per second." },
    autospin: { id: 'autospin', name: "⚙️ Auto-Trainer Mode", baseCost: 2000, costMult: 1, level: 0, maxLevel: 1, value: 0, valueStep: 1, desc: "Unlocks automatic consecutive spins." }
};

let tokens = 1000;
let currentBet = 10;
let isSpinning = false;
let grid = [[],[],[]];
let stopRequested = [false, false, false];
let activeReels = 0;
let freeSpins = 0;
let audioCtx;
let anticipationOsc = null;
let globalVolume = 1.0;

// Auto spin state
let autoSpinActive = false;
let autoSpinCooldown = 0; // seconds
let autoSpinTimer = null;
let autoSpinDuration = 10; // 10 seconds of spinning
const COOLDOWN_MAX = 30;

let passiveIncomeInterval = null;

const els = {
    tokenCount: document.getElementById('token-count'),
    betAmount: document.getElementById('bet-amount'),
    betSlider: document.getElementById('bet-slider'),
    message: document.getElementById('message'),
    spinBtn: document.getElementById('spin-btn'),
    paylinesOverlay: document.getElementById('paylines-overlay'),
    bigWinOverlay: document.getElementById('big-win-overlay'),
    rollupCounter: document.getElementById('rollup-counter'),
    fsDisplay: document.getElementById('fs-display'),
    fsCount: document.getElementById('fs-count'),
    aiCosmetic: document.getElementById('ai-cosmetic'),
    aiBotIcon: document.getElementById('ai-bot-icon'),
    aiSpeech: document.getElementById('ai-speech-text'),
    machineBorder: document.getElementById('machine-border'),
    shopGrid: document.getElementById('shop-grid'),
    shopTokens: document.getElementById('shop-tokens'),
    autoSpinContainer: document.getElementById('auto-spin-container'),
    autoSpinBtn: document.getElementById('auto-spin-btn'),
    autoSpinFill: document.getElementById('auto-spin-fill'),
    resetTokensBtn: document.getElementById('reset-tokens-btn'),
    winTierText: document.getElementById('win-tier-text')
};

// Initialize Modal Icons
document.getElementById('p-agi').innerHTML = svgs['AGI'];
document.getElementById('p-tensor').innerHTML = svgs['TENSOR'];
document.getElementById('p-gpu').innerHTML = svgs['GPU'];
document.getElementById('p-cpu').innerHTML = svgs['CPU'];
document.getElementById('p-data').innerHTML = svgs['DATA'];
document.getElementById('p-bug').innerHTML = svgs['BUG'];
document.getElementById('p-prompt').innerHTML = svgs['PROMPT'];

function initAudio() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
}

function playTone(freq, type, duration, vol = 0.1) {
    if(!audioCtx || globalVolume === 0) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(vol * globalVolume, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
}

function playSound(type) {
    initAudio();
    switch(type) {
        case 'click': playTone(800, 'sine', 0.1, 0.05); break;
        case 'buy': 
            playTone(400, 'square', 0.1, 0.1); 
            setTimeout(() => playTone(600, 'square', 0.1, 0.1), 100);
            setTimeout(() => playTone(800, 'square', 0.2, 0.1), 200);
            break;
        case 'error':
            playTone(200, 'sawtooth', 0.2, 0.1);
            setTimeout(() => playTone(150, 'sawtooth', 0.2, 0.1), 200);
            break;
        case 'slider': playTone(1000, 'sine', 0.05, 0.02); break;
        case 'reset':
            playTone(300, 'square', 0.5, 0.2);
            setTimeout(() => playTone(400, 'square', 0.5, 0.2), 200);
            setTimeout(() => playTone(500, 'square', 0.5, 0.2), 400);
            break;
    }
}

function getSymbolValue(s) {
    if (s === 'BUG') return 50;
    if (s === 'PROMPT') return 0;
    return payTable[s] || 0;
}

function getRandomSymbol() {
    let r = Math.random() * totalWeight;
    let s1 = 'DATA';
    for (let s in symbolWeights) {
        if (r < symbolWeights[s]) { s1 = s; break; }
        r -= symbolWeights[s];
    }
    
    // Luck Optimizer affects symbol generation
    let luckThreshold = (upgrades.luck.value - 1.0) * 0.5; // Up to 0.25 chance to roll twice and take best
    if (luckThreshold > 0 && Math.random() < luckThreshold) {
        let r2 = Math.random() * totalWeight;
        let s2 = 'DATA';
        for (let s in symbolWeights) {
            if (r2 < symbolWeights[s]) { s2 = s; break; }
            r2 -= symbolWeights[s];
        }
        return getSymbolValue(s1) > getSymbolValue(s2) ? s1 : s2;
    }
    return s1;
}

function isMatch(s1, s2) {
    return s1 === s2 || s1 === 'BUG' || s2 === 'BUG';
}

function checkAnticipationForGrid(g) {
    let has = false;
    let lines = [];
    for(let i=0; i<paylines.length; i++) {
        let p = paylines[i];
        let s0 = g[p[0].c][p[0].r];
        let s1 = g[p[1].c][p[1].r];
        if (isMatch(s0, s1) && s0 !== 'PROMPT' && s1 !== 'PROMPT') {
            has = true;
            lines.push({ lineIndex: i, symbol: s0 === 'BUG' ? s1 : s0, rowOnReel2: p[2].r });
        }
    }
    return { has, lines };
}

function generateGrid() {
    for(let c=0; c<3; c++) {
        for(let r=0; r<3; r++) {
            grid[c][r] = getRandomSymbol();
        }
    }
    
    let ant = checkAnticipationForGrid(grid);
    if (ant.has && Math.random() < 0.6) {
        let line = ant.lines[0];
        let sym = line.symbol;
        if (sym === 'AGI' || sym === 'TENSOR') {
            let targetRow = line.rowOnReel2;
            if (grid[2][targetRow] === sym || grid[2][targetRow] === 'BUG') {
                grid[2][targetRow] = 'DATA';
            }
            let nearMissRow = targetRow === 0 ? 1 : targetRow - 1;
            grid[2][nearMissRow] = sym;
        }
    }
}

function updateTokens() {
    els.tokenCount.textContent = Math.floor(tokens);
    els.shopTokens.textContent = Math.floor(tokens);
    els.betAmount.textContent = currentBet;
    els.betSlider.value = currentBet;
    
    // Max slider dynamically updates based on tokens
    let maxBet = Math.max(100, Math.min(10000, Math.floor(tokens)));
    if (tokens < 10) maxBet = 10;
    els.betSlider.max = maxBet;
    
    if (currentBet > tokens && tokens >= 10) {
        currentBet = Math.floor(tokens / 10) * 10;
        els.betAmount.textContent = currentBet;
        els.betSlider.value = currentBet;
    }

    checkBankruptcy();
    renderShop();
}

function checkBankruptcy() {
    if (tokens < 10 && !isSpinning && freeSpins === 0) {
        els.resetTokensBtn.classList.remove('hidden');
    } else {
        els.resetTokensBtn.classList.add('hidden');
    }
}

function updateFreeSpins() {
    if (freeSpins > 0) {
        els.fsDisplay.classList.remove('hidden');
        els.fsCount.textContent = freeSpins;
        document.body.classList.add('free-spins');
    } else {
        els.fsDisplay.classList.add('hidden');
        document.body.classList.remove('free-spins');
    }
}

function botSpeak(msg) {
    if (upgrades.cosmetic.level > 0) {
        els.aiSpeech.textContent = msg;
    }
}

function updateBotIcon() {
    const lvl = upgrades.cosmetic.level;
    if (lvl === 0) {
        els.aiCosmetic.classList.add('hidden');
    } else {
        els.aiCosmetic.classList.remove('hidden');
        if (lvl === 1) els.aiBotIcon.textContent = "🤖";
        if (lvl === 2) els.aiBotIcon.textContent = "🦾";
        if (lvl === 3) els.aiBotIcon.textContent = "🧠";
    }
}

function drawNeonLines(wonLines) {
    els.paylinesOverlay.innerHTML = '';
    const svgRect = els.paylinesOverlay.getBoundingClientRect();
    
    wonLines.forEach(l => {
        const p = paylines[l];
        let coords = p.map(pos => {
            const cell = document.getElementById(`c${pos.c}-r${pos.r}`);
            const rect = cell.getBoundingClientRect();
            return {
                x: rect.left - svgRect.left + rect.width / 2,
                y: rect.top - svgRect.top + rect.height / 2
            };
        });
        
        let d = `M ${coords[0].x} ${coords[0].y} L ${coords[1].x} ${coords[1].y} L ${coords[2].x} ${coords[2].y}`;
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', d);
        path.setAttribute('stroke', document.body.classList.contains('free-spins') ? '#00ffff' : 'var(--neon-green)');
        path.setAttribute('stroke-width', '8');
        path.setAttribute('fill', 'none');
        path.setAttribute('filter', document.body.classList.contains('free-spins') ? 'drop-shadow(0 0 8px #00ffff)' : 'drop-shadow(0 0 10px var(--neon-green))');
        
        const anim = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
        anim.setAttribute('attributeName', 'opacity');
        anim.setAttribute('values', '1;0.3;1');
        anim.setAttribute('dur', '0.4s');
        anim.setAttribute('repeatCount', 'indefinite');
        path.appendChild(anim);
        
        els.paylinesOverlay.appendChild(path);
    });
}

function spinCol(col, duration, isAnticipation) {
    const colEl = document.getElementById(`col-${col}`);
    colEl.classList.add('spinning');
    
    // Disable manual stop during auto-spin to keep it fluid
    if(!autoSpinActive) {
        document.getElementById(`stop-${col}`).disabled = false;
    }
    
    let startTime = Date.now();
    let interval = 40;
    let timer;

    const symbolsArray = Object.keys(svgs);
    
    // Apply speed upgrade multiplier
    const speedMult = upgrades.speed.value;
    duration = duration / speedMult;

    function tick() {
        let now = Date.now();
        if (now - startTime > duration || stopRequested[col]) {
            stopCol(col);
            return;
        }
        
        if (isAnticipation) {
            let progress = (now - startTime) / duration;
            interval = 40 + progress * 100;
        }
        
        for(let r=0; r<3; r++) {
            document.getElementById(`c${col}-r${r}`).innerHTML = svgs[symbolsArray[Math.floor(Math.random() * symbolsArray.length)]];
        }
        
        playTone(300 + col*50, 'sine', 0.05, 0.02);
        timer = setTimeout(tick, interval);
    }
    tick();
}

function stopCol(col) {
    const colEl = document.getElementById(`col-${col}`);
    colEl.classList.remove('spinning');
    document.getElementById(`stop-${col}`).disabled = true;
    stopRequested[col] = true;
    
    for(let r=0; r<3; r++) {
        document.getElementById(`c${col}-r${r}`).innerHTML = svgs[grid[col][r]];
    }
    
    playTone(200, 'square', 0.1, 0.1);
    
    if (col === 2 && anticipationOsc) {
        anticipationOsc.stop();
        anticipationOsc = null;
    }
    
    activeReels--;
    if (activeReels === 0) {
        evaluateWin();
    }
}

function startAnticipationSound() {
    if(!audioCtx || globalVolume === 0) return;
    anticipationOsc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    anticipationOsc.connect(gain);
    gain.connect(audioCtx.destination);
    anticipationOsc.type = 'triangle';
    anticipationOsc.frequency.setValueAtTime(300, audioCtx.currentTime);
    anticipationOsc.frequency.linearRampToValueAtTime(1200, audioCtx.currentTime + 3);
    gain.gain.setValueAtTime(0.05 * globalVolume, audioCtx.currentTime);
    anticipationOsc.start();
}

function startSpin() {
    initAudio();
    if (isSpinning) {
        // Skip animation if not auto-spinning
        if(!autoSpinActive) {
            [0, 1, 2].forEach(col => { if(!stopRequested[col]) stopRequested[col] = true; });
        }
        return;
    }
    
    if (freeSpins === 0 && tokens < currentBet) {
        els.message.textContent = "Insufficient Compute Credits!";
        els.message.style.color = "var(--danger)";
        playSound('error');
        if(autoSpinActive) deactivateAutoSpin();
        return;
    }
    
    els.machineBorder.className = 'machine-border'; // Reset win tier classes
    
    if (freeSpins === 0) {
        tokens -= currentBet;
    } else {
        freeSpins--;
        updateFreeSpins();
    }
    
    updateTokens();
    els.paylinesOverlay.innerHTML = '';
    els.message.textContent = "Training in progress...";
    els.message.style.color = "var(--neon-blue)";
    botSpeak("Processing dataset...");
    
    isSpinning = true;
    stopRequested = [false, false, false];
    activeReels = 3;
    els.spinBtn.disabled = true;
    
    generateGrid();
    
    let ant = checkAnticipationForGrid(grid);
    let anticipation = ant.has;
    
    spinCol(0, 800, false);
    spinCol(1, 1300, false);
    spinCol(2, anticipation ? 3500 : 1800, anticipation);
    
    if (anticipation) {
        startAnticipationSound();
    }
}

function evaluateWin() {
    let totalWin = 0;
    let wonLines = [];
    let scatters = 0;
    
    for(let c=0; c<3; c++) {
        for(let r=0; r<3; r++) {
            if(grid[c][r] === 'PROMPT') scatters++;
        }
    }
    
    for(let i=0; i<paylines.length; i++) {
        let p = paylines[i];
        let s0 = grid[p[0].c][p[0].r];
        let s1 = grid[p[1].c][p[1].r];
        let s2 = grid[p[2].c][p[2].r];
        
        if (isMatch(s0, s1) && isMatch(s0, s2) && isMatch(s1, s2)) {
            let sym = s0;
            if (sym === 'BUG') sym = s1;
            if (sym === 'BUG') sym = s2;
            
            if (sym !== 'PROMPT' && sym !== 'BUG') {
                totalWin += currentBet * payTable[sym];
                wonLines.push(i);
            } else if (sym === 'BUG') {
                totalWin += currentBet * payTable['AGI'];
                wonLines.push(i);
            }
        }
    }
    
    if (document.body.classList.contains('free-spins')) totalWin *= 3;
    
    // Apply Yield Multiplier
    totalWin = Math.floor(totalWin * upgrades.money.value);
    
    if (totalWin > 0) {
        drawNeonLines(wonLines);
        let joke = winJokes[Math.floor(Math.random() * winJokes.length)];
        
        let multiplier = totalWin / currentBet;
        
        if (multiplier >= 20) {
            els.machineBorder.classList.add('win-tier-3');
            els.winTierText.textContent = "HYPER YIELD";
            botSpeak("JACKPOT! " + joke);
            triggerBigWin(totalWin, joke);
        } else if (multiplier >= 5) {
            els.machineBorder.classList.add('win-tier-2');
            tokens += totalWin;
            updateTokens();
            els.message.textContent = `High Yield! +${totalWin} Credits!`;
            els.message.style.color = "var(--gold)";
            botSpeak("Great efficiency! " + joke);
            playTone(600, 'square', 0.5, 0.1);
            finishEvaluation(scatters);
        } else {
            els.machineBorder.classList.add('win-tier-1');
            tokens += totalWin;
            updateTokens();
            els.message.textContent = `Won ${totalWin}!`;
            els.message.style.color = "var(--success)";
            botSpeak("Marginal gains.");
            playTone(500, 'sine', 0.3, 0.1);
            finishEvaluation(scatters);
        }
    } else {
        let joke = lossJokes[Math.floor(Math.random() * lossJokes.length)];
        els.message.textContent = joke;
        els.message.style.color = "var(--text-color)";
        botSpeak(joke);
        finishEvaluation(scatters);
    }
}

function finishEvaluation(scatters) {
    if (scatters >= 3) {
        setTimeout(triggerFreeSpinsMode, 500);
    } else {
        resumeOrEndSpin();
    }
}

function resumeOrEndSpin() {
    isSpinning = false;
    els.spinBtn.disabled = false;
    checkBankruptcy();
    
    if (autoSpinActive) {
        setTimeout(() => {
            if(autoSpinActive) startSpin();
        }, 500); // Short delay between auto spins
    }
}

function triggerFreeSpinsMode() {
    freeSpins += 10;
    updateFreeSpins();
    els.message.textContent = "OVERRIDE PROTOCOL: FREE SPINS TRIGGERED!";
    els.message.style.color = "var(--neon-pink)";
    
    if(audioCtx && globalVolume > 0) {
        let osc = audioCtx.createOscillator();
        let gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(400, audioCtx.currentTime);
        osc.frequency.linearRampToValueAtTime(800, audioCtx.currentTime + 1);
        gain.gain.setValueAtTime(0.1 * globalVolume, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1);
        osc.start();
        osc.stop(audioCtx.currentTime + 1);
    }
    
    setTimeout(resumeOrEndSpin, 1500);
}

// Particle System setup
const canvas = document.getElementById('particles-canvas');
const ctx = canvas.getContext('2d');
let particles = [];
let animFrame;

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function spawnParticle() {
    particles.push({
        x: Math.random() * canvas.width,
        y: -20,
        vx: (Math.random() - 0.5) * 10,
        vy: Math.random() * 8 + 8,
        rot: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 0.5,
        color: Math.random() > 0.5 ? '#22c55e' : '#ff00ff',
        size: Math.random() * 15 + 5
    });
}

function updateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        
        // Draw binary/tech symbols instead of circles
        ctx.font = `bold ${p.size}px monospace`;
        ctx.fillText(Math.random() > 0.5 ? "1" : "0", 0, 0);
        
        ctx.restore();
        
        if (p.y > canvas.height + 20) particles.splice(i, 1);
    }
    animFrame = requestAnimationFrame(updateParticles);
}

function triggerBigWin(amount, joke) {
    els.bigWinOverlay.classList.add('active');
    updateParticles();
    
    let roll = 0;
    let duration = 3000;
    let startTime = Date.now();
    
    let osc = null;
    let gain = null;
    if(audioCtx && globalVolume > 0) {
        osc = audioCtx.createOscillator();
        gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 3);
        gain.gain.setValueAtTime(0.1 * globalVolume, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 3);
    }

    let particleInterval = setInterval(spawnParticle, 10);

    function tick() {
        let now = Date.now();
        let p = (now - startTime) / duration;
        if (p >= 1) {
            els.rollupCounter.textContent = amount;
            clearInterval(particleInterval);
            setTimeout(() => {
                els.bigWinOverlay.classList.remove('active');
                cancelAnimationFrame(animFrame);
                particles = [];
                tokens += amount;
                updateTokens();
                els.message.textContent = `HYPER YIELD! +${amount} CREDITS!`;
                els.message.style.color = "var(--neon-pink)";
                
                let scatters = 0;
                for(let c=0; c<3; c++) for(let r=0; r<3; r++) if(grid[c][r] === 'PROMPT') scatters++;
                finishEvaluation(scatters);
            }, 3000);
            return;
        }
        roll = Math.floor(amount * p);
        els.rollupCounter.textContent = roll;
        requestAnimationFrame(tick);
    }
    tick();
}

// Shop Logic
function getCost(upgrade) {
    return Math.floor(upgrade.baseCost * Math.pow(upgrade.costMult, upgrade.level));
}

function renderShop() {
    els.shopGrid.innerHTML = '';
    
    for (const key in upgrades) {
        const u = upgrades[key];
        const isMax = u.level >= u.maxLevel;
        const cost = getCost(u);
        const canAfford = tokens >= cost;
        
        const div = document.createElement('div');
        div.className = 'shop-item';
        div.innerHTML = `
            <div class="shop-info">
                <div class="shop-title">${u.name}</div>
                <div class="shop-desc">${u.desc}</div>
                <div class="shop-level">Level: ${u.level}/${u.maxLevel}</div>
            </div>
            <button class="btn-small buy-btn" data-key="${key}" ${isMax || !canAfford ? 'disabled' : ''}>
                ${isMax ? 'MAXED' : 'Cost: ' + cost}
            </button>
        `;
        els.shopGrid.appendChild(div);
    }
    
    document.querySelectorAll('.buy-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const key = e.target.getAttribute('data-key');
            buyUpgrade(key);
        });
    });
}

function buyUpgrade(key) {
    const u = upgrades[key];
    const cost = getCost(u);
    
    if (tokens >= cost && u.level < u.maxLevel) {
        tokens -= cost;
        u.level++;
        u.value += u.valueStep;
        
        playSound('buy');
        updateTokens();
        
        // Apply specific upgrade effects
        if (key === 'cosmetic') {
            updateBotIcon();
            botSpeak("System upgraded. Efficiency improved.");
        } else if (key === 'autospin') {
            els.autoSpinContainer.classList.remove('hidden');
        } else if (key === 'passive') {
            if(passiveIncomeInterval) clearInterval(passiveIncomeInterval);
            passiveIncomeInterval = setInterval(() => {
                tokens += u.value;
                updateTokens();
            }, 1000);
        }
    }
}

// Auto Spin Logic
function startAutoSpinCooldown() {
    autoSpinCooldown = COOLDOWN_MAX;
    els.autoSpinBtn.disabled = true;
    els.autoSpinBtn.style.background = '#475569';
    els.autoSpinFill.style.width = '0%';
    els.autoSpinProgress.classList.add('hidden');
    
    let cdTimer = setInterval(() => {
        autoSpinCooldown--;
        els.autoSpinBtn.textContent = `COOLDOWN (${autoSpinCooldown}s)`;
        
        if(autoSpinCooldown <= 0) {
            clearInterval(cdTimer);
            els.autoSpinBtn.disabled = false;
            els.autoSpinBtn.style.background = '';
            els.autoSpinBtn.textContent = "AUTO-TRAIN (Ready)";
        }
    }, 1000);
}

function deactivateAutoSpin() {
    autoSpinActive = false;
    clearInterval(autoSpinTimer);
    els.autoSpinBtn.textContent = "HALTING...";
    els.autoSpinProgress.classList.add('hidden');
    startAutoSpinCooldown();
}

els.autoSpinBtn.addEventListener('click', () => {
    playSound('click');
    if(autoSpinActive) {
        deactivateAutoSpin();
        return;
    }
    
    if (tokens < currentBet) {
        playSound('error');
        els.message.textContent = "Need more credits to auto-train!";
        return;
    }

    autoSpinActive = true;
    els.autoSpinBtn.textContent = "STOP AUTO-TRAIN";
    els.autoSpinBtn.style.background = '#dc2626';
    
    // Progress bar for the duration
    els.autoSpinContainer.querySelector('.progress-bar').classList.remove('hidden');
    let timeLeft = autoSpinDuration;
    els.autoSpinFill.style.width = '100%';
    
    autoSpinTimer = setInterval(() => {
        timeLeft -= 0.1;
        els.autoSpinFill.style.width = `${(timeLeft / autoSpinDuration) * 100}%`;
        
        if (timeLeft <= 0 || tokens < currentBet) {
            deactivateAutoSpin();
        }
    }, 100);
    
    if(!isSpinning) startSpin();
});

// Controls
els.spinBtn.addEventListener('click', () => {
    playSound('click');
    startSpin();
});

els.betSlider.addEventListener('input', (e) => {
    if(!isSpinning) {
        currentBet = parseInt(e.target.value);
        els.betAmount.textContent = currentBet;
        playSound('slider');
    } else {
        e.target.value = currentBet; // Prevent changing while spinning
    }
});

document.getElementById('bet-max').addEventListener('click', () => {
    playSound('click');
    if(!isSpinning) { 
        currentBet = Math.max(10, Math.floor(tokens)); 
        updateTokens(); 
    }
});

document.getElementById('volume-slider').addEventListener('input', (e) => {
    globalVolume = parseFloat(e.target.value);
    playSound('slider');
});

[0, 1, 2].forEach(col => {
    document.getElementById(`stop-${col}`).addEventListener('click', () => {
        playSound('click');
        if (isSpinning && !stopRequested[col]) {
            stopRequested[col] = true;
        }
    });
});

els.resetTokensBtn.addEventListener('click', () => {
    playSound('reset');
    tokens = 1000;
    updateTokens();
    els.message.textContent = "SYSTEM REBOOTED. CREDITS RESTORED.";
    els.message.style.color = "var(--neon-green)";
    botSpeak("Fresh instance loaded.");
});

// Modals
document.getElementById('shop-btn').addEventListener('click', () => {
    playSound('click');
    document.getElementById('shop-modal').classList.remove('hidden');
    renderShop();
});
document.getElementById('close-shop').addEventListener('click', () => {
    playSound('click');
    document.getElementById('shop-modal').classList.add('hidden');
});

document.getElementById('payout-btn').addEventListener('click', () => {
    playSound('click');
    document.getElementById('payout-modal').classList.remove('hidden');
});
document.getElementById('close-payout').addEventListener('click', () => {
    playSound('click');
    document.getElementById('payout-modal').classList.add('hidden');
});

// Init
window.addEventListener('resize', () => {
    if (!isSpinning) els.paylinesOverlay.innerHTML = '';
});

for(let c=0; c<3; c++) {
    for(let r=0; r<3; r++) {
        document.getElementById(`c${c}-r${r}`).innerHTML = svgs['AGI']; 
        grid[c][r] = 'AGI'; 
    }
}
updateTokens();
