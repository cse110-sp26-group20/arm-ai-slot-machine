# Demo and Instruction

1). Install [Gemini Code Assist](https://github.com/google-gemini/gemini-cli)

2). Terminal:
```bash
>  gemini -m gemini-3.1-pro-preview --yolo
```

3). Prompt: Create a slot machine app that uses vanilla web technology like HTML, CSS, JavaScript, and platform APIs. The slot machine should make fun of AI, as in you are winning tokens and spending tokens.

Then you will get
![step 1](./img/step1-1.png)

4). Stats and token
```bash
/stats
/stats model
```
![step 2](./img/step1-2.png)
![step 3](./img/step1-3.png)

5). Measure

Add the info to the `STATS.md`

![step 4](./img/step1-4.png)

# Timestamp
Read your gemini's log files. Usage: `python timestamp.py <start_number> <end_number>`

Example:

```python
python timestamp.py 31 37
'''
oject/cse110/arm-al-slot-machine/step1/candidate-030/index.html.
2026-04-12T11:25:00-07:00 | candidate-031 | Successfully created and wrote to new file: /Users/microzenas/Project/cse110/arm-al-slot-machine/step1/candidate-031/index.html.
2026-04-12T12:54:00-07:00 | candidate-032 | Successfully created and wrote to new file: /Users/microzenas/Project/cse110/arm-al-slot-machine/step1/candidate-032/index.html.
2026-04-12T12:57:00-07:00 | candidate-033 | Successfully created and wrote to new file: /Users/microzenas/Project/cse110/arm-al-slot-machine/step1/candidate-033/index.html.
2026-04-12T13:00:00-07:00 | candidate-034 | Successfully created and wrote to new file: /Users/microzenas/Project/cse110/arm-al-slot-machine/step1/candidate-034/index.html.
2026-04-12T13:02:00-07:00 | candidate-035 | Successfully created and wrote to new file: /Users/microzenas/Project/cse110/arm-al-slot-machine/step1/candidate-035/index.html.
2026-04-12T13:04:00-07:00 | candidate-036 | Successfully created and wrote to new file: /Users/microzenas/Project/cse110/arm-al-slot-machine/step1/candidate-036/index.html.
2026-04-12T13:07:00-07:00 | candidate-037 | Successfully created and wrote to new file: /Users/microzenas/Project/cse110/arm-al-slot-machine/step1/candidate-037/index.html.
2026-04-12T13:09:00-07:00 | candidate-038 | Successfully created and wrote to new file: /Users/microzenas/Project/cse110/arm-al-slot-machine/step1/candidate-038/index.html.
'''
```

Using this time: `2026-04-12T11:25:00-07:00`