const symbols = [
    { char: '🤖', name: 'Generic AI', value: 10 },
    { char: '🧠', name: 'Galaxy Brain', value: 50 },
    { char: '💸', name: 'OpenAI Bill', value: 100 },
    { char: '📉', name: 'Hallucination', value: -50 },
    { char: '💩', name: 'Bad Output', value: -10 },
    { char: '⚡', name: 'H100 GPU', value: 200 }
];

let balance = 8192;
const SPIN_COST = 100;

const balanceEl = document.getElementById('balance');
const reels = [
    document.getElementById('reel1'),
    document.getElementById('reel2'),
    document.getElementById('reel3')
];
const spinBtn = document.getElementById('spin-btn');
const messageEl = document.getElementById('message');
const terminalEl = document.getElementById('terminal-log');

function logTerminal(message) {
    const time = new Date().toLocaleTimeString();
    terminalEl.innerHTML += `> [${time}] ${message}<br>`;
    terminalEl.scrollTop = terminalEl.scrollHeight;
}

function updateBalance(amount) {
    balance += amount;
    balanceEl.textContent = balance;
    if (balance < SPIN_COST) {
        spinBtn.disabled = true;
        spinBtn.textContent = 'Rate Limit Reached (Out of Tokens)';
        logTerminal("ERROR: 429 Too Many Requests. Buy more compute.");
    }
}

function getRandomSymbol() {
    return symbols[Math.floor(Math.random() * symbols.length)];
}

function spin() {
    if (balance < SPIN_COST) return;
    
    updateBalance(-SPIN_COST);
    logTerminal(`Prompting model... (Cost: ${SPIN_COST} tokens)`);
    messageEl.textContent = 'Generating response...';
    spinBtn.disabled = true;

    // Start spinning animation
    reels.forEach(reel => reel.classList.add('spinning'));

    let spinTimes = [1000, 1500, 2000]; // Staggered stop times
    let results = [];

    reels.forEach((reel, index) => {
        setTimeout(() => {
            reel.classList.remove('spinning');
            const symbol = getRandomSymbol();
            reel.textContent = symbol.char;
            results[index] = symbol;

            if (index === reels.length - 1) {
                evaluateResult(results);
            }
        }, spinTimes[index]);
    });
}

function evaluateResult(results) {
    spinBtn.disabled = false;
    
    const chars = results.map(r => r.char);
    const uniqueChars = [...new Set(chars)];
    
    let winnings = 0;
    
    if (uniqueChars.length === 1) {
        // Jackpot (3 of a kind)
        const symbol = results[0];
        winnings = symbol.value * 10;
        
        if (winnings > 0) {
            messageEl.textContent = `Mind-blowing Response! Won ${winnings} tokens!`;
            logTerminal(`SUCCESS: Perfect completion. Gained ${winnings} tokens.`);
        } else {
            messageEl.textContent = `Total System Failure! Lost ${Math.abs(winnings)} tokens!`;
            logTerminal(`CRITICAL: Model went rogue. Lost ${Math.abs(winnings)} tokens.`);
        }
    } else if (uniqueChars.length === 2) {
        // 2 of a kind
        const charCount = {};
        chars.forEach(c => charCount[c] = (charCount[c] || 0) + 1);
        const winningChar = Object.keys(charCount).find(k => charCount[k] === 2);
        const symbol = symbols.find(s => s.char === winningChar);
        
        winnings = symbol.value * 2;
        
        if (winnings > 0) {
            messageEl.textContent = `Decent Output. Recovered ${winnings} tokens.`;
            logTerminal(`INFO: Acceptable generation. Gained ${winnings} tokens.`);
        } else {
            messageEl.textContent = `Minor Hallucination. Penalty: ${Math.abs(winnings)} tokens.`;
            logTerminal(`WARNING: Factual inaccuracies detected. Lost ${Math.abs(winnings)} tokens.`);
        }
    } else {
        // All different
        messageEl.textContent = 'Gibberish Output. Waste of compute.';
        logTerminal(`ERROR: Output failed safety alignment. 0 tokens refunded.`);
    }
    
    if (winnings !== 0) {
        updateBalance(winnings);
    }
}

spinBtn.addEventListener('click', spin);