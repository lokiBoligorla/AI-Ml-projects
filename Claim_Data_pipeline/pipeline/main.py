import logging
from config.settings import DATA_SOURCES
from adapters.url_adapter import fetch_url_data
from adapters.api_adapter import fetch_api_data
from adapters.rss_adapter import fetch_rss_data
from adapters.pdf_adapter import fetch_pdf_data
from scraper.clean_html import clean_html, extract_main_content
from utils.text_processing import clean_text
from ai.extractor import extract_structured_data
from database.mongo import db_client
from datetime import datetime

logger = logging.getLogger(__name__)

def run_pipeline():
    """
    Main pipeline entry point.
    """
    logger.info("Starting Claim Ingestion Pipeline...")
    
    raw_claims = []
    
    # 1. Fetch data from all sources
    logger.info("Fetching data from sources...")
    
    # URL sources
    for url in DATA_SOURCES.get("urls", []):
        data = fetch_url_data(url)
        
        # If standard fetch fails or is suspected of being blocked, try Selenium
        if not data or "Cloudflare" in str(data.get("raw_data", "")) or "Just a moment" in str(data.get("raw_data", "")):
            from adapters.selenium_adapter import fetch_with_selenium
            data = fetch_with_selenium(url)
            
        if data: raw_claims.append(data)
        
    # API sources
    for api in DATA_SOURCES.get("apis", []):
        data = fetch_api_data(api)
        if data: raw_claims.append(data)
        
    # RSS sources
    for rss in DATA_SOURCES.get("rss", []):
        rss_data_list = fetch_rss_data(rss)
        if rss_data_list: raw_claims.extend(rss_data_list)
        
    # PDF sources
    for pdf in DATA_SOURCES.get("pdfs", []):
        data = fetch_pdf_data(pdf)
        if data: raw_claims.append(data)
        
    logger.info(f"Fetched {len(raw_claims)} raw items.")
    
    # 2. Process and store
    for item in raw_claims:
        try:
            # Store raw data first
            db_client.insert_raw_claim(item)
            
            # Clean and extract content
            logger.info(f"Cleaning item: {item['title']}...")
            if isinstance(item['raw_data'], str) and "http" in item['source']:
                content_info = extract_main_content(item['source'], item['raw_data'])
                cleaned_text = clean_text(content_info['text'] if content_info else clean_html(item['raw_data']))
            else:
                cleaned_text = clean_text(str(item['raw_data']))
            
            # AI extraction
            logger.info(f"Running AI extraction for: {item['title']}...")
            structured_data = extract_structured_data(cleaned_text)
            
            # Combine and normalize
            processed_item = {
                **structured_data,
                "source": item['source'],
                "processed_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            }
            
            # Store processed data
            db_client.insert_processed_claim(processed_item)
            
        except Exception as e:
            logger.error(f"Error processing item {item.get('title')}: {e}")

    logger.info("Pipeline execution completed.")

if __name__ == "__main__":
    run_pipeline()
