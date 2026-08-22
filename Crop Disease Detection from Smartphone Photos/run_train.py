#!/usr/bin/env python3
"""
Training execution wrapper with monitoring
"""
import subprocess
import sys
import os

os.chdir(r'c:\Users\User\Downloads\Crop Disease Detection from Smartphone Photos')

print("=" * 70)
print("STARTING CROP DISEASE MODEL TRAINING")
print("=" * 70)
print(f"Working directory: {os.getcwd()}")
print(f"Python executable: {sys.executable}")
print("")

# Run the training script
try:
    process = subprocess.Popen(
        [sys.executable, 'train.py'],
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1
    )
    
    for line in process.stdout:
        print(line, end='', flush=True)
    
    returncode = process.wait()
    
    print("\n" + "=" * 70)
    if returncode == 0:
        print("TRAINING COMPLETED SUCCESSFULLY")
    else:
        print(f"TRAINING FAILED WITH EXIT CODE: {returncode}")
    print("=" * 70)
    
    sys.exit(returncode)
    
except Exception as e:
    print(f"ERROR: {e}")
    sys.exit(1)
