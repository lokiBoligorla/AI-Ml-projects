import re
import logging

logger = logging.getLogger(__name__)

def clean_text(text: str):
    """
    Cleans text using regex, normalizes spaces, and handles basic formatting.
    """
    try:
        if not text:
            return ""
            
        # Remove multiple newlines and spaces
        text = re.sub(r'\s+', ' ', text)
        
        # Remove unwanted characters (keep basic punctuation)
        text = re.sub(r'[^\w\s\.,?!\-\%]', '', text)
        
        return text.strip()
    except Exception as e:
        logger.error(f"Error cleaning text: {e}")
        return text

def normalize_date(date_str: str):
    """
    Basic date normalization to YYYY-MM-DD (placeholder).
    In a real app, use dateutil.parser.
    """
    # Simply return as is for now or use regex to extract year-month-day
    # Placeholder for actual normalization logic
    return date_str
