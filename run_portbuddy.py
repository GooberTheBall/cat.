import os
import time
import subprocess
import sys


SUCCESS_PATTERN = "Port Buddy - Mode: http"
RETRY_DELAY = 2
COMMAND = ["portbuddy", "8000"]

def start_portbuddy():
    return subprocess.Popen(
        COMMAND,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1, # line‑buffered
    )
    
def wait_for_tunnel():
    while True:
        print("Starting portbuddy 8000…")
        proc = start_portbuddy()

        # Read output line by line until the tunnel is active or the process ends
        for line in proc.stdout:
            print(line, end="") # show live output
            if SUCCESS_PATTERN in line.lower():
                print("\n!!!--Tunnel is active--!!!")
                return proc

        # If we reach here the process exited without success
        print("Tunnel did not become active. Retrying…\n")
        proc.terminate()
        proc.wait()
        time.sleep(RETRY_DELAY)
        
if __name__ == "__main__":
    active_proc = wait_for_tunnel()
    try:
        active_proc.wait()
    except KeyboardInterrupt:
        print("\nShutting down…")
        active_proc.terminate()
        sys.exit(0)