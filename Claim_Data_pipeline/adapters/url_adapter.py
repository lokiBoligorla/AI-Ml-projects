import requests
from bs4 import BeautifulSoup
import logging

logger = logging.getLogger(__name__)

def fetch_url_data(url: str):
    """
    Adapter for website URLs using newspaper for better news site support.
    """
    from newspaper import Article, Config
    try:
        config = Config()
        config.browser_user_agent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        config.request_timeout = 15
        
        article = Article(url, config=config)
        article.download()
        article.parse()
        
        return {
            "title": article.title or url,
            "description": article.meta_description or "",
            "source": url,
            "raw_data": article.html
        }
    except Exception as e:
        logger.error(f"Error fetching URL {url} via newspaper: {e}")
        return None
