const SYMBOLS = {
    WILD: { id: 'WILD', weight: 5, svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>', class: 'sym-wild' },
    SCATTER: { id: 'SCATTER', weight: 5, svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L3 14H12L11 22L21 10H12L13 2Z"/></svg>', class: 'sym-scatter' },
    S1: { id: 'S1', weight: 15, svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12,2 22,20 2,20"/></svg>', class: 'sym-1' },
    S2: { id: 'S2', weight: 20, svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18"/></svg>', class: 'sym-2' },
    S3: { id: 'S3', weight: 25, svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>', class: 'sym-3' },
    S4: { id: 'S4', weight: 20, svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12,2 22,12 12,22 2,12"/></svg>', class: 'sym-4' },
    S5: { id: 'S5', weight: 10, svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12,2 20.66,7 20.66,17 12,22 3.34,17 3.34,7"/></svg>', class: 'sym-5' }
};

const PAYOUTS = { WILD: 50, S1: 20, S2: 15, S3: 10, S4: 5, S5: 3 };

const PAYLINES = [
    [ [0,0], [1,0], [2,0] ], // Top
    [ [0,1], [1,1], [2,1] ], // Mid
    [ [0,2], [1,2], [2,2] ], // Bot
    [ [0,0], [1,1], [2,2] ], // Diag 1
    [ [0,2], [1,1], [2,0] ]  // Diag 2
];

let balance = 8192;
let currentBet = 100;
let freeSpins = 0;
let freeSpinMultiplier = 1;
let isSpinning = false;
let reelsState = [false, false, false];
const REEL_STRIP_LENGTH = 50;
let gridResult = [];
let lastWinningLines = [];

const balanceEl = document.getElementById('balance');
const betEl = document.getElementById('current-bet');
const messageEl = document.getElementById('message');
const spinBtn = document.getElementById('spin-btn');

function updateBalance(amount) {
    balance += amount;
    balanceEl.textContent = balance;
}

document.getElementById('decrease-bet').addEventListener('click', () => {
    if (isSpinning || freeSpins > 0) return;
    currentBet = Math.max(10, currentBet - 10);
    betEl.textContent = currentBet;
    playTone(300, 'sine', 0.1);
});

document.getElementById('increase-bet').addEventListener('click', () => {
    if (isSpinning || freeSpins > 0) return;
    currentBet = Math.min(balance, currentBet + 10);
    betEl.textContent = currentBet;
    playTone(400, 'sine', 0.1);
});

// Audio
let audioCtx;
function initAudio() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
}

function playTone(freq, type, duration, vol = 0.1, slideFreq = null) {
    if (!audioCtx) return;
    try {
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        if (slideFreq) {
            osc.frequency.linearRampToValueAtTime(slideFreq, audioCtx.currentTime + duration);
        }
        gainNode.gain.setValueAtTime(vol, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + duration);
    } catch(e) {}
}

let anticipationInterval = null;
function startAnticipationSound() {
    let pitch = 300;
    anticipationInterval = setInterval(() => {
        playTone(pitch, 'sawtooth', 0.1, 0.05);
        pitch += 20;
    }, 100);
}
function stopAnticipationSound() {
    if (anticipationInterval) clearInterval(anticipationInterval);
}

function getRandomSymbol() {
    let totalWeight = Object.values(SYMBOLS).reduce((sum, sym) => sum + sym.weight, 0);
    let rand = Math.random() * totalWeight;
    for (let key in SYMBOLS) {
        rand -= SYMBOLS[key].weight;
        if (rand <= 0) return SYMBOLS[key];
    }
    return SYMBOLS.S3;
}

function generateGrid() {
    return [
        [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()],
        [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()],
        [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()]
    ];
}

spinBtn.addEventListener('click', () => spin());

let spinTimeouts = [];

function spin() {
    if (isSpinning) return;
    if (freeSpins === 0 && balance < currentBet) {
        messageEl.textContent = "Not enough credits!";
        return;
    }

    initAudio();
    isSpinning = true;
    reelsState = [false, false, false];
    document.getElementById('payline-svg').innerHTML = '';
    lastWinningLines = [];
    messageEl.textContent = 'Good luck!';
    spinBtn.disabled = true;
    
    if (freeSpins === 0) {
        updateBalance(-currentBet);
    } else {
        freeSpins--;
        document.getElementById('free-spins-left').textContent = freeSpins;
    }

    gridResult = generateGrid();

    let hasAnticipation = false;
    let willWin = false;
    let matchTarget = null;

    PAYLINES.forEach(line => {
        let sym0 = gridResult[0][line[0][1]].id;
        let sym1 = gridResult[1][line[1][1]].id;
        let sym2 = gridResult[2][line[2][1]].id;
        
        let possibleWin = (sym0 === sym1 || sym0 === 'WILD' || sym1 === 'WILD');
        if (possibleWin) hasAnticipation = true;
        
        let actualWin = possibleWin && (sym2 === sym0 || sym2 === sym1 || sym2 === 'WILD');
        if (actualWin) willWin = true;

        if (sym0 === sym1 && sym0 !== 'WILD' && sym0 !== 'SCATTER') matchTarget = SYMBOLS[sym0];
    });

    for (let col = 0; col < 3; col++) {
        let stripEl = document.querySelector(`#reel${col} .reel-strip`);
        stripEl.innerHTML = '';
        stripEl.style.transition = 'none';
        stripEl.style.transform = `translateY(0px)`;

        for(let i = 0; i < REEL_STRIP_LENGTH - 3; i++) {
            let sym = getRandomSymbol();
            let symEl = document.createElement('div');
            symEl.className = 'symbol-container ' + sym.class;
            symEl.innerHTML = sym.svg;
            stripEl.appendChild(symEl);
        }
        
        for(let i = 0; i < 3; i++) {
            let symData = gridResult[col][i];
            let symEl = document.createElement('div');
            symEl.className = 'symbol-container ' + symData.class;
            symEl.innerHTML = symData.svg;
            stripEl.appendChild(symEl);
        }

        if (col === 2 && hasAnticipation && !willWin && matchTarget && Math.random() < 0.6) {
            let nearMissIndex = REEL_STRIP_LENGTH - 4;
            let symEl = stripEl.children[nearMissIndex];
            symEl.className = 'symbol-container ' + matchTarget.class;
            symEl.innerHTML = matchTarget.svg;
        }

        document.getElementById(`stop-btn-${col}`).disabled = false;
    }

    void document.body.offsetHeight;

    let baseSpinTime = 1000;
    let symbolSize = document.querySelector('.reel').offsetHeight / 3;
    let targetY = -(REEL_STRIP_LENGTH - 3) * symbolSize;

    spinTimeouts = [];

    for (let col = 0; col < 3; col++) {
        let stripEl = document.querySelector(`#reel${col} .reel-strip`);
        let spinDuration = baseSpinTime + col * 500;
        
        if (col === 2 && hasAnticipation) {
            spinDuration += 3000;
            spinTimeouts.push(setTimeout(() => { if (!reelsState[2]) startAnticipationSound(); }, baseSpinTime + 1000));
        }

        stripEl.style.transition = `transform ${spinDuration}ms cubic-bezier(0.1, 0.7, 0.1, 1)`;
        stripEl.style.transform = `translateY(${targetY}px)`;

        spinTimeouts.push(setTimeout(() => {
            stopReel(col);
        }, spinDuration));
    }
}

function stopReel(col) {
    if (reelsState[col]) return;
    reelsState[col] = true;
    document.getElementById(`stop-btn-${col}`).disabled = true;

    let stripEl = document.querySelector(`#reel${col} .reel-strip`);
    let symbolSize = document.querySelector('.reel').offsetHeight / 3;
    let targetY = -(REEL_STRIP_LENGTH - 3) * symbolSize;
    
    // Calculate current transform visually to make a smooth rapid stop
    let computedStyle = window.getComputedStyle(stripEl);
    let matrix = new WebKitCSSMatrix(computedStyle.transform);
    let currentY = matrix.m42;
    
    stripEl.style.transition = 'none';
    stripEl.style.transform = `translateY(${currentY}px)`;
    
    void document.body.offsetHeight; // force reflow

    // Snap quickly to final
    stripEl.style.transition = `transform 0.2s ease-out`;
    stripEl.style.transform = `translateY(${targetY}px)`;
    
    playTone(200, 'square', 0.1, 0.2); 

    if (col === 2) stopAnticipationSound();

    if (reelsState.every(s => s)) {
        setTimeout(evaluateResult, 300); // slight delay after last reel stops
    }
}

for(let col = 0; col < 3; col++) {
    document.getElementById(`stop-btn-${col}`).addEventListener('click', () => {
        if(isSpinning && !reelsState[col]) stopReel(col);
    });
}

function evaluateResult() {
    isSpinning = false;
    spinBtn.disabled = false;
    let totalWin = 0;
    let winningLines = [];
    let scatterCount = 0;

    for(let col = 0; col < 3; col++) {
        for(let row = 0; row < 3; row++) {
            if (gridResult[col][row].id === 'SCATTER') scatterCount++;
        }
    }

    PAYLINES.forEach(line => {
        let sym0 = gridResult[0][line[0][1]].id;
        let sym1 = gridResult[1][line[1][1]].id;
        let sym2 = gridResult[2][line[2][1]].id;

        let matchSym = null;
        if (sym0 !== 'WILD' && sym0 !== 'SCATTER') matchSym = sym0;
        else if (sym1 !== 'WILD' && sym1 !== 'SCATTER') matchSym = sym1;
        else if (sym2 !== 'WILD' && sym2 !== 'SCATTER') matchSym = sym2;
        else if (sym0 === 'WILD' && sym1 === 'WILD' && sym2 === 'WILD') matchSym = 'WILD';

        if (matchSym) {
            let isWin = true;
            [sym0, sym1, sym2].forEach(sym => {
                if (sym !== matchSym && sym !== 'WILD') isWin = false;
            });

            if (isWin) {
                let payoutMultiplier = PAYOUTS[matchSym] || 0;
                let lineWin = currentBet * payoutMultiplier * freeSpinMultiplier;
                if (lineWin > 0) {
                    totalWin += lineWin;
                    winningLines.push(line);
                }
            }
        }
    });

    if (scatterCount >= 3) {
        freeSpins += 10;
        freeSpinMultiplier = 3;
        document.getElementById('main-wrapper').classList.add('free-spins-mode');
        document.getElementById('bonus-display').classList.remove('hidden');
        document.getElementById('free-spins-left').textContent = freeSpins;
        messageEl.textContent = 'FREE SPINS TRIGGERED!';
        playTone(600, 'sine', 2, 0.2, 1200);
    }

    if (totalWin > 0) {
        lastWinningLines = winningLines;
        drawWinningLines(winningLines);
        updateBalance(totalWin);
        if (totalWin >= currentBet * 15) {
            triggerBigWin(totalWin);
        } else {
            messageEl.textContent = `Won ${totalWin} credits!`;
            playTone(400, 'sine', 0.2);
            setTimeout(() => playTone(600, 'sine', 0.4), 200);
            if (freeSpins > 0) setTimeout(spin, 1500);
        }
    } else {
        messageEl.textContent = 'Try Again!';
        if (freeSpins > 0) {
            setTimeout(spin, 1000);
        } else if (freeSpins === 0 && document.getElementById('main-wrapper').classList.contains('free-spins-mode')) {
             document.getElementById('main-wrapper').classList.remove('free-spins-mode');
             document.getElementById('bonus-display').classList.add('hidden');
             freeSpinMultiplier = 1;
        }
    }
}

function drawWinningLines(lines) {
    let svg = document.getElementById('payline-svg');
    svg.innerHTML = '';
    let svgRect = svg.getBoundingClientRect();
    
    lines.forEach(line => {
        let pathStr = '';
        line.forEach((point, i) => {
            let reel = document.getElementById(`reel${point[0]}`);
            let reelRect = reel.getBoundingClientRect();
            let symHeight = reelRect.height / 3;
            let cx = reelRect.left - svgRect.left + (reelRect.width / 2);
            let cy = reelRect.top - svgRect.top + (symHeight / 2) + (point[1] * symHeight);
            
            if (i === 0) pathStr += `M ${cx} ${cy} `;
            else pathStr += `L ${cx} ${cy} `;
        });
        let pathEl = document.createElementNS("http://www.w3.org/2000/svg", "path");
        pathEl.setAttribute('d', pathStr);
        pathEl.setAttribute('class', 'payline');
        pathEl.setAttribute('fill', 'none');
        svg.appendChild(pathEl);
    });
}

window.addEventListener('resize', () => {
    if (lastWinningLines.length > 0) drawWinningLines(lastWinningLines);
});

let rollupInterval;
function triggerBigWin(amount) {
    let overlay = document.getElementById('big-win-overlay');
    let counter = document.getElementById('rollup-counter');
    overlay.classList.remove('hidden');
    
    startParticles();

    let current = 0;
    let step = Math.ceil(amount / 80); // roll up over ~2.4s (80 frames at 30ms)
    let pitch = 300;

    rollupInterval = setInterval(() => {
        current += step;
        if (current >= amount) {
            current = amount;
            clearInterval(rollupInterval);
            playTone(800, 'triangle', 1, 0.3);
            setTimeout(() => {
                overlay.classList.add('hidden');
                stopParticles();
                if (freeSpins > 0) spin();
            }, 3000);
        }
        counter.textContent = current;
        playTone(pitch, 'square', 0.05, 0.05);
        pitch += 5;
    }, 30);
}

let particleCtx, particles = [], particleAnim;
function startParticles() {
    let canvas = document.getElementById('particle-canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    particleCtx = canvas.getContext('2d');
    particles = [];
    
    for(let i=0; i<150; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: -20 - Math.random() * 100,
            vx: (Math.random() - 0.5) * 8,
            vy: 3 + Math.random() * 7,
            size: 8 + Math.random() * 15,
            color: Math.random() > 0.5 ? '#00ffcc' : '#ffae00'
        });
    }
    
    function animate() {
        particleCtx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            if (p.y > canvas.height) {
                p.y = -20;
                p.x = Math.random() * canvas.width;
            }
            particleCtx.fillStyle = p.color;
            particleCtx.beginPath();
            particleCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            particleCtx.fill();
        });
        particleAnim = requestAnimationFrame(animate);
    }
    animate();
}
function stopParticles() {
    cancelAnimationFrame(particleAnim);
}

// init
for (let col = 0; col < 3; col++) {
    let stripEl = document.querySelector(`#reel${col} .reel-strip`);
    for(let i = 0; i < 3; i++) {
        let symEl = document.createElement('div');
        symEl.className = 'symbol-container sym-3';
        symEl.innerHTML = SYMBOLS.S3.svg;
        stripEl.appendChild(symEl);
    }
}