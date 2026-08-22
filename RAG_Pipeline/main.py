import os
import warnings
# Suppress noisy library warnings
warnings.filterwarnings("ignore")

from dotenv import load_dotenv

from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_classic.chains import create_retrieval_chain
from langchain_classic.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate

# Load environment variables
load_dotenv()

CHROMA_PATH = "chroma_db"
DATA_PATH = "data"

def check_ingestion():
    # If the database directory doesn't exist, run the ingestion automatically
    if not os.path.exists(CHROMA_PATH):
        print(f"Vector database not found at '{CHROMA_PATH}'. Running ingestion first...")
        try:
            import ingest
            ingest.main()
            print("\nDatabase initialization complete!\n" + "="*50 + "\n")
        except Exception as e:
            print(f"Error during automatic ingestion: {e}")
            return False
    return True

def start_interactive_loop():
    # Check if API key is set
    if not os.environ.get("GEMINI_API_KEY") or os.environ.get("GEMINI_API_KEY") == "your_gemini_api_key_here":
        print("ERROR: Please set your GEMINI_API_KEY in the .env file.")
        return

    print("Initializing embedding model...")
    embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

    print("Loading vector database...")
    db = Chroma(persist_directory=CHROMA_PATH, embedding_function=embeddings)

    print("Initializing Gemini LLM...")
    llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0)

    # Create Prompt Template
    system_prompt = (
        "You are an assistant for question-answering tasks. "
        "Use the following pieces of retrieved context to answer the question. "
        "If you don't know the answer, say that you don't know. "
        "Use three sentences maximum and keep the answer concise."
        "\n\n"
        "Context:\n{context}"
    )
    prompt = ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        ("human", "{input}"),
    ])

    # Setup RAG chain
    retriever = db.as_retriever(search_kwargs={"k": 3})
    question_answer_chain = create_stuff_documents_chain(llm, prompt)
    rag_chain = create_retrieval_chain(retriever, question_answer_chain)

    print("\n" + "="*50)
    print("Welcome to your RAG Chatbot!")
    print("Type your questions below. Type 'exit' or 'quit' to close the program.")
    print("="*50 + "\n")

    while True:
        try:
            query_text = input("User: ").strip()
            if not query_text:
                continue
                
            if query_text.lower() in ['exit', 'quit']:
                print("\nGoodbye!")
                break
                
            print("\nBot (Thinking)...")
            response = rag_chain.invoke({"input": query_text})
            
            print(f"\nAnswer:\n{response['answer']}")
            
            print("\nSources used:")
            sources = set()
            for doc in response["context"]:
                sources.add(doc.metadata.get("source", "Unknown"))
            for src in sources:
                print(f" - {src}")
            print("\n" + "-"*50 + "\n")
            
        except KeyboardInterrupt:
            print("\n\nGoodbye!")
            break

        except Exception as e:
            print(f"\nAn error occurred: {e}\n")

if __name__ == "__main__":
    if check_ingestion():
        start_interactive_loop()
