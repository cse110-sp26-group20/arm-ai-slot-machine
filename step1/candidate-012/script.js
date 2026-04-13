const symbols = [
    { emoji: "🤖", name: "AI" },
    { emoji: "🧠", name: "Brain" },
    { emoji: "💰", name: "Tokens" },
    { emoji: "🔥", name: "GPU" },
    { emoji: "🗑️", name: "Hallucination" },
    { emoji: "📈", name: "Hype" }
];

let tokens = 1000;
const costPerSpin = 50;

const tokenCountEl = document.getElementById("token-count");
const spinButton = document.getElementById("spin-button");
const messageEl = document.getElementById("message");
const reels = [
    document.getElementById("reel1"),
    document.getElementById("reel2"),
    document.getElementById("reel3")
];

const snarkySpinMessages = [
    "Computing response...",
    "Hallucinating results...",
    "Optimizing parameters...",
    "Generating next token...",
    "Querying the mainframe...",
    "Stealing your data...",
    "Training on copyrighted material..."
];

const snarkyWinMessages = [
    "AGI Achieved! Huge payout!",
    "Wow, a coherent response! You win!",
    "Model actually followed instructions! Jackpot!",
    "Zero shot success! Tokens earned."
];

const snarkySmallWinMessages = [
    "Partial match. Good enough for production.",
    "Decent output. Have some tokens back.",
    "Not bad, but still slightly hallucinated."
];

const snarkyLoseMessages = [
    "As an AI language model, I cannot let you win.",
    "Error 429: Too many requests. Tokens lost.",
    "Your prompt was poorly formatted. Try again.",
    "Safety filters triggered. Tokens confiscated.",
    "Model collapsed. Please insert more tokens.",
    "That output was completely hallucinated. You lose."
];

function getRandomSymbol() {
    return symbols[Math.floor(Math.random() * symbols.length)];
}

function getRandomMessage(messages) {
    return messages[Math.floor(Math.random() * messages.length)];
}

function updateTokens(amount) {
    tokens += amount;
    tokenCountEl.textContent = tokens;
}

function spin() {
    if (tokens < costPerSpin) {
        messageEl.textContent = "Rate limit exceeded. Not enough context tokens.";
        return;
    }

    // Deduct cost
    updateTokens(-costPerSpin);
    spinButton.disabled = true;
    messageEl.textContent = getRandomMessage(snarkySpinMessages);

    // Spin animation logic
    let spins = 0;
    const maxSpins = 20;
    
    // add spinning class
    reels.forEach(reel => reel.classList.add("spinning"));

    const spinInterval = setInterval(() => {
        reels.forEach(reel => {
            reel.textContent = getRandomSymbol().emoji;
        });
        spins++;

        if (spins >= maxSpins) {
            clearInterval(spinInterval);
            finishSpin();
        }
    }, 50);
}

function finishSpin() {
    reels.forEach(reel => reel.classList.remove("spinning"));

    const resultSymbols = [
        getRandomSymbol(),
        getRandomSymbol(),
        getRandomSymbol()
    ];

    reels[0].textContent = resultSymbols[0].emoji;
    reels[1].textContent = resultSymbols[1].emoji;
    reels[2].textContent = resultSymbols[2].emoji;

    evaluateResult(resultSymbols);
}

function evaluateResult(result) {
    if (result[0].name === result[1].name && result[1].name === result[2].name) {
        // Win big
        updateTokens(500);
        messageEl.textContent = getRandomMessage(snarkyWinMessages) + " (+500 Tokens)";
    } else if (result[0].name === result[1].name || result[1].name === result[2].name || result[0].name === result[2].name) {
        // Small win
        updateTokens(100);
        messageEl.textContent = getRandomMessage(snarkySmallWinMessages) + " (+100 Tokens)";
    } else {
        // Lose
        messageEl.textContent = getRandomMessage(snarkyLoseMessages);
    }

    spinButton.disabled = false;
}

spinButton.addEventListener("click", spin);
