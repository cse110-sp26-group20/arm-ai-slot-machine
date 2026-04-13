const symbols = [
    { emoji: '🧠', name: 'AGI', value: 100, message: 'AGI Achieved! You disrupted the industry!' },
    { emoji: '🤖', name: 'LLM', value: 50, message: 'Model trained successfully! Funding secured.' },
    { emoji: '📈', name: 'Stonks', value: 30, message: 'Nvidia stock went up! Minor payout.' },
    { emoji: '🔋', name: 'Compute', value: 10, message: 'Found some extra GPUs in the couch.' },
    { emoji: '🗑️', name: 'Hallucination', value: 0, message: 'Model hallucinated. Added hands with 7 fingers.' },
    { emoji: '🔥', name: 'Burnout', value: 0, message: 'Data center caught fire. You lose.' }
];

const spinCost = 10;
let tokens = 1000;
let isSpinning = false;

const reelElements = [
    document.getElementById('reel1'),
    document.getElementById('reel2'),
    document.getElementById('reel3')
];
const spinBtn = document.getElementById('spin-button');
const tokenCountEl = document.getElementById('token-count');
const messageEl = document.getElementById('message');

function updateDisplay() {
    tokenCountEl.textContent = tokens;
}

function getRandomSymbol() {
    const randomIndex = Math.floor(Math.random() * symbols.length);
    return symbols[randomIndex];
}

function spin() {
    if (isSpinning) return;
    
    if (tokens < spinCost) {
        messageEl.textContent = 'Out of Compute Tokens! Ask VCs for more funding.';
        messageEl.className = 'message lose-message';
        return;
    }

    // Deduct cost
    tokens -= spinCost;
    updateDisplay();
    messageEl.textContent = 'Training models...';
    messageEl.className = 'message';
    
    isSpinning = true;
    spinBtn.disabled = true;

    // Visual spinning effect
    reelElements.forEach(reel => reel.classList.add('spinning'));

    // Simulated API call / delay for dramatic effect
    setTimeout(() => {
        const results = [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()];
        
        reelElements.forEach((reel, index) => {
            reel.textContent = results[index].emoji;
            reel.classList.remove('spinning');
        });

        checkWin(results);
        
        isSpinning = false;
        spinBtn.disabled = false;
    }, 1500);
}

function checkWin(results) {
    // All three match
    if (results[0].emoji === results[1].emoji && results[1].emoji === results[2].emoji) {
        const winSymbol = results[0];
        if (winSymbol.value > 0) {
            const winnings = winSymbol.value * 5; // Big multiplier for 3
            tokens += winnings;
            messageEl.textContent = `Jackpot! ${winSymbol.message} Won ${winnings} Tokens!`;
            messageEl.className = 'message win-message';
        } else {
            messageEl.textContent = `Critical Failure: ${winSymbol.message}`;
            messageEl.className = 'message lose-message';
        }
    } 
    // Two match
    else if (results[0].emoji === results[1].emoji || results[1].emoji === results[2].emoji || results[0].emoji === results[2].emoji) {
        let matchSymbol;
        if (results[0].emoji === results[1].emoji) matchSymbol = results[0];
        else if (results[1].emoji === results[2].emoji) matchSymbol = results[1];
        else matchSymbol = results[0];

        if (matchSymbol.value > 0) {
             const winnings = matchSymbol.value;
             tokens += winnings;
             messageEl.textContent = `Partial Success. ${matchSymbol.name} generated. Won ${winnings} Tokens.`;
             messageEl.className = 'message win-message';
        } else {
             messageEl.textContent = `Bad prompt engineering. ${matchSymbol.name} generated. Try again.`;
             messageEl.className = 'message lose-message';
        }
    } 
    // None match
    else {
        messageEl.textContent = 'Parameters collapsed. Output is garbage. Loss of 10 Tokens.';
        messageEl.className = 'message lose-message';
    }
    
    updateDisplay();
}

spinBtn.addEventListener('click', spin);

// Initial display setup
updateDisplay();
