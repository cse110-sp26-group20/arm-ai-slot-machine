const symbolsData = {
    'WILD': { mult3: 0, mult2: 0, msg: 'WILD!' },
    'SCATTER': { mult3: 0, mult2: 0, msg: 'FREE SPINS!' },
    'AGI': { mult3: 100, mult2: 10, msg: 'AGI ACHIEVED!' },
    'GPU': { mult3: 50, mult2: 5, msg: 'H100 ACQUIRED!' },
    'DATA': { mult3: 20, mult2: 2, msg: 'DATA SCRAPED!' },
    'BUG': { mult3: 5, mult2: 0, msg: 'MINOR BUG FIXED.' }
};

const svgs = {
    'WILD': `<svg viewBox="0 0 100 100" width="100%" height="100%"><polygon points="50,15 61,35 85,35 66,50 73,75 50,60 27,75 34,50 15,35 39,35" fill="#facc15" stroke="#fff" stroke-width="2" filter="drop-shadow(0 0 10px #facc15)"/><text x="50" y="55" text-anchor="middle" fill="#fff" font-size="20" font-weight="900" font-family="sans-serif">WILD</text></svg>`,
    'SCATTER': `<svg viewBox="0 0 100 100" width="100%" height="100%"><circle cx="50" cy="50" r="35" fill="none" stroke="#06b6d4" stroke-width="6" filter="drop-shadow(0 0 12px #06b6d4)"/><polygon points="50,25 60,45 40,45" fill="#06b6d4"/><polygon points="50,75 40,55 60,55" fill="#06b6d4"/><text x="50" y="55" text-anchor="middle" fill="#fff" font-size="16" font-weight="bold" font-family="sans-serif">FREE</text></svg>`,
    'AGI': `<svg viewBox="0 0 100 100" width="100%" height="100%"><path d="M50 15 C20 15 20 50 50 85 C80 50 80 15 50 15 Z" fill="none" stroke="#ef4444" stroke-width="6" filter="drop-shadow(0 0 15px #ef4444)"/><circle cx="50" cy="40" r="10" fill="#ef4444"/></svg>`,
    'GPU': `<svg viewBox="0 0 100 100" width="100%" height="100%"><rect x="25" y="20" width="50" height="60" rx="5" fill="none" stroke="#10b981" stroke-width="6" filter="drop-shadow(0 0 12px #10b981)"/><line x1="25" y1="40" x2="75" y2="40" stroke="#10b981" stroke-width="4"/><line x1="25" y1="60" x2="75" y2="60" stroke="#10b981" stroke-width="4"/></svg>`,
    'DATA': `<svg viewBox="0 0 100 100" width="100%" height="100%"><ellipse cx="50" cy="30" rx="30" ry="12" fill="none" stroke="#8b5cf6" stroke-width="6" filter="drop-shadow(0 0 10px #8b5cf6)"/><path d="M20 30 v40 a30 12 0 0 0 60 0 v-40" fill="none" stroke="#8b5cf6" stroke-width="6"/></svg>`,
    'BUG': `<svg viewBox="0 0 100 100" width="100%" height="100%"><circle cx="50" cy="50" r="25" fill="none" stroke="#f97316" stroke-width="6" filter="drop-shadow(0 0 8px #f97316)"/><line x1="25" y1="25" x2="75" y2="75" stroke="#f97316" stroke-width="6"/><line x1="75" y1="25" x2="25" y2="75" stroke="#f97316" stroke-width="6"/></svg>`
};

const paylinesList = [
    [[0,1], [1,1], [2,1]], // Middle
    [[0,0], [1,0], [2,0]], // Top
    [[0,2], [1,2], [2,2]], // Bottom
    [[0,0], [1,1], [2,2]], // Diag Down
    [[0,2], [1,1], [2,0]]  // Diag Up
];

let tokens = 10000;
let betAmount = 500;
let isSpinning = false;
let freeSpins = 0;
let freeSpinsMultiplier = 1;

let grid = [
    [null, null, null],
    [null, null, null],
    [null, null, null]
];

let reels = [];
let reelsY = [0, 0, 0];
let reelsState = ['idle', 'idle', 'idle'];
let reelAutoStopTime = [0, 0, 0];
let lastTime = 0;
let rafId = null;

const getSymH = () => {
    const sym = document.querySelector('.symbol');
    return sym ? sym.clientHeight : 110;
};

// --- AUDIO (Web Audio API) ---
let audioCtx;
function initAudio() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
}

function playTone(freq, type, duration, vol) {
    if (!audioCtx) return;
    try {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        gain.gain.setValueAtTime(vol, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + duration);
    } catch(e) {}
}

let spinAudioInterval;
function startSpinAudio() {
    initAudio();
    let tick = 0;
    clearInterval(spinAudioInterval);
    spinAudioInterval = setInterval(() => {
        playTone(300 + (tick % 2) * 100, 'square', 0.05, 0.02);
        tick++;
    }, 120);
}
function stopSpinAudio() {
    clearInterval(spinAudioInterval);
}

let anticipationInterval;
function playAnticipationSound() {
    initAudio();
    let freq = 200;
    clearInterval(anticipationInterval);
    anticipationInterval = setInterval(() => {
        playTone(freq, 'sawtooth', 0.1, 0.05);
        freq *= 1.08; 
        if(freq > 2000) freq = 200;
    }, 100);
}
function stopAnticipationSound() {
    clearInterval(anticipationInterval);
}

function playWinSound(tier) {
    initAudio();
    if(tier === 1) {
        playTone(523.25, 'sine', 0.2, 0.1); 
        setTimeout(() => playTone(659.25, 'sine', 0.4, 0.1), 150); 
    } else if (tier === 2) {
        playTone(523.25, 'triangle', 0.2, 0.1);
        setTimeout(() => playTone(659.25, 'triangle', 0.2, 0.1), 150);
        setTimeout(() => playTone(783.99, 'triangle', 0.4, 0.1), 300);
    }
}

function playLoseSound() {
    initAudio();
    playTone(200, 'sawtooth', 0.3, 0.1);
    setTimeout(() => playTone(150, 'sawtooth', 0.5, 0.1), 200);
}

// --- DOM / GRID FUNCTIONS ---
function createSymbol(symName) {
    const div = document.createElement('div');
    div.className = 'symbol';
    div.innerHTML = svgs[symName] || '';
    div.dataset.symbol = symName;
    return div;
}

function getRandomSymbol(exclude = null) {
    const pool = ['AGI', 'GPU', 'DATA', 'BUG', 'BUG', 'BUG', 'DATA', 'WILD', 'SCATTER'];
    let sym = pool[Math.floor(Math.random()*pool.length)];
    while(sym === exclude) sym = pool[Math.floor(Math.random()*pool.length)];
    return sym;
}

function createRandomSymbol() {
    return createSymbol(getRandomSymbol());
}

function replaceSymbol(node, symName) {
    if(!node) return;
    node.innerHTML = svgs[symName];
    node.dataset.symbol = symName;
}

function generateGrid() {
    let newGrid = [
        [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()],
        [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()],
        [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()]
    ];
    
    const rand = Math.random();
    if (rand < 0.1) {
        // Force Win
        const lineIdx = Math.floor(Math.random() * 5);
        const sym = ['AGI', 'GPU', 'DATA'][Math.floor(Math.random() * 3)];
        const line = paylinesList[lineIdx];
        newGrid[line[0][0]][line[0][1]] = sym;
        newGrid[line[1][0]][line[1][1]] = sym;
        newGrid[line[2][0]][line[2][1]] = sym;
    } else if (rand < 0.25) {
        // Force Near Miss
        const lineIdx = Math.floor(Math.random() * 5);
        const sym = ['AGI', 'GPU'][Math.floor(Math.random() * 2)];
        const line = paylinesList[lineIdx];
        newGrid[line[0][0]][line[0][1]] = sym;
        newGrid[line[1][0]][line[1][1]] = sym;
        
        const r3 = line[2][1];
        let offRow = r3 === 0 ? 1 : (r3 === 2 ? 1 : (Math.random()>0.5?0:2));
        newGrid[2][offRow] = sym;
        while (newGrid[2][r3] === sym || newGrid[2][r3] === 'WILD') {
            newGrid[2][r3] = getRandomSymbol();
        }
    } else if (rand < 0.35) {
        // Force Scatters
        let placed = 0;
        while(placed < 3) {
            let c = Math.floor(Math.random()*3);
            let r = Math.floor(Math.random()*3);
            if(newGrid[c][r] !== 'SCATTER') {
                newGrid[c][r] = 'SCATTER';
                placed++;
            }
        }
    }
    return newGrid;
}

function updateDisplay() {
    document.getElementById('token-count').textContent = tokens;
    
    const fsBox = document.getElementById('free-spins-box');
    if(freeSpins > 0) {
        fsBox.style.display = 'flex';
        document.getElementById('free-spins-count').textContent = freeSpins;
    } else {
        fsBox.style.display = 'none';
    }
    
    if (tokens < betAmount && freeSpins === 0) {
        document.getElementById('spin-btn').disabled = true;
        document.getElementById('reset-btn').classList.remove('hidden');
    } else {
        document.getElementById('spin-btn').disabled = false;
        if(tokens >= betAmount) document.getElementById('reset-btn').classList.add('hidden');
    }
}

function showMessage(msg, type = "") {
    const el = document.getElementById('message');
    el.textContent = msg;
    el.className = `message ${type}`;
}

// --- SPIN LOGIC ---
function spin() {
    if (isSpinning) return;
    if (freeSpins === 0 && tokens < betAmount) {
        showMessage("Not enough tokens!", "error");
        return;
    }
    
    initAudio();
    isSpinning = true;
    
    if (freeSpins > 0) {
        freeSpins--;
        showMessage(`Free Spin! (${freeSpins} remaining) Multiplier: ${freeSpinsMultiplier}x`, "win");
    } else {
        tokens -= betAmount;
        updateDisplay();
        showMessage("Spinning...", "");
    }
    
    grid = generateGrid();
    
    for(let col=0; col<3; col++) {
        reels[col].innerHTML = '';
        reelsY[col] = 0;
        reelsState[col] = 'spinning';
        reels[col].style.transition = 'none';
        reels[col].style.transform = `translateY(0)`;
        
        // Initial pool
        for(let i=0; i<60; i++) reels[col].appendChild(createRandomSymbol());
        
        document.getElementById(`stop-${col}`).disabled = false;
        reelAutoStopTime[col] = performance.now() + 1000 + col*500;
    }
    
    document.querySelectorAll('.payline').forEach(el => el.classList.remove('active'));
    
    lastTime = performance.now();
    rafId = requestAnimationFrame(spinReels);
    startSpinAudio();
}

function spinReels(timestamp) {
    if (!lastTime) lastTime = timestamp;
    const dt = timestamp - lastTime;
    lastTime = timestamp;

    let allStopped = true;
    const symH = getSymH();

    for (let col = 0; col < 3; col++) {
        if (reelsState[col] === 'spinning' || reelsState[col] === 'anticipation') {
            allStopped = false;
            
            let speed = reelsState[col] === 'anticipation' ? 1.2 : 3.5; 
            reelsY[col] -= speed * dt;
            
            reels[col].style.transform = `translateY(${reelsY[col]}px)`;
            
            // Append more dynamically so we never run out of DOM nodes
            const currentIdx = Math.floor(Math.abs(reelsY[col]) / symH);
            while (reels[col].children.length < currentIdx + 15) {
                reels[col].appendChild(createRandomSymbol());
            }
            
            if (timestamp > reelAutoStopTime[col]) {
                initiateStop(col);
            }
        } else if (reelsState[col] === 'stopping') {
            allStopped = false;
        }
    }

    if (!allStopped) {
        rafId = requestAnimationFrame(spinReels);
    }
}

function initiateStop(col) {
    if (reelsState[col] !== 'spinning' && reelsState[col] !== 'anticipation') return;
    
    document.getElementById(`stop-${col}`).disabled = true;
    if (reelsState[col] === 'anticipation') stopAnticipationSound();
    
    reelsState[col] = 'stopping';
    playTone(300, 'square', 0.1, 0.1); 
    
    const symH = getSymH();
    const currentY = Math.abs(reelsY[col]);
    const currentIndex = Math.floor(currentY / symH);
    const targetIndex = currentIndex + 4; 
    
    while(reels[col].children.length <= targetIndex + 3) {
        reels[col].appendChild(createRandomSymbol());
    }
    
    replaceSymbol(reels[col].children[targetIndex], grid[col][0]);
    replaceSymbol(reels[col].children[targetIndex+1], grid[col][1]);
    replaceSymbol(reels[col].children[targetIndex+2], grid[col][2]);
    
    reels[col].style.transition = 'transform 0.4s cubic-bezier(0.1, 0.7, 0.1, 1)';
    reels[col].style.transform = `translateY(-${targetIndex * symH}px)`;
    
    setTimeout(() => { reelStopped(col); }, 400);
}

function reelStopped(col) {
    reelsState[col] = 'idle';
    playTone(150, 'sawtooth', 0.15, 0.2);
    
    if (col === 1) { 
        if (isWinPossible() && reelsState[2] === 'spinning') {
            reelsState[2] = 'anticipation';
            reelAutoStopTime[2] = performance.now() + 3000;
            document.getElementById(`stop-2`).disabled = true; 
            playAnticipationSound();
        }
    }
    
    if (reelsState[0] === 'idle' && reelsState[1] === 'idle' && reelsState[2] === 'idle') {
        stopSpinAudio();
        evaluateWin();
    }
}

function isWinPossible() {
    for (let line of paylinesList) {
        const s1 = grid[line[0][0]][line[0][1]];
        const s2 = grid[line[1][0]][line[1][1]];
        if (s1 === 'SCATTER' || s2 === 'SCATTER') continue;
        if (s1 === s2 || s1 === 'WILD' || s2 === 'WILD') {
            return true;
        }
    }
    let scatters = 0;
    for(let r=0; r<3; r++) if(grid[0][r] === 'SCATTER') scatters++;
    for(let r=0; r<3; r++) if(grid[1][r] === 'SCATTER') scatters++;
    return scatters >= 2;
}

// --- EVALUATION ---
function checkLine(line) {
    const s1 = grid[line[0][0]][line[0][1]];
    const s2 = grid[line[1][0]][line[1][1]];
    const s3 = grid[line[2][0]][line[2][1]];
    
    let target = null;
    if (s1 !== 'WILD' && s1 !== 'SCATTER') target = s1;
    else if (s2 !== 'WILD' && s2 !== 'SCATTER') target = s2;
    else if (s3 !== 'WILD' && s3 !== 'SCATTER') target = s3;
    
    if (!target && s1 === 'WILD') target = 'AGI';
    
    if (s1 === 'SCATTER' || s2 === 'SCATTER' || s3 === 'SCATTER') return null;

    if ( (s1 === target || s1 === 'WILD') && (s2 === target || s2 === 'WILD') && (s3 === target || s3 === 'WILD') ) {
        return { symbol: target, count: 3, multiplier: symbolsData[target].mult3 };
    }
    if ( (s1 === target || s1 === 'WILD') && (s2 === target || s2 === 'WILD') ) {
        return { symbol: target, count: 2, multiplier: symbolsData[target].mult2 };
    }
    return null;
}

function evaluateWin() {
    let totalWin = 0;
    let winLines = [];
    
    for (let i = 0; i < paylinesList.length; i++) {
        const win = checkLine(paylinesList[i]);
        if (win && win.multiplier > 0) {
            totalWin += betAmount * win.multiplier * freeSpinsMultiplier;
            winLines.push(i);
        }
    }
    
    let scatterCount = 0;
    for(let c=0; c<3; c++) {
        for(let r=0; r<3; r++) {
            if(grid[c][r] === 'SCATTER') scatterCount++;
        }
    }
    
    if (scatterCount >= 3) {
        totalWin += betAmount * 10 * freeSpinsMultiplier; 
    }
    
    if (totalWin > 0 || scatterCount >= 3) {
        winLines.forEach(idx => {
            document.getElementById(`payline-${idx}`).classList.add('active');
        });
        
        if (totalWin >= betAmount * 30 || scatterCount >= 3) {
            triggerBigWin(totalWin, scatterCount >= 3);
        } else {
            tokens += totalWin;
            updateDisplay();
            showMessage(`WIN: +${totalWin}`, "win");
            playWinSound(totalWin > betAmount * 5 ? 2 : 1);
            finishSpin(scatterCount >= 3);
        }
    } else {
        showMessage("No win this time.", "");
        playLoseSound();
        finishSpin(false);
    }
}

function finishSpin(triggeredFreeSpins) {
    if (triggeredFreeSpins && freeSpins === 0) {
        freeSpins = 10;
        freeSpinsMultiplier = 3;
        document.body.classList.add('free-spins-mode');
        showMessage("10 FREE SPINS AWARDED! 3x MULTIPLIER!", "win");
        setTimeout(spin, 2000); 
    } else if (freeSpins > 0) {
        setTimeout(spin, 1500); 
    } else {
        isSpinning = false;
        document.body.classList.remove('free-spins-mode');
    }
    updateDisplay();
}

// --- BIG WIN PARTICLES & ROLLUP ---
const canvas = document.getElementById('particles-canvas');
const ctx = canvas.getContext('2d');
let particles = [];
let particlesActive = false;

function startParticles() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    particles = [];
    particlesActive = true;
    for(let i=0; i<150; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            vx: (Math.random() - 0.5) * 5,
            vy: Math.random() * 5 + 5,
            size: Math.random() * 15 + 15,
            color: Math.random() > 0.5 ? '#fbbf24' : '#f59e0b',
            rot: Math.random() * Math.PI * 2,
            vRot: (Math.random() - 0.5) * 0.2
        });
    }
    requestAnimationFrame(updateParticles);
}

function updateParticles() {
    if(!particlesActive) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for(let p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vRot;
        if(p.y > canvas.height + 50) p.y = -50;
        
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(0, 0, p.size, 0, Math.PI*2);
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#fff';
        ctx.stroke();
        ctx.fillStyle = '#fff';
        ctx.font = `bold ${p.size}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('$', 0, 0);
        ctx.restore();
    }
    requestAnimationFrame(updateParticles);
}

function stopParticles() {
    particlesActive = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function triggerBigWin(amount, triggeredFreeSpins) {
    document.getElementById('big-win-overlay').classList.remove('hidden');
    startParticles();
    
    let current = 0;
    const counter = document.getElementById('rollup-counter');
    const duration = 3000;
    const startT = performance.now();
    
    const rollupAudio = setInterval(() => {
        playTone(600 + Math.random()*200, 'square', 0.05, 0.05);
    }, 50);
    
    function updateRollup(t) {
        const elapsed = t - startT;
        const progress = Math.min(elapsed / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 4);
        current = Math.floor(ease * amount);
        counter.textContent = "+" + current;
        if (progress < 1) {
            requestAnimationFrame(updateRollup);
        } else {
            clearInterval(rollupAudio);
            playTone(800, 'sine', 1, 0.2);
            playTone(1200, 'sine', 1, 0.2);
            setTimeout(() => {
                document.getElementById('big-win-overlay').classList.add('hidden');
                stopParticles();
                tokens += amount;
                updateDisplay();
                finishSpin(triggeredFreeSpins);
            }, 3000);
        }
    }
    requestAnimationFrame(updateRollup);
}

// --- INIT & EVENTS ---
function initReels() {
    for(let col=0; col<3; col++) {
        reels[col] = document.querySelector(`#reel${col} .symbols`);
        reels[col].innerHTML = '';
        for(let i=0; i<3; i++) {
            reels[col].appendChild(createRandomSymbol());
        }
        reels[col].style.transform = 'translateY(0)';
    }
}

function populatePayouts() {
    const list = document.getElementById('payout-list');
    list.innerHTML = '';
    Object.keys(symbolsData).forEach(key => {
        const sym = symbolsData[key];
        const div = document.createElement('div');
        div.className = 'payout-item';
        div.innerHTML = `
            <div class="payout-icon" style="width: 50px; height: 50px; display: inline-block;">${svgs[key]}</div>
            <div class="payout-desc">${key}</div>
            <div class="payout-mult">
                ${sym.mult3 > 0 ? `3x: <b>${sym.mult3}x</b> <br> 2x: <b>${sym.mult2}x</b>` : sym.msg}
            </div>
        `;
        list.appendChild(div);
    });
}

document.getElementById('spin-btn').addEventListener('click', spin);
document.getElementById('bet-amount').addEventListener('input', (e) => {
    betAmount = parseInt(e.target.value) || 10;
    if(betAmount < 10) betAmount = 10;
    updateDisplay();
});
document.getElementById('reset-btn').addEventListener('click', () => {
    initAudio();
    tokens = 10000;
    updateDisplay();
    showMessage("Venture Capital funding secured!", "win");
});

document.getElementById('payout-btn').addEventListener('click', () => document.getElementById('payout-modal').classList.remove('hidden'));
document.getElementById('close-modal').addEventListener('click', () => document.getElementById('payout-modal').classList.add('hidden'));

document.getElementById('stop-0').addEventListener('click', () => initiateStop(0));
document.getElementById('stop-1').addEventListener('click', () => initiateStop(1));
document.getElementById('stop-2').addEventListener('click', () => initiateStop(2));

initReels();
populatePayouts();
updateDisplay();