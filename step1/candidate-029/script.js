const symbols = [
    { emoji: '🤖', name: 'AI Model', value: 50 },
    { emoji: '🧠', name: 'Neural Net', value: 40 },
    { emoji: '💾', name: 'Training Data', value: 30 },
    { emoji: '🔋', name: 'Compute Power', value: 20 },
    { emoji: '💸', name: 'VC Funding', value: 10 },
    { emoji: '📉', name: 'Gradient Descent', value: 5 },
    { emoji: '💩', name: 'Hallucination', value: 0 }
];

let tokens = 1000;
const costPerSpin = 10;
let isSpinning = false;

const tokenCountEl = document.getElementById('token-count');
const spinBtn = document.getElementById('spin-btn');
const messageEl = document.getElementById('message');
const reels = [
    document.getElementById('reel-1'),
    document.getElementById('reel-2'),
    document.getElementById('reel-3')
];

function updateTokens(amount) {
    tokens += amount;
    tokenCountEl.textContent = tokens;
    if (tokens < costPerSpin) {
        spinBtn.disabled = true;
        showMessage("OUT OF COMPUTE TOKENS! Please secure more funding.", true);
    }
}

function showMessage(msg, isError = false) {
    messageEl.textContent = msg;
    if (isError) {
        messageEl.classList.add('error');
    } else {
        messageEl.classList.remove('error');
    }
}

function getRandomSymbol() {
    return symbols[Math.floor(Math.random() * symbols.length)];
}

function spin() {
    if (isSpinning || tokens < costPerSpin) return;

    isSpinning = true;
    updateTokens(-costPerSpin);
    spinBtn.disabled = true;
    showMessage("Generating response... Allocating GPUs...", false);

    // Add spinning class for CSS animation
    reels.forEach(reel => reel.classList.add('spinning'));

    let spinTime = 0;
    const spinInterval = setInterval(() => {
        reels.forEach(reel => {
            reel.textContent = getRandomSymbol().emoji;
        });
        spinTime += 50;

        if (spinTime >= 1500) {
            clearInterval(spinInterval);
            stopReels();
        }
    }, 50);
}

function stopReels() {
    // Determine final results
    const results = [
        getRandomSymbol(),
        getRandomSymbol(),
        getRandomSymbol()
    ];

    // Simulate stopping one by one
    reels.forEach(reel => reel.classList.remove('spinning'));
    
    setTimeout(() => { reels[0].textContent = results[0].emoji; }, 100);
    setTimeout(() => { reels[1].textContent = results[1].emoji; }, 300);
    setTimeout(() => { reels[2].textContent = results[2].emoji; }, 500);

    setTimeout(() => {
        checkWin(results);
        isSpinning = false;
        if (tokens >= costPerSpin) {
            spinBtn.disabled = false;
        }
    }, 600);
}

function checkWin(results) {
    const [s1, s2, s3] = results;
    
    // Check for 3 of a kind
    if (s1.emoji === s2.emoji && s2.emoji === s3.emoji) {
        if (s1.emoji === '💩') {
            showMessage("Massive Hallucination! Output is garbage. No tokens won.", true);
        } else {
            const winAmount = s1.value * 10;
            updateTokens(winAmount);
            showMessage(`AGI ACHIEVED! 3 ${s1.name}s! You mined ${winAmount} tokens!`, false);
        }
        return;
    }

    // Check for 2 of a kind
    if (s1.emoji === s2.emoji || s2.emoji === s3.emoji || s1.emoji === s3.emoji) {
        let matchingSymbol = s1.emoji === s2.emoji ? s1 : (s2.emoji === s3.emoji ? s2 : s1);
        if (matchingSymbol.emoji === '💩') {
             showMessage("Minor Hallucination detected. Output needs human review.", true);
        } else {
            const winAmount = matchingSymbol.value * 2;
            updateTokens(winAmount);
            showMessage(`Partial coherence. 2 ${matchingSymbol.name}s. Gained ${winAmount} tokens.`, false);
        }
        return;
    }

    // No match
    showMessage("Output lacked context. GPU cycles wasted. Try again.", true);
}

spinBtn.addEventListener('click', spin);
