document.addEventListener('DOMContentLoaded', () => {
    const symbols = [
        { char: '💰', weight: 1, name: 'AGI Achieved', payout: 1000 },
        { char: '🧠', weight: 2, name: 'Perfect Prompt', payout: 500 },
        { char: '🤖', weight: 4, name: 'Good Output', payout: 250 },
        { char: '💻', weight: 5, name: 'Compute Secured', payout: 150 },
        { char: '📉', weight: 4, name: 'Context Limit Reached', payout: -50 }, // Penalty
        { char: '🚨', weight: 3, name: 'Total Hallucination', payout: -100 }  // Penalty
    ];

    let balance = 1000;
    const betSize = 100;
    let isSpinning = false;

    const balanceEl = document.getElementById('balance');
    const spinBtn = document.getElementById('spin-btn');
    const messageEl = document.getElementById('message');
    
    const reelEls = [
        document.getElementById('reel1'),
        document.getElementById('reel2'),
        document.getElementById('reel3')
    ];

    // Create weighted array for selection
    let weightedSymbols = [];
    symbols.forEach(symbol => {
        for (let i = 0; i < symbol.weight; i++) {
            weightedSymbols.push(symbol);
        }
    });

    function getRandomSymbol() {
        const randomIndex = Math.floor(Math.random() * weightedSymbols.length);
        return weightedSymbols[randomIndex];
    }

    function updateBalance() {
        balanceEl.textContent = balance;
        if (balance < betSize) {
            spinBtn.disabled = true;
            messageEl.textContent = "Out of context window (tokens). Refresh to start a new session.";
            messageEl.className = 'message-area lose-message';
        }
    }

    function spinReel(reelEl, duration) {
        return new Promise(resolve => {
            reelEl.classList.add('spinning');
            
            let currentSymbol;
            const spinInterval = setInterval(() => {
                currentSymbol = getRandomSymbol();
                reelEl.querySelector('.symbol').textContent = currentSymbol.char;
            }, 100);

            setTimeout(() => {
                clearInterval(spinInterval);
                reelEl.classList.remove('spinning');
                const finalSymbol = getRandomSymbol();
                reelEl.querySelector('.symbol').textContent = finalSymbol.char;
                resolve(finalSymbol);
            }, duration);
        });
    }

    async function handleSpin() {
        if (isSpinning || balance < betSize) return;

        isSpinning = true;
        spinBtn.disabled = true;
        
        // Deduct bet
        balance -= betSize;
        updateBalance();
        
        messageEl.textContent = "Processing prompt... (Spinning)";
        messageEl.className = 'message-area';

        // Spin reels with different durations for effect
        const spinPromises = [
            spinReel(reelEls[0], 1000),
            spinReel(reelEls[1], 1500),
            spinReel(reelEls[2], 2000)
        ];

        const results = await Promise.all(spinPromises);
        
        evaluateResults(results);
        
        isSpinning = false;
        if (balance >= betSize) {
            spinBtn.disabled = false;
        }
    }

    function evaluateResults(results) {
        const [r1, r2, r3] = results;
        
        if (r1.char === r2.char && r2.char === r3.char) {
            // 3 of a kind
            const winAmount = r1.payout;
            balance += winAmount;
            
            if (winAmount > 0) {
                messageEl.textContent = `${r1.name}! You gained ${winAmount} tokens.`;
                messageEl.className = 'message-area win-message';
            } else {
                messageEl.textContent = `${r1.name}! You lost ${Math.abs(winAmount)} extra tokens.`;
                messageEl.className = 'message-area lose-message';
            }
        } else {
            // Check for minor wins/losses or just a standard loss
            messageEl.textContent = "Incoherent response. Tokens wasted.";
            messageEl.className = 'message-area lose-message';
        }
        
        updateBalance();
    }

    spinBtn.addEventListener('click', handleSpin);
});