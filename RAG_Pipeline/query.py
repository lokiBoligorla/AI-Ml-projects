import os
import argparse
from dotenv import load_dotenv
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_classic.chains import create_retrieval_chain
from langchain_classic.chains.combine_documents import create_stuff_documents_chain

from langchain_core.prompts import ChatPromptTemplate

# Load environment variables (API Key)
load_dotenv()

CHROMA_PATH = "chroma_db"

def main(query_text):
    # Check if API key is set
    if not os.environ.get("GEMINI_API_KEY") or os.environ.get("GEMINI_API_KEY") == "your_gemini_api_key_here":
        print("ERROR: Please set your GEMINI_API_KEY in the .env file.")
        return

    print("Initializing embedding model...")
    embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

    print("Loading vector database...")
    if not os.path.exists(CHROMA_PATH):
        print(f"Database not found at {CHROMA_PATH}. Please run ingest.py first.")
        return
        
    db = Chroma(persist_directory=CHROMA_PATH, embedding_function=embeddings)

    # Initialize Gemini LLM
    # We use gemini-2.5-flash as it's fast and highly capable for RAG tasks
    llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0)


    # Create the Prompt Template for Augmentation
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

    # Create the chains
    retriever = db.as_retriever(search_kwargs={"k": 3})
    question_answer_chain = create_stuff_documents_chain(llm, prompt)
    rag_chain = create_retrieval_chain(retriever, question_answer_chain)

    print(f"\n--- Question: {query_text} ---")
    print("Generating answer...\n")
    
    # Execute the chain
    response = rag_chain.invoke({"input": query_text})
    
    print("Answer:")
    print(response["answer"])
    
    print("\nSources used:")
    for doc in response["context"]:
        source = doc.metadata.get("source", "Unknown")
        print(f"- {source}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Query the RAG pipeline.")
    parser.add_argument("query", type=str, help="The question you want to ask.")
    args = parser.parse_args()
    
    main(args.query)
