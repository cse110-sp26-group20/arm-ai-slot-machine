import sys, os, re, json, datetime
from datetime import timedelta, timezone

def main():
    if len(sys.argv) != 3:
        print("Usage: python timestamp.py <start> <end>")
        sys.exit(1)

    start, end = int(sys.argv[1]), int(sys.argv[2])

    for i in range(start, end + 1):
        folder = f"candidate-{i:03d}"
        path = os.path.expanduser(f"~/.gemini/tmp/{folder}/chats")
        
        if not os.path.exists(path): continue

        # Get session file
        files = [f for f in os.listdir(path) if f.startswith("session-")]
        if not files: continue
        
        fname = files[0]
        # Parse time and adjust for LA (PDT -7)
        raw_time = re.search(r'session-(\d{4}-\d{2}-\d{2}T\d{2}-\d{2})', fname).group(1)
        dt = datetime.datetime.strptime(raw_time, "%Y-%m-%dT%H-%M")
        
        # We add :00 for seconds since the filename only has minutes
        dt_la = (dt - timedelta(hours=8)).replace(second=0, tzinfo=timezone(timedelta(hours=-7)))
        
        # Read the first line of the output message from JSON
        with open(os.path.join(path, fname), 'r') as f:
            data = json.load(f)
            # Find the specific message line in the file content
            raw_content = json.dumps(data)
            match = re.search(r'Successfully created and wrote to new file: [^"]+index\.html\.', raw_content)
            msg = match.group(0) if match else "Message not found"

        print(f"{dt_la.isoformat()} | {folder} | {msg}")

if __name__ == "__main__":
    main()