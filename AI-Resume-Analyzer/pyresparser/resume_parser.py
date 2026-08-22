import os
import re
import io
# We use pdfminer.six which is highly compatible with modern Python
from pdfminer.pdfpage import PDFPage
from pdfminer.pdfinterp import PDFResourceManager, PDFPageInterpreter
from pdfminer.converter import TextConverter
from pdfminer.layout import LAParams

def extract_text_from_pdf(pdf_path):
    resource_manager = PDFResourceManager()
    fake_file_handle = io.StringIO()
    converter = TextConverter(resource_manager, fake_file_handle, laparams=LAParams())
    page_interpreter = PDFPageInterpreter(resource_manager, converter)
    with open(pdf_path, 'rb') as fh:
        for page in PDFPage.get_pages(fh, check_extractable=True):
            page_interpreter.process_page(page)
        text = fake_file_handle.getvalue()
    converter.close()
    fake_file_handle.close()
    return text

class ResumeParser:
    def __init__(self, resume_path):
        self.resume_path = resume_path
        self.details = {
            'name': None,
            'email': None,
            'mobile_number': None,
            'skills': [],
            'degree': [],
            'no_of_pages': 1
        }
        self.extract_details()

    def get_extracted_data(self):
        return self.details

    def extract_details(self):
        try:
            text = extract_text_from_pdf(self.resume_path)
        except Exception as e:
            text = ""
        
        # 1. Number of pages
        try:
            with open(self.resume_path, 'rb') as f:
                self.details['no_of_pages'] = len(list(PDFPage.get_pages(f)))
        except Exception:
            self.details['no_of_pages'] = 1

        if not text:
            return

        # 2. Email
        email_match = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', text)
        if email_match:
            self.details['email'] = email_match.group(0)

        # 3. Mobile Number
        # Support various standard formats
        mobile_match = re.search(r'\+?\d[\d\s\(\)\.-]{8,18}\d', text)
        if mobile_match:
            self.details['mobile_number'] = mobile_match.group(0).strip()

        # 4. Degree
        degrees_vocab = [
            'B.E', 'B.Tech', 'M.Tech', 'B.Sc', 'M.Sc', 'BCA', 'MCA', 'MBA', 'Ph.D', 
            'B.S.', 'M.S.', 'Bachelor', 'Master', 'Ph.D.', 'B.A.', 'M.A.', 'B.Com', 'M.Com'
        ]
        found_degrees = []
        for degree in degrees_vocab:
            pattern = r'\b' + re.escape(degree) + r'\b'
            if re.search(pattern, text, re.IGNORECASE):
                found_degrees.append(degree)
        self.details['degree'] = found_degrees if found_degrees else None

        # 5. Skills
        # Matches skills of interest in App.py as well as general programming tools
        skills_vocab = [
            # Data Science
            'tensorflow', 'keras', 'pytorch', 'machine learning', 'deep learning', 'flask', 'streamlit',
            # Web Development
            'react', 'django', 'node js', 'react js', 'php', 'laravel', 'magento', 'wordpress', 'javascript', 
            'angular js', 'asp.net', 'html', 'css', 'sql', 'mysql', 'mongodb', 'postgresql', 'sqlite',
            # Android
            'android', 'android development', 'flutter', 'kotlin', 'xml', 'kivy',
            # iOS
            'ios', 'ios development', 'swift', 'cocoa', 'cocoa touch', 'xcode',
            # UI-UX
            'ux', 'adobe xd', 'figma', 'zeplin', 'balsamiq', 'ui', 'prototyping', 'wireframes', 
            'storyframes', 'adobe photoshop', 'photoshop', 'editing', 'adobe illustrator', 'illustrator', 
            'adobe after effects', 'after effects', 'adobe premier pro', 'premier pro', 'adobe indesign', 
            'indesign', 'wireframe', 'solid', 'grasp', 'user research', 'user experience',
            # General / N_Any
            'english', 'communication', 'writing', 'microsoft office', 'leadership', 'customer management', 'social media',
            # Common Programming
            'python', 'java', 'c++', 'c#', 'git', 'github', 'docker', 'aws'
        ]
        found_skills = []
        for skill in skills_vocab:
            escaped_skill = re.escape(skill)
            pattern = r'\b' + escaped_skill + r'\b'
            if re.search(pattern, text, re.IGNORECASE):
                found_skills.append(skill)
        self.details['skills'] = found_skills

        # 6. Name
        # Attempt to use spaCy if available and installed
        name = None
        try:
            import spacy
            nlp = spacy.load('en_core_web_sm')
            doc = nlp(text[:1000])
            for ent in doc.ents:
                if ent.label_ == 'PERSON':
                    name = ent.text
                    break
        except Exception:
            pass

        if not name:
            # Simple heuristic: first non-empty line of text that doesn't contain email/numbers
            lines = [line.strip() for line in text.split('\n') if line.strip()]
            for line in lines[:5]:
                if '@' not in line and not re.search(r'\d', line) and len(line) > 3 and len(line) < 30:
                    name = line
                    break
        
        if not name:
            # Fallback to filename
            name = os.path.splitext(os.path.basename(self.resume_path))[0]
            name = re.sub(r'[-_]', ' ', name).title()

        self.details['name'] = name
