from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings

# 1. Initialize the exact same embedding model you used to create the DB
embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

# 2. Load the existing database from the local folder
db = Chroma(persist_directory="chroma_db", embedding_function=embeddings)

# 3. Retrieve all the stored data
data = db.get()

# 4. See what's inside!
print(f"Total chunks stored in the database: {len(data['ids'])}")

if len(data['ids']) > 0:
    print("\n--------- FIRST CHUNK IN DATABASE ---------")
    print(f"ID: {data['ids'][0]}")
    print(f"Metadata (Source File): {data['metadatas'][0]}")
    print(f"\nText Content:\n{data['documents'][0]}")
    print("-------------------------------------------")
