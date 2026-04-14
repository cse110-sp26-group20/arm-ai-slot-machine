document.addEventListener('DOMContentLoaded', () => {
    const symbols = ['🚀', '🧠', '🤖', '💸', '📉', '🗑️'];
    const payouts = {
        '🚀': 500, // AGI
        '🧠': 200, // Big Brain
        '🤖': 100, // Agent
        '💸': 50,  // VC Money
        '📉': 10,  // Collapse
        '🗑️': 5   // Garbage
    };

    let balance = 1000;
    const spinCost = 10;
    let isSpinning = false;

    const balanceDisplay = document.getElementById('token-balance');
    const messageDisplay = document.getElementById('message');
    const spinButton = document.getElementById('spin-button');
    const reels = [
        document.getElementById('reel1'),
        document.getElementById('reel2'),
        document.getElementById('reel3')
    ];

    const messages = {
        idle: ["Ready to prompt?", "Feed me tokens.", "Awaiting input...", "Context window empty."],
        spinning: ["Generating...", "Calculating probabilities...", "Hallucinating...", "Querying vector DB...", "Optimizing weights..."],
        lose: ["Token limit exceeded.", "Rate limited.", "Safety filter triggered.", "Output is gibberish.", "Try a better prompt."],
        broke: ["Out of tokens! Time to ask VC for more funding.", "Context window full. Game over.", "You've been deprecated."]
    };

    function getRandomSymbol() {
        return symbols[Math.floor(Math.random() * symbols.length)];
    }

    function getRandomMessage(type) {
        const msgs = messages[type];
        return msgs[Math.floor(Math.random() * msgs.length)];
    }

    function updateBalance(amount) {
        balance += amount;
        balanceDisplay.textContent = balance;
    }

    function spin() {
        if (isSpinning) return;
        
        if (balance < spinCost) {
            messageDisplay.textContent = getRandomMessage('broke');
            messageDisplay.parentElement.classList.remove('win');
            spinButton.disabled = true;
            return;
        }

        isSpinning = true;
        spinButton.disabled = true;
        messageDisplay.parentElement.classList.remove('win');
        
        // Deduct cost
        updateBalance(-spinCost);
        messageDisplay.textContent = getRandomMessage('spinning');

        // Start spinning animation
        reels.forEach(reel => {
            reel.classList.add('spinning');
            reel.textContent = '❓';
        });

        // Simulate API latency/spin time
        const spinDurations = [1000, 1500, 2000]; // Staggered stops
        const results = [];

        reels.forEach((reel, index) => {
            setTimeout(() => {
                const symbol = getRandomSymbol();
                results[index] = symbol;
                reel.classList.remove('spinning');
                reel.textContent = symbol;

                // Check win after last reel stops
                if (index === reels.length - 1) {
                    checkWin(results);
                }
            }, spinDurations[index]);
        });
    }

    function checkWin(results) {
        isSpinning = false;
        spinButton.disabled = false;

        const allSame = results.every(val => val === results[0]);

        if (allSame) {
            const winSymbol = results[0];
            const winAmount = payouts[winSymbol];
            updateBalance(winAmount);
            messageDisplay.textContent = `JACKPOT! Synthesized ${winAmount} tokens!`;
            messageDisplay.parentElement.classList.add('win');
        } else {
            messageDisplay.textContent = getRandomMessage('lose');
        }
    }

    spinButton.addEventListener('click', spin);
});
