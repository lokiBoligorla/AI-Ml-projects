import json
import os

# Define Domain Mapping (Which commands belong to which application area)
DOMAIN_MAPPINGS = {
    "IoT_SmartHome": {
        "commands": ["Push", "Pull", "Rotate Left", "Rotate Right"],
        "description": "Controls for Lights, Fans, and Dimmers."
    },
    "Desktop_Control": {
        "commands": ["Left", "Right", "Lift", "Drop"],
        "description": "Media player, Scrolling, and Presentation control."
    },
    "Mobile_App": {
        "commands": ["Left", "Right", "Push"],
        "description": "App navigation, Swiping, and Selection."
    },
    "Embedded_Robotics": {
        "commands": ["Push", "Pull", "Left", "Right"],
        "description": "Movement control for Wheelchairs and Robotic Arms."
    }
}

def segregate_simulation_data(input_file='simulation_results.json', output_dir='domain_results'):
    """
    Reads the main simulation results and splits them into domain-specific files.
    """
    if not os.path.exists(input_file):
        print(f"Error: {input_file} not found. Run main_simulation.py first.")
        return

    # Create output directory if it doesn't exist
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    # Load the main simulation data
    with open(input_file, 'r') as f:
        all_events = json.load(f)

    print(f"Loaded {len(all_events)} simulation events. Segregating by domain...")

    # Process each domain
    summary = {}
    for domain, config in DOMAIN_MAPPINGS.items():
        valid_commands = config['commands']
        
        # Filter events that have a final_command belonging to this domain
        # We only take events where status is 'accepted' or 'corrected' (ignoring 'rejected' for live devices)
        segregated_events = [
            event for event in all_events 
            if event['output_to_hub']['final_command'] in valid_commands 
            and event['output_to_hub']['status'] != 'rejected'
        ]

        # Save to domain-specific file
        output_filename = os.path.join(output_dir, f"{domain.lower()}_commands.json")
        with open(output_filename, 'w') as f:
            json.dump(segregated_events, f, indent=4)
        
        summary[domain] = len(segregated_events)
        print(f" -> {domain}: {len(segregated_events)} commands saved to {output_filename}")

    print("\n--- Segregation Summary ---")
    for domain, count in summary.items():
        print(f"{domain}: {count} relevant events")

if __name__ == "__main__":
    segregate_simulation_data()
