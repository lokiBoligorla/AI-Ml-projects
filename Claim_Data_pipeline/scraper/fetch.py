import requests
import logging

logger = logging.getLogger(__name__)

def fetch_content(source_url: str):
    """
    General fetcher with improved headers to avoid blocks.
    """
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Referer": "https://www.google.com/"
    }
    try:
        response = requests.get(source_url, headers=headers, timeout=15)
        response.raise_for_status()
        return response.text
    except Exception as e:
        logger.error(f"Error fetching content from {source_url}: {e}")
        return None
