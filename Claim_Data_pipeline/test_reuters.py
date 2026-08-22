import os
import json
import logging
from config.settings import DATA_SOURCES, GEMINI_API_KEY
from adapters.selenium_adapter import fetch_with_selenium
from ai.extractor import extract_structured_data

# Configure logging to see what's happening
logging.basicConfig(level=logging.INFO)

def test_reuters_extraction():
    url = "https://www.reuters.com/legal/apple-pay-95-million-settle-siri-privacy-lawsuit-2025-01-02/"
    print(f"Testing URL: {url}")
    
    # 1. Scrape with Selenium (Stealth)
    print("\n--- Scraping with Selenium (Stealth) ---")
    scraped_result = fetch_with_selenium(url)
    if not scraped_result or not scraped_result.get('raw_data'):
        print("Failed to scrape content via Selenium.")
        return
        
    print(f"Scraped Title: {scraped_result.get('title')}")
    raw_html = scraped_result.get('raw_data')
    
    # Use BeautifulSoup to get clean text for the extractor
    from bs4 import BeautifulSoup
    soup = BeautifulSoup(raw_html, 'html.parser')
    for s in soup(["script", "style", "nav", "footer", "header", "aside"]):
        s.decompose()
    clean_text = soup.get_text(separator=' ', strip=True)
    
    print(f"Cleaned Text Preview: {clean_text[:500]}...")
    
    # 2. Extract
    print("\n--- Current Extraction Output ---")
    extracted_data = extract_structured_data(clean_text)
    print(json.dumps(extracted_data, indent=2))
    
if __name__ == "__main__":
    test_reuters_extraction()
