import numpy as np

try:
    import pyautogui
    PYAUTOGUI_AVAILABLE = True
except ImportError:
    PYAUTOGUI_AVAILABLE = False

import platform

try:
    import winsound
    WINSOUND_AVAILABLE = platform.system() == "Windows"
except ImportError:
    WINSOUND_AVAILABLE = False

def execute_command(command):
    """
    Simulates or executes software control based on the predicted command.
    """
    print(f"\n" + "="*40)
    print(f">>> BCI PREDICTION TRIGGERED: {command}")
    print("="*40)
    
    if command == "PLAY":
        print("Result: [PLAY] Simulating PLAY action...")
        if PYAUTOGUI_AVAILABLE:
            print("   -> Sending physical 'Play/Pause' media key to Windows.")
            pyautogui.press('playpause')
        if WINSOUND_AVAILABLE:
            winsound.MessageBeep(winsound.MB_OK)
            
    elif command == "PAUSE":
        print("Result: [PAUSE] Simulating PAUSE action...")
        if PYAUTOGUI_AVAILABLE:
            print("   -> Sending physical 'Play/Pause' media key to Windows.")
            pyautogui.press('playpause')
        if WINSOUND_AVAILABLE:
            winsound.MessageBeep(winsound.MB_ICONASTERISK)
            
    elif command == "NEXT":
        print("Result: [NEXT] Simulating NEXT track action...")
        if PYAUTOGUI_AVAILABLE:
            print("   -> Sending physical 'Next Track' media key to Windows.")
            pyautogui.press('nexttrack')
        if WINSOUND_AVAILABLE:
            winsound.MessageBeep(winsound.MB_ICONEXCLAMATION)
            
    else:
        print("Result: [UNKNOWN] Unknown command.")
    print("="*40 + "\n")

def predict_single_sample(model, scaler, raw_sample):
    """
    Takes a single raw EEG sample (1x32), preprocesses it, 
    extracts features, and predicts the command.
    """
    # 1. Reshape to (1, -1) for scaler
    sample_reshaped = raw_sample.reshape(1, -1)
    
    # 2. Normalize using the same scaler from training
    sample_scaled = scaler.transform(sample_reshaped)
    
    # 3. Feature Extraction (Mean, Std, Max, Min across the 32 scaled channels)
    # Using the same logic as feature_extraction.py
    mean_val = np.mean(sample_scaled, axis=1)
    std_val = np.std(sample_scaled, axis=1)
    max_val = np.max(sample_scaled, axis=1)
    min_val = np.min(sample_scaled, axis=1)
    features = np.column_stack((mean_val, std_val, max_val, min_val))
    
    # 4. Predict
    prediction = model.predict(features)
    return prediction[0]

if __name__ == "__main__":
    # Test simulation
    execute_command("PLAY")
    execute_command("PAUSE")
    execute_command("NEXT")
