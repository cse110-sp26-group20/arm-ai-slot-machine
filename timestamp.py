import sys
import os
import datetime

def main():
    # Check if the correct number of arguments is provided
    if len(sys.argv) != 3:
        print("Usage: python timestamp.py <start_number> <end_number>")
        print("Example: python timestamp.py 30 40")
        sys.exit(1)

    # Attempt to convert arguments to integers
    try:
        start_num = int(sys.argv[1])
        end_num = int(sys.argv[2])
    except ValueError:
        print("Error: Arguments must be integers.")
        sys.exit(1)

    if start_num > end_num:
        print("Error: The start number cannot be greater than the end number.")
        sys.exit(1)

    # Iterate through the range of numbers
    for i in range(start_num, end_num + 1):
        # Format the folder name, :03d ensures it's padded with leading zeros to 3 digits
        folder_name = f"step1/candidate-{i:03d}"
        file_path = os.path.join(folder_name, "index.html")

        if os.path.exists(file_path):
            # Get the timestamp
            # os.path.getmtime gets the last modification time (most reliable across platforms)
            # Use os.path.getctime(file_path) on Windows for strict creation time.
            # Use os.stat(file_path).st_birthtime on macOS for strict creation time.
            raw_timestamp = os.path.getmtime(file_path)
            
            # Convert to a human-readable format for easier verification
            readable_time = datetime.datetime.fromtimestamp(raw_timestamp).strftime('%Y-%m-%d %H:%M:%S')
            
            print(f"[{folder_name}] index.html -> Timestamp: {raw_timestamp} ({readable_time})")
        else:
            print(f"[{folder_name}] index.html -> File not found")

if __name__ == "__main__":
    main()