import pdfplumber
import logging
import os

logger = logging.getLogger(__name__)

def fetch_pdf_data(file_path: str):
    """
    Adapter for PDF files.
    """
    try:
        if not os.path.exists(file_path):
            logger.error(f"PDF file not found: {file_path}")
            return None
            
        if file_path.endswith('.txt'):
            with open(file_path, 'r') as f:
                text = f.read()
        elif file_path.endswith('.pdf'):
            with pdfplumber.open(file_path) as pdf:
                text = ""
                for page in pdf.pages:
                    text += page.extract_text() or ""
        else:
            logger.error(f"Unsupported file format: {file_path}")
            return None
        
        return {
            "title": os.path.basename(file_path),
            "description": "Extracted text from PDF",
            "source": file_path,
            "raw_data": text
        }
    except Exception as e:
        logger.error(f"Error reading PDF {file_path}: {e}")
        return None
