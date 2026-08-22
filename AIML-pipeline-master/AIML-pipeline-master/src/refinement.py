import json
import numpy as np
from .config import INT_TO_COMMAND

def refine_command(model, features, cortex_command, cortex_confidence, cortex_attention):
    """
    Acts as the refinement layer over simulated Cortex API outputs.
    
    Args:
        model: The trained Keras ANN model.
        features: The 16-dimensional input array (14 EEG + 1 conf + 1 att) for the current sample.
        cortex_command: The simulated command from Cortex API.
        cortex_confidence: The simulated confidence from Cortex API.
        cortex_attention: The simulated attention from Cortex API.
        
    Returns:
        JSON string ready to be sent to the Master Hub.
    """
    # 1. Predict using the ANN model
    prediction_probs = model.predict(features.reshape(1, -1), verbose=0)
    ann_prediction_idx = np.argmax(prediction_probs, axis=1)[0]
    ann_command = INT_TO_COMMAND[ann_prediction_idx]
    
    # 2. Refinement Logic
    status = ""
    final_command = cortex_command
    
    # Rule 1: Low confidence -> reject
    if cortex_confidence < 0.5:
        status = "rejected"
        final_command = "Neutral" # Or maintain cortex_command, but usually rejected means no action
        
    # Rule 3: If ANN prediction differs -> correct
    elif ann_command != cortex_command:
        status = "corrected"
        final_command = ann_command
        
    # Rule 2: High confidence + stable signal (we assume stable if passed above checks and matches)
    else:
        status = "accepted"
        final_command = cortex_command

    # 3. Format as JSON for the Master Hub
    output = {
        "final_command": final_command,
        "status": status
    }
    
    return json.dumps(output, indent=2)
