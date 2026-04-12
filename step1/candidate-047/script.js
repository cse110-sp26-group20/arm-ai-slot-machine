const symbols = ['🧠', '💸', '🤖', '⚡', '💬', '📉'];
const costPerSpin = 10;
let tokens = 1000;
let isSpinning = false;

const reel1 = document.getElementById('reel1');
const reel2 = document.getElementById('reel2');
const reel3 = document.getElementById('reel3');
const spinBtn = document.getElementById('spinBtn');
const tokenDisplay = document.getElementById('tokenCount');
const messageDisplay = document.getElementById('message');

const payouts = {
    '🧠🧠🧠': 500,
    '💸💸💸': 200,
    '🤖🤖🤖': 100,
    '⚡⚡⚡': 50,
    '💬💬💬': 20,
    '📉📉📉': 0
};

function updateBalance() {
    tokenDisplay.textContent = tokens;
    if (tokens < costPerSpin) {
        spinBtn.disabled = true;
        showMessage("Rate limit exceeded. Insufficient tokens.", "var(--error-color)", "var(--error-color)");
    }
}

function showMessage(text, color = "var(--text-color)", borderLeftColor = "var(--accent-color)") {
    messageDisplay.textContent = text;
    messageDisplay.style.color = color;
    messageDisplay.style.borderLeftColor = borderLeftColor;
}

function getRandomSymbol() {
    return symbols[Math.floor(Math.random() * symbols.length)];
}

function playSound(type) {
    // In a real app we'd use Web Audio API, for now we just structure it.
    // Platform API fallback: Use speech synthesis to make it "AI" themed
    try {
        if (!window.speechSynthesis) return;
        
        // Cancel any ongoing speech
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance();
        utterance.volume = 0.2;
        utterance.rate = 1.5;
        
        if (type === 'spin') {
            utterance.text = "Computing...";
            utterance.pitch = 0.5;
        } else if (type === 'win') {
            utterance.text = "Output generated successfully.";
            utterance.pitch = 1.2;
        } else if (type === 'lose') {
            utterance.text = "Hallucination detected.";
            utterance.pitch = 0.8;
        }
        
        window.speechSynthesis.speak(utterance);
    } catch (e) {
        console.log("Speech API not supported or failed.");
    }
}

function spin() {
    if (isSpinning || tokens < costPerSpin) return;

    isSpinning = true;
    tokens -= costPerSpin;
    updateBalance();
    
    spinBtn.disabled = true;
    showMessage("Generating output... (Consuming tokens)", "var(--text-color)", "#94a3b8");
    
    playSound('spin');

    // Add spinning class for CSS animation
    reel1.classList.add('spinning');
    reel2.classList.add('spinning');
    reel3.classList.add('spinning');

    // Simulate network delay / LLM thinking time
    setTimeout(() => {
        const result1 = getRandomSymbol();
        reel1.textContent = result1;
        reel1.classList.remove('spinning');

        setTimeout(() => {
            const result2 = getRandomSymbol();
            reel2.textContent = result2;
            reel2.classList.remove('spinning');

            setTimeout(() => {
                const result3 = getRandomSymbol();
                reel3.textContent = result3;
                reel3.classList.remove('spinning');

                checkWin(result1, result2, result3);
                isSpinning = false;
                if (tokens >= costPerSpin) {
                    spinBtn.disabled = false;
                }
            }, 400 + Math.random() * 200); // Reel 3 stops
        }, 400 + Math.random() * 200); // Reel 2 stops
    }, 600 + Math.random() * 200); // Reel 1 stops
}

function checkWin(r1, r2, r3) {
    const combo = `${r1}${r2}${r3}`;
    let won = 0;

    if (payouts[combo] !== undefined) {
        won = payouts[combo];
        if (won > 0) {
            showMessage(`Jackpot! High quality output. Refunded ${won} tokens!`, "var(--accent-color)", "var(--accent-color)");
            playSound('win');
        } else {
            showMessage("Model Collapse! Output is garbage. 0 tokens.", "var(--error-color)", "var(--error-color)");
            playSound('lose');
        }
    } else if (r1 === r2 || r2 === r3 || r1 === r3) {
        won = 5; // Partial match
        showMessage(`Partial context match. Recovered ${won} tokens.`, "var(--text-color)", "#eab308");
        playSound('lose');
    } else {
        showMessage("Hallucination generated. Tokens wasted.", "#94a3b8", "#475569");
        playSound('lose');
    }

    if (won > 0) {
        // Animate token gain
        let currentDisplay = tokens;
        tokens += won;
        
        const countInterval = setInterval(() => {
            if (currentDisplay < tokens) {
                currentDisplay += Math.max(1, Math.floor((tokens - currentDisplay) / 5));
                tokenDisplay.textContent = currentDisplay;
            } else {
                clearInterval(countInterval);
                updateBalance();
            }
        }, 50);
    } else {
        updateBalance();
    }
}

spinBtn.addEventListener('click', spin);

// Keyboard support
window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && !spinBtn.disabled) {
        e.preventDefault();
        spin();
    }
});

// Initialize
updateBalance();
