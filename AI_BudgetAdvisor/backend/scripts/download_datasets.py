import os
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random

# Ensure directory structures exist
DATASETS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "datasets")
MODELS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "models")
os.makedirs(DATASETS_DIR, exist_ok=True)
os.makedirs(MODELS_DIR, exist_ok=True)

# File paths
TRANSACTION_CLASSIFICATION_PATH = os.path.join(DATASETS_DIR, "bank_transactions_cleaned.csv")
UPI_TRANSACTIONS_PATH = os.path.join(DATASETS_DIR, "upi_transactions_cleaned.csv")
HOUSEHOLD_EXPENSE_PATH = os.path.join(DATASETS_DIR, "household_expenses_cleaned.csv")
ANOMALY_DETECTION_PATH = os.path.join(DATASETS_DIR, "credit_card_anomalies_cleaned.csv")
FINAL_MERGED_PATH = os.path.join(DATASETS_DIR, "final_transactions.csv")

def download_from_kaggle():
    """
    Attempts to download target datasets from Kaggle.
    If Kaggle API is not configured or fails, returns False to trigger fallback generator.
    """
    print("[*] Checking Kaggle API credentials...")
    kaggle_configured = False
    
    # Check environment variables or kaggle.json path
    home_dir = os.path.expanduser("~")
    kaggle_json_path = os.path.join(home_dir, ".kaggle", "kaggle.json")
    if os.getenv("KAGGLE_USERNAME") and os.getenv("KAGGLE_KEY"):
        kaggle_configured = True
    elif os.path.exists(kaggle_json_path):
        kaggle_configured = True
        
    if not kaggle_configured:
        print("[!] Kaggle credentials not found. Falling back to robust synthetic generation...")
        return False
        
    try:
        import kaggle
        print("[*] Kaggle API found. Authenticating...")
        kaggle.api.authenticate()
        
        print("[*] Downloading dataset search targets...")
        
        # 1. Bank Transaction Classification Dataset
        print("[*] Downloading: Bank Transaction Classification...")
        kaggle.api.dataset_download_files('astamg/bank-transaction-classification', path=DATASETS_DIR, unzip=True)
        
        # 2. UPI Transactions Dataset
        print("[*] Downloading: UPI Transactions...")
        kaggle.api.dataset_download_files('manishkc06/upi-transactions-dataset', path=DATASETS_DIR, unzip=True)
        
        # 3. Household Expense Dataset
        print("[*] Downloading: Household Expense...")
        kaggle.api.dataset_download_files('ihm/household-expense-dataset', path=DATASETS_DIR, unzip=True)
        
        # 4. Credit Card Fraud Detection Dataset
        print("[*] Downloading: Credit Card Anomaly/Fraud Detection...")
        kaggle.api.dataset_download_files('mlg-ulb/creditcardfraud', path=DATASETS_DIR, unzip=True)
        
        print("[+] Kaggle datasets downloaded successfully.")
        return True
    except Exception as e:
        print(f"[!] Kaggle API error: {e}. Falling back to robust synthetic generation...")
        return False

def generate_highly_realistic_datasets():
    """
    Generates premium quality synthetic transaction history containing 2500+ records.
    Specifically models student expenses (hostel, food, transport, part-time income, etc.)
    and standard household expenses + credit card anomalies.
    """
    print("[*] Generating highly realistic synthetic dataset...")
    
    # Categories: Food, Transport, Shopping, Education, Entertainment, Bills, Healthcare, Hostel, Travel, Miscellaneous
    # Income classes: Part-Time Income, Stipend, Salary, Pocket Money, Cashback
    
    # Vocabulary mappings for NLP training
    vocab_map = {
        "Food": [
            "Swiggy Delivery Hyderabad", "Zomato Order", "Dominos Pizza", "Starbucks Coffee", 
            "Campus Canteen Maggie", "Maggie Point Gate 2", "Student Mess Fees Monthly", 
            "Noodles corner", "Juice Shop hostel", "Biryani House Restaurant", "Supermarket Groceries",
            "Local vegetable vendor", "Chai Tapri Tea & Samosa", "KFC Chicken meal", "Burger King combo"
        ],
        "Transport": [
            "Uber Auto Ride", "Ola Cab Booking", "Metro Card Recharge Metro Station", "Local Bus Ticket",
            "Auto Fare Cash", "Petrol Pump HP", "Shell Fuel Station", "Train Ticket IRCTC", 
            "Bike taxi Rapido", "Car rental service", "Parking charges mall", "Toll plaza fee"
        ],
        "Shopping": [
            "Amazon shopping clothes", "Myntra t-shirt purchase", "Zara retail mall", 
            "Local thrift store jacket", "Flipkart electronics gadget", "Shoppers Stop shoes", 
            "Book Store college textbooks", "Stationery shop notebook", "Decathlon sports gear",
            "Nike showroom sneakers", "H&M jeans", "Sunglasses purchase store"
        ],
        "Education": [
            "College Tuition Fee Semester 1", "University Exam Fee", "Coursera Certificate subscription",
            "Udemy Python Course", "Library overdue book fine", "Scientific Calculator Casio", 
            "Photocopy shop xerox notes", "Lab manual printout charges", "Academic Journal Subscription",
            "Coaching class monthly fee"
        ],
        "Entertainment": [
            "Netflix subscription premium", "Spotify Premium monthly plan", "BookMyShow Movie Ticket PVR",
            "Gaming Zone Arcade Mall", "Concert ticket EDM show", "Bowling Alley Arena", 
            "Laser tag game weekend", "Amusement park ticket", "Board game cafe bill", 
            "Pub weekend entry cover charge"
        ],
        "Bills": [
            "Electricity bill board", "Water supply bill", "Airtel broadband wifi", 
            "Jio Prepaid Mobile Recharge", "Hostel Electricity surcharge", "Gas cylinder booking Indane",
            "DTH TV recharge Tata Sky", "Cloud storage Google One", "GitHub Copilot Subscription"
        ],
        "Healthcare": [
            "Apollo Pharmacy medicines", "Dentist consultation clinic", "Student health insurance premium",
            "Eye test & spectacles frames", "General Physician consultation fee", "Cough syrup & vitamins",
            "Gym membership monthly fee", "Multivitamins health supplements", "First aid box bandage"
        ],
        "Hostel": [
            "Hostel Room Rent Monthly AC", "Hostel Security Deposit Refundable", "Hostel Washing Machine Token",
            "Hostel Room Heater Surcharge", "PG accommodation rent", "Hostel warden room repair",
            "Hostel laundry charges"
        ],
        "Travel": [
            "MakeMyTrip flight Bangalore to Delhi", "RedBus booking home town", "Hotel room booking OYO",
            "Airbnb stay vacation room", "Luggage bag purchase Safari", "Travel agent booking ticket"
        ],
        "Miscellaneous": [
            "ATM Cash withdrawal Self", "Friend Splitwise repayment", "Lost cash wallet", 
            "Laundry detergent detergent shop", "Temple donation offering", "Gift box wrapper"
        ]
    }
    
    income_map = {
        "Part-Time Income": [
            "Part time tutoring kid", "Freelance Web Design payment", "Coding gig client work", 
            "TA Stipend College Dept", "Social media management fee"
        ],
        "Salary": [
            "Monthly Salary Net Credit", "TCS Payroll credit", "Wipro software engineer salary",
            "Stipend Internship Google", "Infosys Salary account credit"
        ],
        "Pocket Money": [
            "Pocket money Dad transfer", "Parents monthly allowance", "Uncle birthday gift money"
        ],
        "Cashback": [
            "GPay cashback reward", "Cred cash back points", "Credit card cash back reward"
        ]
    }
    
    # Generate transactions list
    records = []
    start_date = datetime.now() - timedelta(days=365) # 1 year of data
    
    # Setup users: standard user (id=1, student/freelancer), household user (id=2, professional), admin (id=3)
    user_configs = [
        {"id": 1, "income_min": 15000, "income_max": 25000, "is_student": True},
        {"id": 2, "income_min": 60000, "income_max": 90000, "is_student": False},
        {"id": 3, "income_min": 100000, "income_max": 150000, "is_student": False}
    ]
    
    random.seed(42)
    np.random.seed(42)
    
    for config in user_configs:
        current_date = start_date
        user_id = config["id"]
        
        while current_date <= datetime.now():
            # 1. Income credits (usually start of month or bi-weekly)
            if current_date.day in [1, 5, 10]:
                # Salary / Pocket Money / Major Income
                inc_type = "Salary" if not config["is_student"] else "Pocket Money"
                desc = random.choice(income_map[inc_type])
                amount = random.randint(config["income_min"], config["income_max"])
                records.append({
                    "user_id": user_id,
                    "date": current_date + timedelta(hours=random.randint(9, 12)),
                    "description": desc,
                    "amount": float(amount),
                    "category": "Income",
                    "type": "income",
                    "source": "Bank Transfer",
                    "is_anomaly": False,
                    "anomaly_score": 0.0
                })
                
            # Random part-time / cashback income throughout the month
            if random.random() < 0.08: # 8% chance per day
                inc_type = random.choice(["Part-Time Income", "Cashback"])
                desc = random.choice(income_map[inc_type])
                amount = random.randint(200, 3000) if inc_type == "Part-Time Income" else random.randint(10, 150)
                records.append({
                    "user_id": user_id,
                    "date": current_date + timedelta(hours=random.randint(10, 18)),
                    "description": desc,
                    "amount": float(amount),
                    "category": "Income",
                    "type": "income",
                    "source": "UPI" if inc_type == "Part-Time Income" else "System Wallet",
                    "is_anomaly": False,
                    "anomaly_score": 0.0
                })
                
            # 2. Daily Expenses
            # Determine number of expenses today (0 to 4)
            num_expenses = random.randint(0, 4)
            for _ in range(num_expenses):
                # Choose category based on profile (students spend more on Hostel/Food/Education)
                if config["is_student"]:
                    cats = ["Food", "Food", "Food", "Transport", "Shopping", "Education", "Entertainment", "Bills", "Hostel", "Miscellaneous"]
                else:
                    cats = ["Food", "Transport", "Shopping", "Entertainment", "Bills", "Bills", "Healthcare", "Travel", "Miscellaneous"]
                    
                category = random.choice(cats)
                desc = random.choice(vocab_map[category])
                
                # Determine amount based on category and user profile
                if category == "Hostel":
                    amount = random.randint(4500, 8500) if current_date.day == 2 else random.randint(50, 200) # Big rent on 2nd of month
                elif category == "Education":
                    amount = random.randint(10000, 45000) if random.random() < 0.02 else random.randint(100, 1500) # Big semester fee or small books
                elif category == "Food":
                    amount = random.randint(80, 450)
                elif category == "Transport":
                    amount = random.randint(30, 350)
                elif category == "Shopping":
                    amount = random.randint(400, 4000)
                elif category == "Entertainment":
                    amount = random.randint(150, 1200)
                elif category == "Bills":
                    amount = random.randint(100, 2500)
                elif category == "Healthcare":
                    amount = random.randint(200, 1500)
                elif category == "Travel":
                    amount = random.randint(2000, 8000)
                else:
                    amount = random.randint(50, 500)
                    
                # Introduce Anomalies (1.5% chance)
                is_anomaly = False
                anomaly_score = 0.0
                if random.random() < 0.015:
                    is_anomaly = True
                    anomaly_score = random.uniform(70.0, 95.0)
                    # Severe spike or weird description
                    anomaly_type = random.choice(["spike", "weird_hour", "huge_shopping"])
                    if anomaly_type == "spike":
                        amount = amount * 15 # 15x normal transaction
                        desc = f"CRITICAL SPIKE - {desc}"
                    elif anomaly_type == "weird_hour":
                        amount = amount * 3
                        desc = f"MIDNIGHT SUSPICIOUS - {desc}"
                    else:
                        amount = random.randint(75000, 120000)
                        desc = "LUXURY DIAMOND RING JEWELLER"
                
                # Determine source
                source = random.choice(["UPI", "UPI", "NetBanking", "Credit Card", "Cash"])
                
                # Setup hour (weird_hour has anomalies in midnight)
                hour = random.randint(8, 23)
                if is_anomaly and "MIDNIGHT" in desc:
                    hour = random.choice([1, 2, 3, 4])
                    
                records.append({
                    "user_id": user_id,
                    "date": current_date + timedelta(hours=hour, minutes=random.randint(0, 59)),
                    "description": desc,
                    "amount": float(amount),
                    "category": category,
                    "type": "expense",
                    "source": source,
                    "is_anomaly": is_anomaly,
                    "anomaly_score": float(anomaly_score)
                })
                
            current_date += timedelta(days=1)
            
    df = pd.DataFrame(records)
    
    # Save individual target datasets for consistency
    # 1. Bank Transaction Classification
    df_bank = df[df["source"].isin(["NetBanking", "Credit Card"])].copy()
    df_bank.to_csv(TRANSACTION_CLASSIFICATION_PATH, index=False)
    print(f"[+] Saved Bank Transactions: {len(df_bank)} records.")
    
    # 2. UPI Transactions
    df_upi = df[df["source"] == "UPI"].copy()
    df_upi.to_csv(UPI_TRANSACTIONS_PATH, index=False)
    print(f"[+] Saved UPI Transactions: {len(df_upi)} records.")
    
    # 3. Household Expenses
    df_house = df[(df["user_id"] == 2) & (df["type"] == "expense")].copy()
    df_house.to_csv(HOUSEHOLD_EXPENSE_PATH, index=False)
    print(f"[+] Saved Household Expenses: {len(df_house)} records.")
    
    # 4. Credit Card Anomaly Detection
    df_anomaly = df[df["source"] == "Credit Card"].copy()
    df_anomaly.to_csv(ANOMALY_DETECTION_PATH, index=False)
    print(f"[+] Saved Credit Card Anomalies: {len(df_anomaly)} records.")
    
    # Save Merged Dataset
    df.to_csv(FINAL_MERGED_PATH, index=False)
    print(f"[+] Saved Cleaned & Merged dataset at {FINAL_MERGED_PATH}. Total: {len(df)} records.")

def setup_all_datasets():
    print("==========================================================")
    print("AI PERSONAL FINANCE: AUTOMATED DATASET SETUP PIPELINE")
    print("==========================================================")
    
    # Try downloading from Kaggle first
    success = download_from_kaggle()
    
    if not success:
        # Generate our custom rich synthetic data which perfectly models student & anomaly targets
        generate_highly_realistic_datasets()
        
    print("[+] Dataset setup pipeline completed successfully.")
    print("==========================================================")

if __name__ == "__main__":
    setup_all_datasets()
