import os
import json
import logging
from config.settings import GEMINI_API_KEY
import google.generativeai as genai

logger = logging.getLogger(__name__)

def extract_structured_data(input_text: str):
    """
    Uses Gemini API to extract structured data.
    If it fails, it returns a best-effort extraction from the text.
    """
    if not GEMINI_API_KEY:
        logger.warning("GEMINI_API_KEY is missing from environment. Using heuristic fallback.")
        return heuristic_extraction(input_text)
        
    try:
        genai.configure(api_key=GEMINI_API_KEY)
        # Use the latest available stable model
        model = genai.GenerativeModel('gemini-2.0-flash')
        
        cropped_text = str(input_text)[:10000]
        
        prompt = f"""
        You are an expert legal data extractor specializing in class-action settlements.
        Analyze the following text and extract the most accurate and descriptive information.
        
        REQUIRED JSON STRUCTURE:
        {{
            "title": "Full descriptive title of the settlement",
            "eligibility": "Comprehensive criteria for who can claim (dates, products, locations)",
            "reward": "Specific reward details (e.g., '$25 cash', 'pro-rated share of $95M fund')",
            "deadline": "The primary claim submission deadline (YYYY-MM-DD or descriptive)",
            "category": "The most relevant category (e.g., Privacy, Consumer, Finance)",
            "key_details": "A list of any other important facts or 'criteria' mentioned",
            "source_relevance": "High/Medium/Low based on how much settlement info is present"
        }}

        TEXT TO ANALYZE:
        {cropped_text}
        
        Respond ONLY with the raw JSON object. Do not include any preamble or markdown formatting.
        """
        
        response = model.generate_content(prompt)
        content = response.text.strip()
        
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        elif "```" in content:
            content = content.split("```")[1].split("```")[0].strip()
            
        return json.loads(content)
        
    except Exception as e:
        logger.error(f"Gemini API Error: {e}")
        # If it's a model error, try one more alternative
        if "not supported" in str(e).lower():
            try:
                model = genai.GenerativeModel('gemini-pro')
                response = model.generate_content(prompt)
                return json.loads(response.text.strip())
            except:
                pass
        return heuristic_extraction(input_text)

def heuristic_extraction(text: str):
    """
    Analyzes text for basic info if AI fails.
    Filters out common server error messages.
    """
    import re
    
    # Filter out garbage lines like '406 Not Acceptable' or 'Page not working'
    garbage_keywords = ["page isnt working", "406 not acceptable", "access denied", "cloudflare", "403 forbidden"]
    
    lines = [L.strip() for L in text.split('\n') if L.strip() and not any(k in L.lower() for k in garbage_keywords)]
    title = lines[0] if lines else "Untitled Settlement"
    if len(title) > 100: title = title[:97] + "..."
    
    # Refined Reward Extraction
    reward_pattern = r'\$\d+(?:,\d+)*(?:\.\d+)?(?:\s+(?:million|billion))?'
    rewards = re.findall(reward_pattern, text, re.IGNORECASE)
    reward = rewards[0] if rewards else "Amount not specified in preview"
    
    # Refined Date Extraction (look for 'deadline', 'due', 'by')
    deadline = "Refer to source article"
    date_context = re.findall(r'(?:deadline|due|by|until)[^.]{0,50}(\d{1,2}/\d{1,2}/\d{2,4}|\w+ \d{1,2}, \d{4})', text, re.IGNORECASE)
    if date_context:
        deadline = date_context[0]
    elif dates:
        deadline = dates[0]

    # Key Details Heuristic
    key_details = []
    if rewards: key_details.append(f"Found mention of settlement amount: {rewards[0]}")
    if "privacy" in text.lower(): key_details.append("Related to User Privacy/Data usage")
    if "apple" in text.lower(): key_details.append("Entity involved: Apple")
    
    return {
        "title": title,
        "eligibility": "Refer to the source link for full eligibility requirements.",
        "reward": reward,
        "deadline": deadline,
        "category": category,
        "key_details": key_details if key_details else ["Information extracted via heuristic fallback - accuracy may be limited"],
        "source_relevance": "Medium" if rewards else "Low"
    }
