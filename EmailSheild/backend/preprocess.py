import re
import string
import nltk

# Ensure NLTK resources are downloaded
try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    try:
        nltk.download('stopwords', quiet=True)
    except Exception:
        pass

class TextPreprocessor:
    def __init__(self):
        # We will import these here to prevent issues if nltk download failed initially
        try:
            from nltk.corpus import stopwords
            self.stop_words = set(stopwords.words('english'))
        except Exception:
            # Fallback stopwords in case NLTK corpus fails to load
            self.stop_words = {
                "i", "me", "my", "myself", "we", "our", "ours", "ourselves", "you", "your", "yours", 
                "yourself", "yourselves", "he", "him", "his", "himself", "she", "her", "hers", 
                "herself", "it", "its", "itself", "they", "them", "their", "theirs", "themselves", 
                "what", "which", "who", "whom", "this", "that", "these", "those", "am", "is", "are", 
                "was", "were", "be", "been", "being", "have", "has", "had", "having", "do", "does", 
                "did", "doing", "a", "an", "the", "and", "but", "if", "or", "because", "as", "until", 
                "while", "of", "at", "by", "for", "with", "about", "against", "between", "into", 
                "through", "during", "before", "after", "above", "below", "to", "from", "up", "down", 
                "in", "out", "on", "off", "over", "under", "again", "further", "then", "once", "here", 
                "there", "when", "where", "why", "how", "all", "any", "both", "each", "few", "more", 
                "most", "other", "some", "such", "no", "nor", "not", "only", "own", "same", "so", 
                "than", "too", "very", "s", "t", "can", "will", "just", "don", "should", "now", "d", 
                "ll", "m", "o", "re", "ve", "y", "ain", "aren", "couldn", "didn", "doesn", "hadn", 
                "hasn", "haven", "isn", "ma", "mightn", "mustn", "needn", "shan", "shouldn", "wasn", 
                "weren", "won", "wouldn"
            }
        
        try:
            from nltk.stem import PorterStemmer
            self.stemmer = PorterStemmer()
        except Exception:
            self.stemmer = None

    def clean_text(self, text):
        if not text or not isinstance(text, str):
            return ""
        
        # 1. Lowercase conversion
        text = text.lower()
        
        # 2. Remove standard URLs inside vectors to keep clean vocabulary
        text = re.sub(r'https?://\S+|www\.\S+', '', text)
        
        # 3. Remove punctuation and special characters
        translator = str.maketrans('', '', string.punctuation)
        text = text.translate(translator)
        
        # 4. Tokenization (whitespace based)
        tokens = text.split()
        
        # 5. Remove Stopwords and Stem remaining words
        cleaned_tokens = []
        for token in tokens:
            if token not in self.stop_words and token.isalpha():
                if self.stemmer:
                    stemmed = self.stemmer.stem(token)
                else:
                    stemmed = token
                cleaned_tokens.append(stemmed)
                
        return " ".join(cleaned_tokens)

# Singleton instance
preprocessor = TextPreprocessor()

def preprocess_text(text):
    return preprocessor.clean_text(text)
