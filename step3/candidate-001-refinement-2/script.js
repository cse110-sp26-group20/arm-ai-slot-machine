const svgs = {
    '7': `<svg viewBox="0 0 100 100"><text x="50" y="75" font-size="70" text-anchor="middle" fill="#ff003c" filter="drop-shadow(0 0 5px #ff003c)">7</text></svg>`,
    'BAR': `<svg viewBox="0 0 100 100"><rect x="10" y="30" width="80" height="40" fill="#00ffcc" rx="5" filter="drop-shadow(0 0 5px #00ffcc)"/><text x="50" y="58" font-size="28" text-anchor="middle" fill="#000" font-weight="bold">BAR</text></svg>`,
    'BELL': `<svg viewBox="0 0 100 100"><path d="M20,70 L80,70 L70,40 C70,20 30,20 30,40 Z" fill="#ffd700" filter="drop-shadow(0 0 5px #ffd700)"/><circle cx="50" cy="85" r="10" fill="#ffd700"/></svg>`,
    'DIAMOND': `<svg viewBox="0 0 100 100"><polygon points="50,10 90,40 50,90 10,40" fill="#00aaff" filter="drop-shadow(0 0 5px #00aaff)"/></svg>`,
    'CHERRY': `<svg viewBox="0 0 100 100"><circle cx="35" cy="70" r="20" fill="#ff0055" filter="drop-shadow(0 0 5px #ff0055)"/><circle cx="75" cy="65" r="20" fill="#ff0055" filter="drop-shadow(0 0 5px #ff0055)"/><path d="M35,50 C35,20 55,10 55,10 C55,10 75,20 75,45" stroke="#00ff00" stroke-width="6" fill="none"/></svg>`,
    'WILD': `<svg viewBox="0 0 100 100"><text x="50" y="65" font-size="28" text-anchor="middle" fill="#ff00ff" font-weight="bold" filter="drop-shadow(0 0 10px #ff00ff)">WILD</text></svg>`,
    'SCATTER': `<svg viewBox="0 0 100 100"><polygon points="50,10 60,35 90,40 65,60 75,90 50,75 25,90 35,60 10,40 40,35" fill="#ffaa00" filter="drop-shadow(0 0 10px #ffaa00)"/><text x="50" y="55" font-size="16" text-anchor="middle" fill="#000" font-weight="bold">SCAT</text></svg>`
};

const symbolWeights = {
    '7': 5,
    'BAR': 10,
    'BELL': 15,
    'DIAMOND': 20,
    'CHERRY': 25,
    'WILD': 5,
    'SCATTER': 6
};

const totalWeight = Object.values(symbolWeights).reduce((a, b) => a + b, 0);

const payTable = {
    '7': 50,
    'BAR': 20,
    'BELL': 10,
    'DIAMOND': 5,
    'CHERRY': 2
};

const paylines = [
    [{c:0, r:1}, {c:1, r:1}, {c:2, r:1}], // 0: middle
    [{c:0, r:0}, {c:1, r:0}, {c:2, r:0}], // 1: top
    [{c:0, r:2}, {c:1, r:2}, {c:2, r:2}], // 2: bottom
    [{c:0, r:0}, {c:1, r:1}, {c:2, r:2}], // 3: diag 1
    [{c:0, r:2}, {c:1, r:1}, {c:2, r:0}]  // 4: diag 2
];

let tokens = 1000;
let currentBet = 10;
let isSpinning = false;
let grid = [[],[],[]];
let stopRequested = [false, false, false];
let activeReels = 0;
let freeSpins = 0;
let audioCtx;
let anticipationOsc = null;

const els = {
    tokenCount: document.getElementById('token-count'),
    betAmount: document.getElementById('bet-amount'),
    message: document.getElementById('message'),
    spinBtn: document.getElementById('spin-btn'),
    paylinesOverlay: document.getElementById('paylines-overlay'),
    bigWinOverlay: document.getElementById('big-win-overlay'),
    rollupCounter: document.getElementById('rollup-counter'),
    fsDisplay: document.getElementById('fs-display'),
    fsCount: document.getElementById('fs-count')
};

function initAudio() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
}

function playTone(freq, type, duration, vol = 0.1) {
    if(!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(vol, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
}

function getRandomSymbol() {
    let r = Math.random() * totalWeight;
    for (let s in symbolWeights) {
        if (r < symbolWeights[s]) return s;
        r -= symbolWeights[s];
    }
    return 'CHERRY';
}

function isMatch(s1, s2) {
    return s1 === s2 || s1 === 'WILD' || s2 === 'WILD';
}

function checkAnticipationForGrid(g) {
    let has = false;
    let lines = [];
    for(let i=0; i<paylines.length; i++) {
        let p = paylines[i];
        let s0 = g[p[0].c][p[0].r];
        let s1 = g[p[1].c][p[1].r];
        if (isMatch(s0, s1) && s0 !== 'SCATTER' && s1 !== 'SCATTER') {
            has = true;
            lines.push({ lineIndex: i, symbol: s0 === 'WILD' ? s1 : s0, rowOnReel2: p[2].r });
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
    
    // Near Miss Injection Logic
    let ant = checkAnticipationForGrid(grid);
    if (ant.has && Math.random() < 0.6) {
        let line = ant.lines[0];
        let sym = line.symbol;
        if (sym === '7' || sym === 'BAR') {
            let targetRow = line.rowOnReel2;
            // Prevent actual win on that line
            if (grid[2][targetRow] === sym || grid[2][targetRow] === 'WILD') {
                grid[2][targetRow] = 'CHERRY';
            }
            // Put sym adjacent to create a "Near Miss"
            let nearMissRow = targetRow === 0 ? 1 : targetRow - 1;
            grid[2][nearMissRow] = sym;
        }
    }
}

function updateTokens() {
    els.tokenCount.textContent = tokens;
    els.betAmount.textContent = currentBet;
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

function drawNeonLines(wonLines) {
    els.paylinesOverlay.innerHTML = '';
    const colXs = ['16.66%', '50%', '83.33%'];
    const rowYs = ['16.66%', '50%', '83.33%'];
    
    wonLines.forEach(l => {
        const p = paylines[l];
        let d = `M ${colXs[p[0].c]} ${rowYs[p[0].r]} L ${colXs[p[1].c]} ${rowYs[p[1].r]} L ${colXs[p[2].c]} ${rowYs[p[2].r]}`;
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', d);
        path.setAttribute('stroke', document.body.classList.contains('free-spins') ? '#00ffff' : 'var(--neon-pink)');
        path.setAttribute('stroke-width', '8');
        path.setAttribute('fill', 'none');
        path.setAttribute('filter', document.body.classList.contains('free-spins') ? 'drop-shadow(0 0 8px #00ffff)' : 'drop-shadow(0 0 8px var(--neon-pink))');
        
        const anim = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
        anim.setAttribute('attributeName', 'opacity');
        anim.setAttribute('values', '1;0.5;1');
        anim.setAttribute('dur', '0.5s');
        anim.setAttribute('repeatCount', 'indefinite');
        path.appendChild(anim);
        
        els.paylinesOverlay.appendChild(path);
    });
}

function spinCol(col, duration, isAnticipation) {
    const colEl = document.getElementById(`col-${col}`);
    colEl.classList.add('spinning');
    document.getElementById(`stop-${col}`).disabled = false;
    
    let startTime = Date.now();
    let interval = 50;
    let timer;

    const symbolsArray = Object.keys(svgs);

    function tick() {
        let now = Date.now();
        if (now - startTime > duration || stopRequested[col]) {
            stopCol(col);
            return;
        }
        
        if (isAnticipation) {
            let progress = (now - startTime) / duration;
            interval = 50 + progress * 150; // Slow down over time
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
    
    playTone(150, 'square', 0.1, 0.1);
    
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
    if(!audioCtx) return;
    anticipationOsc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    anticipationOsc.connect(gain);
    gain.connect(audioCtx.destination);
    anticipationOsc.type = 'triangle';
    anticipationOsc.frequency.setValueAtTime(300, audioCtx.currentTime);
    anticipationOsc.frequency.linearRampToValueAtTime(1200, audioCtx.currentTime + 3); // 3 seconds longer
    gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
    anticipationOsc.start();
}

function startSpin() {
    initAudio();
    if (isSpinning) return;
    if (freeSpins === 0 && tokens < currentBet) {
        els.message.textContent = "Not enough credits!";
        els.message.style.color = "var(--danger)";
        return;
    }
    
    if (freeSpins === 0) {
        tokens -= currentBet;
    } else {
        freeSpins--;
        updateFreeSpins();
    }
    
    updateTokens();
    els.paylinesOverlay.innerHTML = '';
    els.message.textContent = "Good luck!";
    els.message.style.color = "var(--text-color)";
    
    isSpinning = true;
    stopRequested = [false, false, false];
    activeReels = 3;
    els.spinBtn.disabled = true;
    
    generateGrid();
    
    let ant = checkAnticipationForGrid(grid);
    let anticipation = ant.has;
    
    spinCol(0, 1000, false);
    spinCol(1, 1500, false);
    spinCol(2, anticipation ? 4500 : 2000, anticipation);
    
    if (anticipation) {
        startAnticipationSound();
    }
}

function evaluateWin() {
    isSpinning = false;
    els.spinBtn.disabled = false;
    
    let totalWin = 0;
    let wonLines = [];
    let scatters = 0;
    
    for(let c=0; c<3; c++) {
        for(let r=0; r<3; r++) {
            if(grid[c][r] === 'SCATTER') scatters++;
        }
    }
    
    for(let i=0; i<paylines.length; i++) {
        let p = paylines[i];
        let s0 = grid[p[0].c][p[0].r];
        let s1 = grid[p[1].c][p[1].r];
        let s2 = grid[p[2].c][p[2].r];
        
        if (isMatch(s0, s1) && isMatch(s0, s2) && isMatch(s1, s2)) {
            let sym = s0;
            if (sym === 'WILD') sym = s1;
            if (sym === 'WILD') sym = s2;
            
            if (sym !== 'SCATTER' && sym !== 'WILD') {
                totalWin += currentBet * payTable[sym];
                wonLines.push(i);
            } else if (sym === 'WILD') {
                totalWin += currentBet * payTable['7'];
                wonLines.push(i);
            }
        }
    }
    
    if (document.body.classList.contains('free-spins')) {
        totalWin *= 3;
    }
    
    if (totalWin > 0) {
        drawNeonLines(wonLines);
        if (totalWin >= currentBet * 10) {
            triggerBigWin(totalWin);
        } else {
            tokens += totalWin;
            updateTokens();
            els.message.textContent = `Won ${totalWin} credits!`;
            els.message.style.color = "var(--success)";
            playTone(600, 'square', 0.5, 0.1);
            
            // Allow scatter check after small win display
            if (scatters >= 3) {
                setTimeout(triggerFreeSpinsMode, 1500);
            }
        }
    } else {
        els.message.textContent = "Try again!";
        els.message.style.color = "var(--text-color)";
        if (scatters >= 3) {
            setTimeout(triggerFreeSpinsMode, 500);
        }
    }
}

function triggerFreeSpinsMode() {
    freeSpins += 10;
    updateFreeSpins();
    els.message.textContent = "FREE SPINS TRIGGERED!";
    els.message.style.color = "var(--neon-pink)";
    
    if(!audioCtx) return;
    let osc = audioCtx.createOscillator();
    let gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(400, audioCtx.currentTime);
    osc.frequency.linearRampToValueAtTime(800, audioCtx.currentTime + 1);
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1);
    osc.start();
    osc.stop(audioCtx.currentTime + 1);
}

// Controls
els.spinBtn.addEventListener('click', startSpin);

document.getElementById('bet-up').addEventListener('click', () => {
    initAudio();
    if(!isSpinning && currentBet < tokens) { currentBet += 10; updateTokens(); }
});
document.getElementById('bet-down').addEventListener('click', () => {
    initAudio();
    if(!isSpinning && currentBet > 10) { currentBet -= 10; updateTokens(); }
});
document.getElementById('bet-max').addEventListener('click', () => {
    initAudio();
    if(!isSpinning) { currentBet = Math.max(10, tokens); updateTokens(); }
});

[0, 1, 2].forEach(col => {
    document.getElementById(`stop-${col}`).addEventListener('click', () => {
        initAudio();
        if (isSpinning && !stopRequested[col]) {
            stopRequested[col] = true;
        }
    });
});

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
        vx: (Math.random() - 0.5) * 8,
        vy: Math.random() * 5 + 8,
        rot: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 0.4,
        color: Math.random() > 0.5 ? '#ffd700' : '#ffaa00'
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
        ctx.beginPath();
        ctx.arc(0, 0, 12, 0, Math.PI*2);
        ctx.fill();
        ctx.fillStyle = '#ffea70';
        ctx.beginPath();
        ctx.arc(0, 0, 8, 0, Math.PI*2);
        ctx.fill();
        ctx.restore();
        
        if (p.y > canvas.height + 20) particles.splice(i, 1);
    }
    animFrame = requestAnimationFrame(updateParticles);
}

function triggerBigWin(amount) {
    els.bigWinOverlay.classList.add('active');
    updateParticles();
    
    let roll = 0;
    let duration = 3000;
    let startTime = Date.now();
    
    // Escalating sound
    let osc = null;
    let gain = null;
    if(audioCtx) {
        osc = audioCtx.createOscillator();
        gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1000, audioCtx.currentTime + 3);
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 3);
    }

    let particleInterval = setInterval(spawnParticle, 15);

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
                els.message.textContent = `BIG WIN! ${amount} credits!`;
                els.message.style.color = "var(--gold)";
                
                // Scatter check after Big Win
                let scatters = 0;
                for(let c=0; c<3; c++) for(let r=0; r<3; r++) if(grid[c][r] === 'SCATTER') scatters++;
                if (scatters >= 3) {
                    setTimeout(triggerFreeSpinsMode, 1000);
                }
            }, 3000);
            return;
        }
        roll = Math.floor(amount * p);
        els.rollupCounter.textContent = roll;
        requestAnimationFrame(tick);
    }
    tick();
}

// Initial placeholders and display setup
for(let c=0; c<3; c++) {
    for(let r=0; r<3; r++) {
        document.getElementById(`c${c}-r${r}`).innerHTML = svgs['7']; 
        grid[c][r] = '7'; 
    }
}
updateTokens();
