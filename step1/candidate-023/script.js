const SYMBOLS = ['🧠', '🖥️', '🤖', '📈', '🗑️', '📄', '🐛'];
const COST_PER_SPIN = 128;
const STARTING_TOKENS = 8192;

let currentTokens = STARTING_TOKENS;
let isSpinning = false;

const tokenCountEl = document.getElementById('token-count');
const spinButton = document.getElementById('spin-button');
const messageArea = document.getElementById('message-area');
const reels = [
    document.getElementById('reel-1').querySelector('.symbols'),
    document.getElementById('reel-2').querySelector('.symbols'),
    document.getElementById('reel-3').querySelector('.symbols')
];

// Initialize reels with some default symbols
function initReels() {
    reels.forEach(reel => {
        reel.innerHTML = '';
        // Add current symbol
        const currentSymbol = document.createElement('div');
        currentSymbol.className = 'symbol';
        currentSymbol.textContent = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
        reel.appendChild(currentSymbol);
    });
}

function updateTokens(amount) {
    currentTokens += amount;
    tokenCountEl.textContent = currentTokens.toLocaleString();
    if (currentTokens < COST_PER_SPIN) {
        spinButton.disabled = true;
        showMessage("Context Window Exceeded. Please buy more compute.", "error");
    }
}

function showMessage(msg, type = 'neutral') {
    messageArea.textContent = msg;
    messageArea.className = `message-area message-${type}`;
}

function evaluateWin(results) {
    const [s1, s2, s3] = results;
    
    if (s1 === s2 && s2 === s3) {
        // 3 of a kind
        if (s1 === '🧠') return { win: 10000, msg: "AGI Achieved! +10,000 Tokens!" };
        if (s1 === '🖥️') return { win: 5000, msg: "H100 Cluster Allocated! +5,000 Tokens!" };
        if (s1 === '🤖') return { win: 1000, msg: "Zero-Shot Perfect Code! +1,000 Tokens!" };
        if (s1 === '📈') return { win: 500, msg: "Series A Funding Secured! +500 Tokens!" };
        if (s1 === '🗑️') return { win: -500, msg: "MASSIVE HALLUCINATION! Lost extra 500 Tokens!" };
        return { win: 256, msg: "Synergy achieved! +256 Tokens!" };
    } else if (s1 === s2 || s2 === s3 || s1 === s3) {
        // 2 of a kind
        if (s1 === '🗑️' && s2 === '🗑️' || s2 === '🗑️' && s3 === '🗑️' || s1 === '🗑️' && s3 === '🗑️') {
            return { win: -128, msg: "Minor Hallucination. Lost extra 128 Tokens." };
        }
        return { win: 64, msg: "Partial Match. Recovered 64 Tokens." };
    }
    
    return { win: 0, msg: "Output generated. It was not very useful." };
}

async function spin() {
    if (isSpinning || currentTokens < COST_PER_SPIN) return;
    
    isSpinning = true;
    spinButton.disabled = true;
    updateTokens(-COST_PER_SPIN);
    showMessage("Generating response...", "neutral");
    
    const finalResults = [];
    const spinPromises = reels.map((reel, index) => {
        return new Promise(resolve => {
            // Number of symbols to generate before stopping
            const numSymbols = 20 + (index * 10); // Stagger stopping times
            
            // Generate the strip of symbols
            reel.innerHTML = '';
            reel.style.transition = 'none';
            reel.style.transform = `translateY(0)`;
            
            // Add final symbol at the top (which will end up in view)
            const finalSymbolText = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
            finalResults[index] = finalSymbolText;
            
            // Create a long list of random symbols
            const symbolsList = [finalSymbolText];
            for(let i=0; i<numSymbols; i++) {
                symbolsList.push(SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]);
            }
            
            // Append all to reel (bottom to top in DOM)
            symbolsList.reverse().forEach(symbol => {
                const el = document.createElement('div');
                el.className = 'symbol';
                el.textContent = symbol;
                reel.appendChild(el);
            });
            
            // Force reflow
            void reel.offsetWidth;
            
            // Animate
            const duration = 2 + (index * 0.5); // Stagger duration
            reel.style.transition = `transform ${duration}s cubic-bezier(0.1, 0.7, 0.1, 1)`;
            
            // Transform to show the top element (which is the last one appended)
            const translateY = -((symbolsList.length - 1) * 120);
            reel.style.transform = `translateY(${translateY}px)`;
            
            setTimeout(() => resolve(), duration * 1000);
        });
    });

    await Promise.all(spinPromises);
    
    const { win, msg } = evaluateWin(finalResults);
    
    if (win > 0) {
        updateTokens(win);
        showMessage(msg, "success");
    } else if (win < 0) {
        updateTokens(win); // Actually subtracts
        showMessage(msg, "error");
    } else {
        showMessage(msg, "neutral");
    }
    
    isSpinning = false;
    if (currentTokens >= COST_PER_SPIN) {
        spinButton.disabled = false;
    }
}

spinButton.addEventListener('click', spin);

// Initialize
initReels();
