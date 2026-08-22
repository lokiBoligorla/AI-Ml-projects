import os

# Define the Command Set (Fixed Output Classes)
COMMAND_CLASSES = [
    "Neutral", 
    "Push", 
    "Pull", 
    "Left", 
    "Right", 
    "Lift", 
    "Drop", 
    "Rotate Left", 
    "Rotate Right"
]

NUM_CLASSES = len(COMMAND_CLASSES)

# Mapping commands to integers for model training
COMMAND_TO_INT = {cmd: i for i, cmd in enumerate(COMMAND_CLASSES)}
INT_TO_COMMAND = {i: cmd for i, cmd in enumerate(COMMAND_CLASSES)}

# EEG Channel Names (Assuming 14 Emotiv channels)
EEG_CHANNELS = ['AF3', 'F7', 'F3', 'FC5', 'T7', 'P7', 'O1', 'O2', 'P8', 'T8', 'FC6', 'F4', 'F8', 'AF4']

# File paths
DATA_FILE = 'features_raw.csv'
MODEL_SAVE_PATH = 'synaptimesh_model.h5'

# Model Hyperparameters
EPOCHS = 50
BATCH_SIZE = 32
LEARNING_RATE = 0.001
