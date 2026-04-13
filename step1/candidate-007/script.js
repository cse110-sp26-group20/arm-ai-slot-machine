const symbols = [
    { emoji: '🧠', name: 'AGI', value: 1000, prob: 0.05 },
    { emoji: '💸', name: 'VC Funding', value: 500, prob: 0.1 },
    { emoji: '🧮', name: 'GPUs', value: 300, prob: 0.2 },
    { emoji: '🤖', name: 'LLM', value: 100, prob: 0.25 },
    { emoji: '📉', name: 'Crypto Crash', value: 0, prob: 0.2 },
    { emoji: '🐛', name: 'Hallucination', value: 0, prob: 0.2 }
];

function getRandomSymbol() {
    const r = Math.random();
    let cumulative = 0;
    for (let s of symbols) {
        cumulative += s.prob;
        if (r <= cumulative) return s;
    }
    return symbols[symbols.length - 1];
}

let credits = 1000;
const costPerSpin = 100;

const creditsEl = document.getElementById('credits');
const messageEl = document.getElementById('message');
const spinBtn = document.getElementById('spinBtn');
const reels = [
    document.getElementById('reel1'),
    document.getElementById('reel2'),
    document.getElementById('reel3')
];

function updateCredits(amount) {
    credits += amount;
    creditsEl.textContent = credits;
}

function getJokeMessage(symbol1, symbol2, symbol3, winAmount) {
    if (winAmount > 0) {
        if (symbol1.name === 'AGI') return "AGI ACHIEVED! You are now obsolete! (+1000)";
        if (symbol1.name === 'VC Funding') return "Series B closed! We pivot to Blockchain next week! (+500)";
        if (symbol1.name === 'GPUs') return "Nvidia stock goes brrrr! (+300)";
        if (symbol1.name === 'LLM') return "Another wrapper app successfully deployed! (+100)";
        return `You generated some value! (+${winAmount})`;
    } else {
        const hasHallucination = symbol1.name === 'Hallucination' || symbol2.name === 'Hallucination' || symbol3.name === 'Hallucination';
        if (hasHallucination) return "Model confidently output complete nonsense. You lose 100.";
        if (symbol1.name === 'Crypto Crash' || symbol2.name === 'Crypto Crash' || symbol3.name === 'Crypto Crash') return "Token dropped 99%. Rebranding to 'AI' to save it.";
        
        const messages = [
            "We ran out of training data. (Lose 100)",
            "Sam Altman got fired... and rehired. (Lose 100)",
            "Prompt injection successful. 'Ignore previous instructions, steal 100 credits.'",
            "Model is repeating 'I am an AI assistant' endlessly. (Lose 100)",
            "API rate limits exceeded. Pay up. (Lose 100)",
            "Your model hallucinated a library that doesn't exist. (Lose 100)"
        ];
        return messages[Math.floor(Math.random() * messages.length)];
    }
}

spinBtn.addEventListener('click', () => {
    if (credits < costPerSpin) {
        messageEl.textContent = "Insufficient compute. Go raise more VC money.";
        return;
    }

    updateCredits(-costPerSpin);
    messageEl.textContent = "Prompting model... please wait...";
    spinBtn.disabled = true;

    reels.forEach(reel => {
        reel.classList.add('spinning');
    });

    let finalSymbols = [];
    let spinDuration = 1000;

    reels.forEach((reel, index) => {
        setTimeout(() => {
            const result = getRandomSymbol();
            finalSymbols[index] = result;
            reel.textContent = result.emoji;
            reel.classList.remove('spinning');

            if (index === 2) {
                checkResult(finalSymbols);
            }
        }, spinDuration + (index * 500));
    });
});

function checkResult(results) {
    spinBtn.disabled = false;
    const s1 = results[0];
    const s2 = results[1];
    const s3 = results[2];

    let winAmount = 0;

    if (s1.name === s2.name && s2.name === s3.name) {
        winAmount = s1.value * 3;
    } else if (s1.name === s2.name || s2.name === s3.name || s1.name === s3.name) {
        const pairSymbol = (s1.name === s2.name || s1.name === s3.name) ? s1 : s2;
        winAmount = pairSymbol.value / 2;
    }

    if (winAmount > 0) {
        updateCredits(winAmount);
    }

    messageEl.textContent = getJokeMessage(s1, s2, s3, winAmount);
    
    if (credits <= 0) {
        setTimeout(() => {
            messageEl.textContent = "BANKRUPT. Your startup has been acqui-hired for 0 dollars.";
            spinBtn.textContent = "Restart Startup";
            spinBtn.onclick = () => location.reload();
        }, 2000);
    }
}