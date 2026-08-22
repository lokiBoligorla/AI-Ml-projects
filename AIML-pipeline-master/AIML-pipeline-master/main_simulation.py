import time
import random
import json
from tensorflow.keras.models import load_model
from src.config import MODEL_SAVE_PATH, COMMAND_CLASSES
from src.data_processor import load_and_preprocess_data
from src.refinement import refine_command

def run_simulation():
    """
    Simulates real-time data streaming from Cortex API and passing it through the Refinement Layer.
    """
    print("Loading model and data for simulation...")
    try:
        model = load_model(MODEL_SAVE_PATH)
    except OSError:
        print(f"Model not found at {MODEL_SAVE_PATH}. Please run training first.")
        return

    # Load data (we reuse the preprocessed features to simulate real-time input)
    X, _, _ = load_and_preprocess_data()
    if X is None:
        return
        
    print("\n--- Starting SynaptiMesh Simulation ---")
    print("Listening for Cortex API inputs...\n")
    
    simulation_log = []
    
    # Simulate 5 real-time inputs
    for i in range(1001):
        # 1. Pick a random sample from the dataset to simulate real-time EEG + metadata
        sample_idx = random.randint(0, len(X) - 1)
        features = X[sample_idx]
        
        # In our X array, the last two columns are confidence and attention
        simulated_confidence = features[-2]
        simulated_attention = features[-1]
        
        # Simulate a command from the Cortex API (sometimes accurate, sometimes wrong)
        simulated_cortex_command = random.choice(COMMAND_CLASSES)
        
        cortex_json = {
            "command": simulated_cortex_command,
            "confidence": round(float(simulated_confidence), 2),
            "attention": round(float(simulated_attention), 2)
        }
        
        # 2. Pass through Refinement Layer
        refinement_output_str = refine_command(
            model, 
            features, 
            simulated_cortex_command, 
            simulated_confidence, 
            simulated_attention
        )
        refinement_json = json.loads(refinement_output_str)

        # Log the event
        event_data = {
            "event_id": i + 1,
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
            "input_from_headset": cortex_json,
            "output_to_hub": refinement_json
        }
        simulation_log.append(event_data)
        
        # Print to console as well
        print(f"--- Event {i+1} ---")
        print("Cortex API JSON Input:")
        print(json.dumps(cortex_json, indent=2))
        print("\nRefinement Layer Output (To Master Hub):")
        print(json.dumps(refinement_json, indent=2))
        print("="*40)
        
        time.sleep(1) # Simulate real-time delay

    # 3. Save all results to a JSON file
    output_filename = "simulation_results.json"
    with open(output_filename, "w") as f:
        json.dump(simulation_log, f, indent=4)
    
    print(f"\nSimulation complete. Results saved to '{output_filename}'.")

if __name__ == "__main__":
    run_simulation()
