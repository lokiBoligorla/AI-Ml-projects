import os
import json
from ai.extractor import extract_structured_data

def verify_new_prompt():
    # Simulated content based on what I saw in the browser tool
    reuters_text = """
    Apple to pay $95 million to settle Siri privacy lawsuit.
    The settlement covers millions of U.S. residents who used Siri on any Apple device (iPhone, iPad, Apple Watch, Apple TV, or HomePod) between Oct. 31, 2011, and Sept. 30, 2021.
    Eligible claimants could receive up to $100 depending on the number of claims.
    The claim submission deadline is July 2, 2025.
    The lawsuit, López v. Apple Inc, alleged Siri recorded private conversations without consent.
    Apple denies any wrongdoing but agreed to pay $95M to resolve the class action.
    """
    
    print("--- Testing New Prompt with Simulated Content ---")
    result = extract_structured_data(reuters_text)
    print(json.dumps(result, indent=2))
    
    # Check for expected fields
    expected_fields = ["title", "eligibility", "reward", "deadline", "category", "key_details", "source_relevance"]
    missing = [f for f in expected_fields if f not in result]
    if not missing:
        print("\nSUCCESS: All expected fields are present.")
    else:
        print(f"\nWARNING: Missing fields: {missing}")

if __name__ == "__main__":
    verify_new_prompt()
