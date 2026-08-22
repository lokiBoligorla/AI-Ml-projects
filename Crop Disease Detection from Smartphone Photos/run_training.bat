@echo off
REM Training script for LeafShield AI Crop Disease Detection Model

setlocal enabledelayedexpansion

echo.
echo ========================================
echo   LeafShield AI - Training Pipeline
echo ========================================
echo.

REM Check Python installation
echo [STEP 1] Verifying Python installation...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.9+ from https://www.python.org/
    pause
    exit /b 1
)
echo [OK] Python is installed

REM Install dependencies
echo.
echo [STEP 2] Installing required packages...
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)
echo [OK] Dependencies installed

REM Check for Kaggle token
echo.
echo [STEP 3] Checking Kaggle credentials...
if exist "access_token" (
    echo [OK] Kaggle access token found
) else (
    echo WARNING: access_token file not found
    echo Please ensure you have Kaggle API credentials set up
)

REM Start training
echo.
echo [STEP 4] Starting model training...
echo This may take 20-40 minutes depending on your hardware
echo.

python train.py

if %errorlevel% neq 0 (
    echo.
    echo ERROR: Training failed
    pause
    exit /b 1
)

echo.
echo ========================================
echo   Training completed successfully!
echo ========================================
echo.
echo Generated files:
echo   - model/crop_disease_model.h5 (Keras model)
echo   - model/crop_disease_model.tflite (Quantized TFLite)
echo   - model/label_encoder.pkl (Class labels)
echo   - model/training_history.png (Training curves)
echo   - model/confusion_matrix.png (Confusion matrix)
echo.
echo Next step: Run 'streamlit run app.py' to launch the web dashboard
echo.
pause
