import undetected_chromedriver as uc
from selenium_stealth import stealth
import time
import logging

logger = logging.getLogger(__name__)

def fetch_with_selenium(url: str):
    """
    Advanced Deep Scraper using undetected-chromedriver and selenium-stealth.
    """
    driver = None
    try:
        logger.info(f"Attempting Stealth Deep Scraping for: {url}")
        
        options = uc.ChromeOptions()
        # options.add_argument("--headless") # Comment out to bypass strict Cloudflare
        options.add_argument("--disable-gpu")
        
        driver = uc.Chrome(options=options)
        
        # Apply stealth
        stealth(driver,
            languages=["en-US", "en"],
            vendor="Google Inc.",
            platform="Win32",
            webgl_vendor="Intel Inc.",
            renderer="Intel Iris OpenGL Engine",
            fix_hairline=True,
        )
        
        driver.get(url)
        
        # Wait for potential Cloudflare challenge or dynamic content
        time.sleep(10) 
        
        page_source = driver.page_source
        title = driver.title
        
        if "Cloudflare" in page_source or "Just a moment" in page_source:
            logger.warning(f"Cloudflare detected for {url}. Waiting longer...")
            time.sleep(10)
            page_source = driver.page_source

        return {
            "title": title or url,
            "description": "Extracted via Stealth Deep Scraper",
            "source": url,
            "raw_data": page_source
        }
        
    except Exception as e:
        logger.error(f"Error during Stealth Selenium scraping for {url}: {e}")
        return None
    finally:
        if driver:
            try:
                driver.close()
                driver.quit()
            except Exception:
                # On Windows, uc can sometimes throw 'Invalid handle' on quit
                pass
