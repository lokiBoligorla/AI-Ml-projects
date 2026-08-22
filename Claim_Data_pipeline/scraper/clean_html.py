from bs4 import BeautifulSoup
from newspaper import Article
import logging

logger = logging.getLogger(__name__)

def clean_html(html_content: str):
    """
    Removes scripts, styles, ads, etc. using BeautifulSoup.
    """
    try:
        soup = BeautifulSoup(html_content, 'html.parser')
        
        # Remove unwanted elements
        for script_or_style in soup(["script", "style", "nav", "footer", "header", "aside"]):
            script_or_style.decompose()
            
        # Get text
        clean_text = soup.get_text(separator=' ')
        return clean_text
    except Exception as e:
        logger.error(f"Error cleaning HTML during BS4: {e}")
        return html_content

def extract_main_content(url: str, html_content: str = None):
    """
    Extracts main content using newspaper3k.
    """
    try:
        config = {
            "browser_user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
        article = Article(url, **config)
        if html_content:
            article.set_html(html_content)
        else:
            from .fetch import fetch_content
            html = fetch_content(url)
            if not html:
                logger.error(f"Failed to fetch content for {url}")
                return None
            article.set_html(html)
            
        article.parse()
        return {
            "title": article.title,
            "text": article.text,
            "summary": article.summary,
            "authors": article.authors,
            "publish_date": str(article.publish_date)
        }
    except Exception as e:
        logger.error(f"Error extracting content from {url}: {e}")
        return None
