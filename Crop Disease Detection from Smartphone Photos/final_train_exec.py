#!/usr/bin/env python3
"""
Training execution wrapper with real-time output capture
"""
import subprocess
import sys
import os
from pathlib import Path

def main():
    """Execute training with proper output handling"""
    os.chdir(r'c:\Users\User\Downloads\Crop Disease Detection from Smartphone Photos')
    
    print("="*80)
    print("CROP DISEASE DETECTION MODEL TRAINING")
    print("="*80)
    print(f"Working Directory: {os.getcwd()}")
    print(f"Python: {sys.version}")
    print("="*80)
    print("\nStarting training pipeline...")
    print("-"*80)
    
    try:
        # Run start_training.py which handles all setup
        result = subprocess.run(
            [sys.executable, "start_training.py"],
            cwd=os.getcwd(),
            text=True
        )
        
        if result.returncode == 0:
            print("\n" + "="*80)
            print("SUCCESS: Training completed successfully!")
            print("="*80)
            
            # Check for generated files
            model_dir = Path("model")
            if model_dir.exists():
                print("\nGenerated files:")
                for file in sorted(model_dir.glob("*")):
                    size_mb = file.stat().st_size / (1024 * 1024)
                    print(f"  ✓ {file.relative_to('.')} ({size_mb:.2f} MB)")
        else:
            print(f"\nTraining failed with exit code: {result.returncode}")
            sys.exit(1)
            
    except Exception as e:
        print(f"\nERROR: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()
