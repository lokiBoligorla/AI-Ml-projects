#!/usr/bin/env python
"""
Standalone training launcher for LeafShield AI
Ensures all dependencies are met and starts the training pipeline.
"""

import sys
import os
import subprocess

def check_python_version():
    """Verify Python 3.9+"""
    if sys.version_info < (3, 9):
        print(f"ERROR: Python 3.9+ required. Current version: {sys.version}")
        return False
    print(f"[OK] Python version OK: {sys.version.split()[0]}")
    return True

def check_and_install_requirements():
    """Install packages from requirements.txt"""
    print("\n[STEP] Installing/verifying required packages...")
    try:
        subprocess.check_call([
            sys.executable, "-m", "pip", "install", 
            "-q", "-r", "requirements.txt"
        ])
        print("[OK] All dependencies installed")
        return True
    except subprocess.CalledProcessError as e:
        print(f"ERROR: Failed to install dependencies: {e}")
        return False

def verify_kaggle_token():
    """Verify Kaggle credentials exist"""
    print("\n[STEP] Verifying Kaggle credentials...")
    home_dir = os.path.expanduser("~")
    kaggle_dir = os.path.join(home_dir, ".kaggle")
    
    # Check various locations
    locations = [
        os.path.join(kaggle_dir, "kaggle.json"),
        os.path.join(kaggle_dir, "access_token"),
        os.path.join(os.getcwd(), "kaggle.json"),
        os.path.join(os.getcwd(), "access_token"),
    ]
    
    for loc in locations:
        if os.path.exists(loc):
            print(f"[OK] Kaggle credentials found at: {loc}")
            return True
    
    print("WARNING: Kaggle credentials not found in expected locations")
    print(f"Expected locations:")
    for loc in locations:
        print(f"  - {loc}")
    print("\nPlease ensure you have set up Kaggle API credentials.")
    print("See: https://www.kaggle.com/account/profile/account")
    return False

def main():
    """Main training launcher"""
    print("="*70)
    print("  LeafShield AI - Crop Disease Detection Model Training")
    print("="*70)
    
    # Step 1: Check Python version
    if not check_python_version():
        sys.exit(1)
    
    # Step 2: Install dependencies
    if not check_and_install_requirements():
        sys.exit(1)
    
    # Step 3: Verify Kaggle credentials
    verify_kaggle_token()  # Warning only, not a blocker
    
    # Step 4: Run training
    print("\n[STEP] Starting training pipeline...")
    print("-"*70)
    print("This may take 20-40 minutes depending on your hardware.")
    print("Training stages:")
    print("  1. Download PlantVillage dataset from Kaggle")
    print("  2. Prepare and augment training/validation splits")
    print("  3. Train MobileNetV2 transfer learning model")
    print("  4. Generate quantized TFLite model")
    print("  5. Generate training curves and confusion matrix")
    print("-"*70)
    
    try:
        from train import main as train_main
        train_main()
        print("\n" + "="*70)
        print("  [SUCCESS] TRAINING COMPLETED SUCCESSFULLY!")
        print("="*70)
        print("\nGenerated artifacts:")
        print("  [OK] model/crop_disease_model.h5 (Keras model)")
        print("  [OK] model/crop_disease_model.tflite (Quantized TFLite)")
        print("  [OK] model/label_encoder.pkl (Class labels)")
        print("  [OK] model/training_history.png (Training curves)")
        print("  [OK] model/confusion_matrix.png (Confusion matrix)")
        print("\nNext step: Launch the web dashboard")
        print("  Run: streamlit run app.py")
        print("="*70)
        
    except Exception as e:
        print(f"\nERROR: Training failed with exception:")
        print(f"  {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()
