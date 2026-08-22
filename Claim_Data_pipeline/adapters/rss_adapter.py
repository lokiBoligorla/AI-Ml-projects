import feedparser
import logging

logger = logging.getLogger(__name__)

def fetch_rss_data(url: str):
    """
    Adapter for RSS feeds.
    """
    try:
        feed = feedparser.parse(url)
        results = []
        for entry in feed.entries:
            results.append({
                "title": entry.get("title", "No Title"),
                "description": entry.get("summary", ""),
                "source": url,
                "raw_data": str(entry)
            })
        return results # RSS can return multiple items
    except Exception as e:
        logger.error(f"Error fetching RSS {url}: {e}")
        return None
