import os
from langchain_community.document_loaders import TextLoader, PyPDFLoader, Docx2txtLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma

# Configuration
DATA_PATH = "data"
CHROMA_PATH = "chroma_db"

def load_documents(directory):
    documents = []
    if not os.path.exists(directory):
        return documents
        
    for root, dirs, files in os.walk(directory):
        for file in files:
            file_path = os.path.join(root, file)
            # Skip temporary/hidden files
            if file.startswith("~$") or file.startswith("."):
                continue
                
            try:
                if file.endswith('.txt'):
                    print(f"Loading text file: {file_path}...")
                    loader = TextLoader(file_path, encoding='utf-8')
                    documents.extend(loader.load())
                elif file.endswith('.pdf'):
                    print(f"Loading PDF file: {file_path}...")
                    loader = PyPDFLoader(file_path)
                    documents.extend(loader.load())
                elif file.endswith('.docx') or file.endswith('.doc'):
                    print(f"Loading Word document: {file_path}...")
                    loader = Docx2txtLoader(file_path)
                    documents.extend(loader.load())
            except Exception as e:
                print(f"Error loading {file_path}: {e}")
                
    return documents

def main():
    print(f"Loading documents from {DATA_PATH}...")
    
    documents = load_documents(DATA_PATH)
    if not documents:
        print("No documents found in the data/ folder. Please add some text, PDF, or Word files.")
        return

    print(f"Loaded {len(documents)} document(s).")
    
    # Split the documents into smaller chunks
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
        length_function=len,
    )
    chunks = text_splitter.split_documents(documents)
    print(f"Split documents into {len(chunks)} chunks.")

    # Create local embeddings using HuggingFace
    print("Initializing embedding model (this may take a moment to download on first run)...")
    embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

    # Create and persist the vector database
    print(f"Saving vectors to {CHROMA_PATH}...")
    db = Chroma.from_documents(
        chunks, 
        embeddings, 
        persist_directory=CHROMA_PATH
    )
    
    print("Ingestion complete! Database is ready.")

if __name__ == "__main__":
    main()
