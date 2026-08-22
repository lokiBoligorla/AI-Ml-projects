import csv
import pickle
from sklearn.linear_model import LinearRegression

def train_model():
    X = []
    y = []
    
    # Read dataset using Python's built-in csv module to minimize external dependencies
    with open('FuelConsumptionCo2.csv', mode='r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            try:
                # Features and target labels
                engine_size = float(row['ENGINESIZE'])
                co2_emissions = float(row['CO2EMISSIONS'])
                
                # Appending features as a 2D array and target as 2D array
                X.append([engine_size])
                y.append([co2_emissions])
            except (ValueError, KeyError):
                continue
                
    if not X:
        print("Error: No data loaded from FuelConsumptionCo2.csv.")
        return
        
    print(f"Loaded {len(X)} rows of data.")
    
    # Train the linear regression model
    regr = LinearRegression()
    regr.fit(X, y)
    
    # Save the trained model to model.pkl
    with open('model.pkl', 'wb') as f:
        pickle.dump(regr, f)
        
    print("Model successfully trained and saved to model.pkl!")

if __name__ == "__main__":
    train_model()
