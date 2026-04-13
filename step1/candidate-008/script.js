const symbols = [
  { emoji: "🤖", name: "AI Bot", weight: 40, value: 50 },
  { emoji: "💩", name: "Hallucination", weight: 30, value: 0 },
  { emoji: "📄", name: "Token", weight: 20, value: 200 },
  { emoji: "🧠", name: "AGI", weight: 8, value: 1000 },
  { emoji: "📉", name: "GPU Crash", weight: 2, value: -500 }, // Special negative symbol
];

const messages = {
  winBig: [
    "AGI achieved! Here are your tokens!",
    "Venture Capitalists are throwing money at you!",
    "Scaling laws proved correct! Massive payout!",
  ],
  winSmall: [
    "Good prompt engineering! You won some tokens back.",
    "Model successfully aligned. Minor profit.",
    "Context window expanded!",
  ],
  lose: [
    "The model hallucinated heavily. Tokens wasted.",
    "Rate limit exceeded. Try again.",
    "API error 503. The GPUs are crying.",
    "Your prompt was too ambiguous. Output is garbage.",
    "Overfit! You lost.",
  ],
  crash: [
    "OOM Error! Out of Memory! GPUs crashed and burned!",
    "Compute cluster caught fire! Massive token penalty!",
  ],
  broke: [
    "You are out of tokens. Time to sell more data.",
    "Account suspended due to insufficient funds.",
  ],
};

let balance = 10000;
const spinCost = 100;
let isSpinning = false;

const balanceDisplay = document.getElementById("balance");
const messageDisplay = document.getElementById("message");
const spinBtn = document.getElementById("spin-btn");
const reels = [
  document.querySelector("#reel1 .symbols"),
  document.querySelector("#reel2 .symbols"),
  document.querySelector("#reel3 .symbols"),
];

function updateBalance(amount) {
  balance += amount;
  balanceDisplay.textContent = balance;
  if (balance < spinCost) {
    spinBtn.disabled = true;
    showMessage(getRandomMsg(messages.broke));
  }
}

function showMessage(msg) {
  messageDisplay.textContent = msg;
}

function getRandomMsg(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomSymbol() {
  const totalWeight = symbols.reduce((sum, sym) => sum + sym.weight, 0);
  let random = Math.floor(Math.random() * totalWeight);
  for (let sym of symbols) {
    if (random < sym.weight) return sym;
    random -= sym.weight;
  }
  return symbols[0];
}

function spin() {
  if (isSpinning || balance < spinCost) return;

  isSpinning = true;
  spinBtn.disabled = true;
  updateBalance(-spinCost);
  showMessage("Generating output... (Please wait while we waste compute)");

  const spinResults = [];

  // Animate reels
  reels.forEach((reel, index) => {
    const result = getRandomSymbol();
    spinResults.push(result);

    reel.parentElement.classList.add("spinning");

    // Rapidly change symbols during spin
    let spinInterval = setInterval(() => {
      reel.textContent = getRandomSymbol().emoji;
    }, 100);

    // Stop at different times for effect
    setTimeout(
      () => {
        clearInterval(spinInterval);
        reel.parentElement.classList.remove("spinning");
        reel.textContent = result.emoji;

        // Check win when the last reel stops
        if (index === reels.length - 1) {
          setTimeout(() => checkWin(spinResults), 200);
        }
      },
      1000 + index * 500,
    );
  });
}

function checkWin(results) {
  isSpinning = false;
  spinBtn.disabled = false;

  const counts = {};
  results.forEach((r) => (counts[r.emoji] = (counts[r.emoji] || 0) + 1));

  // Check for GPU Crash first
  if (results.some((r) => r.emoji === "📉")) {
    const crashCount = counts["📉"];
    const penalty = symbols.find((s) => s.emoji === "📉").value * crashCount;
    updateBalance(penalty);
    showMessage(`${getRandomMsg(messages.crash)} Penalty: ${penalty} tokens!`);
    return;
  }

  // Check for 3 of a kind
  const threeOfAKind = Object.keys(counts).find((k) => counts[k] === 3);
  if (threeOfAKind) {
    const symbol = symbols.find((s) => s.emoji === threeOfAKind);
    if (symbol.emoji === "💩") {
      showMessage(
        "TRIPLE HALLUCINATION! Complete nonsense generated. 0 tokens.",
      );
    } else {
      const winAmount = symbol.value * 10;
      updateBalance(winAmount);
      showMessage(
        `${getRandomMsg(messages.winBig)} You won ${winAmount} tokens!`,
      );
    }
    return;
  }

  // Check for 2 of a kind
  const twoOfAKind = Object.keys(counts).find((k) => counts[k] === 2);
  if (twoOfAKind) {
    const symbol = symbols.find((s) => s.emoji === twoOfAKind);
    if (symbol.emoji === "💩") {
      showMessage(
        "Partial hallucination detected. Outputs are sketchy. 0 tokens.",
      );
    } else {
      const winAmount = symbol.value;
      updateBalance(winAmount);
      showMessage(
        `${getRandomMsg(messages.winSmall)} You won ${winAmount} tokens.`,
      );
    }
    return;
  }

  // Lose
  showMessage(getRandomMsg(messages.lose));

  // Re-check balance in case they dropped below cost
  if (balance < spinCost) {
    spinBtn.disabled = true;
  }
}

spinBtn.addEventListener("click", spin);

// Optional: Spacebar to spin
document.addEventListener("keydown", (e) => {
  if (e.code === "Space" && !spinBtn.disabled) {
    e.preventDefault();
    spin();
  }
});
