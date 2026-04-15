# Final Report: AI-Driven Slot Machine Development
**Group 20**

## 1. Executive Summary
This project investigated the consistency, variation, and refinement capabilities of Generative AI coding assistants—specifically **Gemini 3.1 Pro Preview**. By executing a frozen prompt 50 times in "clean sessions" and undergoing a structured, one-shot refinement process, the team evaluated the limits of automated code generation. While the model demonstrated high functional consistency, significant "visual drift" and "logic variance" were observed, particularly as the complexity of the requirements increased.

## 2. Methodology
* **Model:** Gemini 3.1 Pro Preview (via Gemini CLI / Headless Mode)
* **Harness:** Standardized terminal environment with a `--yolo` flag to ensure one-shot execution.
* **Clean Session Protocol:** Each run was initiated in a fresh directory with no local context or prior chat history.
* **Refinement Constraints:** Each refinement round was limited to a single-turn prompt of under 200 words, with no manual editing allowed.

## 3. Step 1 Results: Baseline Variation
We executed the original prompt 50 times. The prompt requested a vanilla web technology slot machine making fun of AI.

### Quantitative Summary (Approx)
| Metric | Average | 
| :--- | :--- |
| Input Tokens | ~120 |
| Output Tokens | ~950 | 
| Wall-Clock Time | 14.5s |
| Lines of Code | 240 |


### Observations on Drift
* **Visual Structure:** Despite identical instructions, there were reletively differing visuals between the 50.
* **Humor/Thematic Drift:** The "AI Mockery" jokes varied significantly. Early runs focused on "hallucination" and "GPU shortage" jokes, while later runs occasionally fixeded on "prompt slop" or "VC funding" themes.

## 4. The Refinement Journey (Phase 3-5)
The team selected 5 candidates for Step 2, focusing on those with the most unique features.

### Step 2: Mechanics & Grid Expansion
We moved from a 1x3 row to a **3x3 grid**. This was a "stress test" for the model's ability to refactor its own win-checking logic.
* **Universal Prompt Focus:** 3x3 grid, 5 paylines, "Near Miss" weighting, and "Skill Stop" buttons.
* **Result:** Gemini successfully implemented 2D arrays.

### Step 5: The Final Candidate
The final candidate, **"Neon Slots,"** evolved to include:
* **State Management:** An "AI Auto-Pilot" mode and a "Free Spins" bonus state.
* **Exponential Economy:** A shop system where upgrades (Luck/Money multipliers) increased in cost exponentially.
* **Visual Polish:** SVG-based icons, particle explosions for Jackpots, and neon-tracing animations for winning lines.

## 5. Learning Goals & Conclusion

### Scientific Honesty & Constraints
1.  **Tool Limitations:** The Gemini CLI  occasionally entered a "Planning Mode," which we bypassed using the `--yolo` flag to maintain the "clean session" rule.
2.  **Paywall Constraints:** Although not related to the actual final product, it
impacted our workflow and made it difficult to coordinate tasks, since only a couple people had access to the pro version of Gemini.
### Expectations
Heading into this warm-up, our main goal was to learn how AI affects the coding 
process, especially after discussion of how AI has impacted this in the modern day
SWE industry. We knew AI was capable of producing working code, but we also expected the possibility of flaws, which became apparent when generating code. Ultimately, this warm-up met our expectations with how the AI would perform.

## 6. Final Evaluation
After concluding this warm-up, we had learned a lot about the role of AI in a SWE
environment, the capabilities of prompt engineering, and the limits of AI. It gave mediocre results in the first 50 candidates, with very little functional differences between the different runs. However, after deciding on a direction to head towards with visuals and functionality, we were able to refine the AI to our expectations, highlighting the importance of a well defined prompt. After each refinement round, it would gain more features, but had the potential to lose features or new bugs would arise. In the final refinement round, we heavily stressed making sure all the bugs would be fixed, while also focusing on more UI related changes to limit the amount of functional bugs. Overall, we recognize that AI is a strong tool that can streamline a SWE's workflow if used correctly.