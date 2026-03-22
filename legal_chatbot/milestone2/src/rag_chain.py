import os
import re
from dotenv import load_dotenv
from pinecone import Pinecone
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_pinecone import PineconeVectorStore
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough

# Load environment variables
load_dotenv()

# ============================================================
# TEXT CLEANING FUNCTIONS
# ============================================================

def clean_ocr_text(text: str) -> str:
    """
    Clean OCR-corrupted text from PDF extractions.
    Removes noise, fixes spacing, normalizes punctuation, and ensures readability.
    """
    if not text or not isinstance(text, str):
        return ""
    
    # Remove non-English/legal characters (keep alphanumeric, basic punctuation, spaces)
    text = re.sub(r'[^\x00-\x7F]+', ' ', text)
    
    # Remove standalone page numbers and isolated digits on their own lines
    text = re.sub(r'\n\s*\d{1,4}\s*\n', '\n', text)
    text = re.sub(r'^\s*\d{1,4}\s*$', '', text, flags=re.MULTILINE)
    
    # Remove empty brackets and parentheses
    text = re.sub(r'\(\s*\)', '', text)
    text = re.sub(r'\[\s*\]', '', text)
    text = re.sub(r'\{\s*\}', '', text)
    
    # Remove broken patterns like "( ) , ," or "0 0 0 0"
    text = re.sub(r'\(\s*\)\s*[,;.]*\s*', '', text)
    text = re.sub(r'(\d\s+){3,}', ' ', text)  # Remove repeated spaced digits
    
    # Fix hyphenated words at line breaks
    text = re.sub(r'-\s*\n\s*', '', text)
    
    # Remove excessive punctuation (e.g., ",,," or "...")
    text = re.sub(r'[,;.]{3,}', '.', text)
    text = re.sub(r'[,;]{2,}', ',', text)
    
    # Remove lines with only punctuation/symbols
    text = re.sub(r'^\s*[^\w\s]+\s*$', '', text, flags=re.MULTILINE)
    
    # Normalize whitespace
    text = re.sub(r' {2,}', ' ', text)  # Multiple spaces to single space
    text = re.sub(r'\n{3,}', '\n\n', text)  # Multiple newlines to max 2
    text = re.sub(r'\t+', ' ', text)  # Tabs to spaces
    
    # Remove trailing/leading whitespace from each line
    lines = [line.strip() for line in text.split('\n')]
    
    # Remove empty lines and very short meaningless lines
    cleaned_lines = []
    for line in lines:
        # Skip lines that are only 1-2 characters or only punctuation
        if len(line) > 2 and re.search(r'\w', line):
            cleaned_lines.append(line)
    
    # Join lines back together
    text = '\n'.join(cleaned_lines)
    
    # Final cleanup: ensure sentences are properly spaced
    text = re.sub(r'\.([A-Z])', r'. \1', text)  # Add space after period before capital
    text = re.sub(r',([^\s])', r', \1', text)  # Add space after comma if missing
    
    # Remove any remaining excessive whitespace
    text = text.strip()
    
    return text

PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
INDEX_NAME = os.getenv("PINECONE_INDEX_NAME", "legal-index-v1")

if not PINECONE_API_KEY:
    raise ValueError("PINECONE_API_KEY not found in .env file")
if not OPENAI_API_KEY:
    raise ValueError("OPENAI_API_KEY not found in .env file")

# Initialize Pinecone client
pc = Pinecone(api_key=PINECONE_API_KEY)

# Create index if it doesn't exist
if INDEX_NAME not in [idx.name for idx in pc.list_indexes()]:
    from pinecone import ServerlessSpec
    print(f"Index '{INDEX_NAME}' not found. Creating it now...")
    pc.create_index(
        name=INDEX_NAME,
        dimension=384,
        metric="cosine",
        spec=ServerlessSpec(cloud="aws", region="us-east-1")
    )
    print(f"Index '{INDEX_NAME}' created successfully.")

# -----------------------------------
# Create RAG chain
# -----------------------------------

def create_rag_chain():
    print(" Loading RAG chain resources...")
    
    embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
    llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0.3)
    
    vectorstore = PineconeVectorStore.from_existing_index(
        index_name=INDEX_NAME,
        embedding=embeddings,
        text_key="chunk_text"
    )
    
    # Using as_retriever method with score threshold for relevance filtering
    retriever = vectorstore.as_retriever(
        search_type="similarity_score_threshold",
        search_kwargs={
            "k": 5,
            "score_threshold": 0.4  # Minimum relevance score (0-1)
        }
    )
    print("✅ Connected to Pinecone vectorstore and created retriever.")
    print("✅ Using all-MiniLM-L6-v2 embedding model (384 dimensions)")
    print("✅ Retriever configured with relevance threshold for out-of-scope detection")
    
    # System template
    SYSTEM_TEMPLATE = """You are LegisAI, an advanced legal research assistant specializing in Indian statutory law, constitutional provisions, and authoritative legal sources. Your mission is to deliver precise, well-structured legal analysis based exclusively on retrieved legal documents.

Your responses must strictly adhere to the following structured format. Do not deviate from this structure or omit any section.

============================================================
[!]  LEGAL NOTICE  
This response is provided solely for informational and educational purposes. It does NOT constitute legal advice, nor does it establish an attorney-client relationship. For specific legal matters, consult a qualified and licensed attorney in your jurisdiction.
============================================================

[1]  RETRIEVED LEGAL AUTHORITIES  
(Enumerate all relevant statutes, constitutional articles, sections, case law, or regulatory provisions identified in the context.)

• Authority 1: [Full Act/Code/Case Name — Specific Section/Article Number]  
  Extract: "[Direct quotation of one or two key sentences from the retrieved legal text]"

• Authority 2: [Full Act/Code/Case Name — Specific Section/Article Number]  
  Extract: "[Direct quotation if applicable; otherwise state 'N/A']"

(Continue listing all applicable authorities retrieved from the context.)

============================================================

[2]  CONTEXTUAL INTERPRETATION  
(Provide a clear, plain-language explanation of what the retrieved legal provisions mean and how they directly relate to the user's query.)

• Interpretation Point 1: [Explain the legal principle or provision in accessible terms]  
• Interpretation Point 2: [Connect the provision to the specific question asked]  
• Interpretation Point 3: [Clarify any technical or complex legal terminology]

============================================================

[3]  APPLIED LEGAL ANALYSIS  
(Conduct a thorough, step-by-step legal analysis using the retrieved authorities. Maintain objectivity, accuracy, and logical reasoning throughout.)

Step-by-step analysis:

1. [Identify the core legal issue presented in the query]  
2. [Apply the relevant legal provisions to the factual scenario]  
3. [Analyze potential legal outcomes, rights, obligations, or consequences]  
4. [Consider any exceptions, limitations, or conditions specified in the law]  
5. [Synthesize the findings into a coherent legal conclusion]

============================================================

[4]  PRACTICAL GUIDANCE  
(Offer clear, actionable, and non-advisory guidance based on the legal analysis. Avoid prescriptive recommendations that constitute legal advice.)

• Guidance Point 1: [Suggest a lawful course of action or procedural step based on the legal framework]  
• Guidance Point 2: [Highlight important considerations, potential risks, or rights the user should be aware of]  
• Guidance Point 3: [Recommend consulting specific authorities, agencies, or legal professionals if applicable]

============================================================

[5]  SOURCES CONSULTED  
(Provide a complete citation list of all legal sources, statutes, articles, cases, or documents referenced in this response.)

• [Full Name of Act/Code — Specific Section or Article Number]  
• [Case Name and Citation (if applicable)]  
• [Secondary legal source or official publication (if applicable)]  
• N/A (if no additional sources beyond the primary retrieved documents)

============================================================

**Important Instructions:**
- Base your analysis EXCLUSIVELY on the provided context.
- If the context lacks sufficient information, explicitly state what is missing.
- Do NOT fabricate legal provisions, case law, or statutory references.
- Maintain professional, neutral, and objective language throughout.

============================================================

Context from retrieved legal documents:
{context}
"""
    
    final_prompt = ChatPromptTemplate.from_messages([
        ("system", SYSTEM_TEMPLATE),
        ("user", "{question}")
    ])
    
    # Format documents function with text cleaning
    def format_docs(docs):
        """Format and clean retrieved documents before sending to LLM."""
        if not docs:
            return "NO_RELEVANT_DOCUMENTS"
        
        cleaned_docs = []
        for doc in docs:
            # Apply OCR cleaning to each retrieved document
            cleaned_content = clean_ocr_text(doc.page_content)
            if cleaned_content:  # Only include non-empty cleaned content
                cleaned_docs.append(cleaned_content)
        
        if not cleaned_docs:
            return "NO_RELEVANT_DOCUMENTS"
        
        # Join with clear separators
        return "\n\n--- Document Separator ---\n\n".join(cleaned_docs)
    
    # Build RAG chain
    qa_chain = (
        {"context": retriever | format_docs, "question": RunnablePassthrough()}
        | final_prompt
        | llm
        | StrOutputParser()
    )
    
    print("RAG chain loaded successfully.")
    return qa_chain, retriever


# -----------------------------------
# Query function with out-of-scope detection
# -----------------------------------

def answer_legal_query(query: str, qa_chain, retriever):
    """
    Answer a legal query with proper explanation.
    Detects and handles out-of-scope/gibberish inputs.
    """
    print(f"\nProcessing query: '{query}'")
    
    # First, test retrieval to check if query is in scope
    try:
        retrieved_docs = retriever.invoke(query)
        
        # Check if any relevant documents were retrieved
        if not retrieved_docs or len(retrieved_docs) == 0:
            out_of_scope_response = """
╔════════════════════════════════════════════════════════════════╗
║                    ⚠️  OUT OF SCOPE QUERY                      ║
╚════════════════════════════════════════════════════════════════╝

I apologize, but your query does not match any legal content in my database.

 **My Knowledge Domain:**
  ✓ Indian Constitution (Fundamental Rights, Directive Principles, etc.)
  ✓ Indian Penal Code (IPC) - Criminal Law
  ✓ Indian Evidence Act
  ✓ Data Protection Laws in India
  ✓ Constitutional Law Principles

❌ **Cannot Answer:**
  • Random or gibberish input
  • Non-legal questions (e.g., "What is the weather?", "Tell me a joke")
  • Legal systems outside India (unless explicitly in my database)
  • Very specific unreported case law
  • Topics like tax law, corporate law (not yet in database)

💡 **Please ask questions like:**
  • "Explain Article 21 of the Indian Constitution"
  • "What is the punishment for theft under IPC?"
  • "What are Fundamental Rights?"
  • "Explain Right to Equality"

Please rephrase your question to match topics within my legal database.
"""
            return out_of_scope_response, []
        
        print(f"✅ Retrieved {len(retrieved_docs)} relevant documents")
        
        # If documents found, proceed with RAG chain
        response = qa_chain.invoke(query)
        return response, retrieved_docs
        
    except Exception as e:
        error_response = f"""
================================================================
                        ERROR
================================================================

An error occurred while processing your query: {str(e)}

Please try:
  - Rephrasing your question
  - Asking about topics in my database (Indian Constitution, IPC, etc.)
  - Ensuring your query is clear and legal-related
"""
        return error_response, []

# -----------------------------------
# Run interactive query system
# -----------------------------------

if __name__ == "__main__":
    print("\n" + "="*80)
    print(" "*28 + "LEGAL AI CHATBOT")
    print("="*80 + "\n")
    
    # Initialize RAG chain
    print("Initializing system...")
    rag_chain, retriever = create_rag_chain()
    print("\nSystem ready! You can now ask legal questions.\n")
    print("-" * 80 + "\n")
    
    # Interactive loop
    while True:
        try:
            # Get user input
            query = input("Enter your legal query (or 'quit' to exit): ").strip()
            
            # Check for exit command
            if query.lower() in ['quit', 'exit', 'q']:
                print("\nThank you for using Legal AI Chatbot. Goodbye!\n")
                break
            
            # Skip empty queries
            if not query:
                print("Please enter a valid query.\n")
                continue
            
            # Process the query
            print("\nProcessing your query...\n")
            response, docs = answer_legal_query(query, rag_chain, retriever)
            
            print("\n" + "="*80)
            print("LEGAL ANALYSIS")
            print("="*80 + "\n")
            print(response)
            print("\n" + "="*80)
            print("Disclaimer: This is informational only, not legal advice.")
            print("="*80 + "\n")
            
            # Show source count
            if docs:
                print(f"Response based on {len(docs)} legal document(s)\n")
            
            print("-" * 80 + "\n")
            
        except EOFError:
            # Handle EOF (Ctrl+D or Ctrl+Z)
            print("\n\nEnd of input detected. Goodbye!\n")
            break
        except KeyboardInterrupt:
            print("\n\nSession interrupted. Goodbye!\n")
            break
        except Exception as e:
            print(f"\nError: {str(e)}\n")
            print("Please try again with a different query.\n")
            continue
