import pandas as pd
import numpy as np

def generate_mock_eeg_data(num_samples=1000, output_file='features_raw.csv'):
    """
    Generates a mock dataset resembling Emotiv EPOC X 14-channel EEG output.
    """
    # 14 standard Emotiv channels
    channels = ['AF3', 'F7', 'F3', 'FC5', 'T7', 'P7', 'O1', 'O2', 'P8', 'T8', 'FC6', 'F4', 'F8', 'AF4']
    
    # Generate random normally distributed data to simulate EEG signals
    data = np.random.randn(num_samples, len(channels)) * 100 
    
    df = pd.DataFrame(data, columns=channels)
    
    # We will simulate missing values for robustness check (optional)
    # df.iloc[10:15, 0] = np.nan
    
    df.to_csv(output_file, index=False)
    print(f"Mock EEG data generated and saved to {output_file} with {num_samples} samples.")

if __name__ == "__main__":
    generate_mock_eeg_data()
