import sys
import os
import re
import json
import datetime
from datetime import timedelta

def extract_time_and_output(candidate_num):
    # Construct the cache directory path
    cache_dir = os.path.expanduser(f"~/.gemini/tmp/candidate-{candidate_num:03d}/chats")
    
    if not os.path.exists(cache_dir):
        return None, None, None
        
    for filename in os.listdir(cache_dir):
        if filename.startswith("session-") and filename.endswith(".json"):
            file_path = os.path.join(cache_dir, filename)
            
            # 1. Parse time, apply -8 offset, and generate both formats
            match = re.search(r'session-(\d{4}-\d{2}-\d{2}T\d{2}-\d{2})', filename)
            if match:
                raw_time = match.group(1)
                dt_original = datetime.datetime.strptime(raw_time, "%Y-%m-%dT%H-%M")
                
                # Apply the -8 hours offset for LA
                dt_la = dt_original - timedelta(hours=8)
                
                unix_ts = int(dt_la.timestamp())
                readable_time = dt_la.strftime("%Y-%m-%d %H:%M:%S (PT)")
            else:
                unix_ts, readable_time = "N/A", "Unknown"

            extracted_outputs = []
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    
                def find_outputs(obj):
                    if isinstance(obj, dict):
                        for k, v in obj.items():
                            if k == "output" and isinstance(v, str):
                                extracted_outputs.append(v)
                            find_outputs(v)
                    elif isinstance(obj, list):
                        for item in obj:
                            find_outputs(item)
                            
                find_outputs(data)
                return unix_ts, readable_time, extracted_outputs
                
            except Exception as e:
                return unix_ts, readable_time, [f"JSON parsing error: {str(e)}"]
                
    return None, None, None

def main():
    if len(sys.argv) != 3:
        print("Usage: python timestamp.py <start_number> <end_number>")
        sys.exit(1)

    try:
        start_num = int(sys.argv[1])
        end_num = int(sys.argv[2])
    except ValueError:
        print("Error: Arguments must be integers.")
        sys.exit(1)

    print("="*75)
    print(f"{'Folder':<15} | {'Timestamp':<12} | {'Local Time (LA)'}")
    print("="*75)

    for i in range(start_num, end_num + 1):
        folder_name = f"candidate-{i:03d}"
        unix_ts, readable_time, outputs = extract_time_and_output(i)

        if unix_ts:
            # Print the summary line
            print(f"{folder_name:<15} | {unix_ts:<12} | {readable_time}")
            
            if outputs:
                target_output = next((out for out in outputs if "index.html" in out), outputs[0])
                first_line = target_output.split('\n', 1)[0].strip()
                print(f"  └─ Message: {first_line}\n")
            else:
                print("  └─ ⚠️ No output found.\n")
        else:
            print(f"{folder_name:<15} | {'N/A':<12} | No cache file found.\n")

if __name__ == "__main__":
    main()