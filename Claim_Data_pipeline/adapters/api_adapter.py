import requests
import logging

logger = logging.getLogger(__name__)

def fetch_api_data(url: str):
    """
    Adapter for JSON APIs.
    """
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        # Mapping might depend on the API structure, but let's assume a generic one
        # or just return the whole json as raw_data
        return {
            "title": f"API Claim from {url}", 
            "description": str(data),
            "source": url,
            "raw_data": data
        }
    except Exception as e:
        logger.error(f"Error fetching API {url}: {e}")
        return None
