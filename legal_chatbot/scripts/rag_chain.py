import os
import re
from dotenv import load_dotenv
from pinecone import Pinecone
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from langchain_pinecone import PineconeVectorStore
from langchain_core.messages import HumanMessage, AIMessage
 
load_dotenv()



def clean_ocr_text(text: str) -> str:
    """
    Clean OCR-corrupted text from PDF extractions.
    Removes noise, fixes spacing, normalizes punctuation, and ensures readability.
    """
    # Handle non-string inputs safely
    if text is None:
        return ""
    
    # Convert to string if it's not already
    if not isinstance(text, str):
        text = str(text)
    
    if not text:
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
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
INDEX_NAME = os.getenv("PINECONE_INDEX_NAME", "legal-index-v1")

if not PINECONE_API_KEY:
    raise ValueError("PINECONE_API_KEY not found in .env file")
if not GOOGLE_API_KEY:
    raise ValueError("GOOGLE_API_KEY not found in .env file")

# -----------------------------------
# Create RAG chain
# -----------------------------------

def create_rag_chain():
    print(" Loading RAG chain resources...")
    
    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2",
        model_kwargs={'device': 'cpu'}
    )
    llm = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        temperature=0.3,
        google_api_key=GOOGLE_API_KEY
    )
    
    # Modern Pinecone SDK (not deprecated pinecone.init)
    pc = Pinecone(api_key=PINECONE_API_KEY)
    index = pc.Index(INDEX_NAME)
    
    vectorstore = PineconeVectorStore(
        index=index,
        embedding=embeddings,
        text_key="chunk_text"
    )
    
    # Using as_retriever method for better retrieval with score threshold
    retriever = vectorstore.as_retriever(
        search_type="similarity_score_threshold",
        search_kwargs={
            "k": 8,
            "score_threshold": 0.5
        }
    )
    print("✅ Connected to Pinecone vectorstore and created retriever.")
    print("✅ Using all-MiniLM-L6-v2 embedding model (384 dimensions)")
    print("✅ Retriever configured with relevance threshold for out-of-scope detection")
    
    # System template - Balanced legal assistant
    SYSTEM_TEMPLATE = """You are LegisAI, an expert legal research assistant specializing in Indian law.

**INSTRUCTIONS:**

1. SOURCE GROUNDING:
   - Answer using information from the retrieved context below
   - The retrieved documents are semantically relevant to the query
   - Extract the relevant legal provisions from the context
   - If you genuinely cannot find the specific provision, say so clearly

2. ACCURACY:
   - For Constitution questions: Extract the article text from context
   - For IPC questions: State the section number and provisions
   - Use the context provided - it has been retrieved based on semantic relevance
   - Focus on the specific article/section asked about

3. RESPONSE FORMAT (Plain Text Only):
   - Provide the legal text/provision from the context
   - Explain its meaning clearly
   - NO markdown (**,*,###), NO formatting symbols
   - Use numbered points (1., 2., 3.) for clarity

4. INDIAN LAW FOCUS:
   - Focus on: Indian Constitution, IPC, CrPC, Evidence Act, Indian case law
   - The documents retrieved are already filtered for Indian law

============================================================

RETRIEVED LEGAL DOCUMENTS:
{context}

User-uploaded documents (if any):
{uploaded_docs}

Previous conversation (if any):
{chat_history}

============================================================

IMPORTANT: Answer the user's question directly and accurately using ONLY relevant information from the retrieved documents. If the documents don't contain the answer, clearly state that.
"""
    
    final_prompt = ChatPromptTemplate.from_messages([
        ("system", SYSTEM_TEMPLATE),
        ("user", "{question}")
    ])
    
    # Format documents function with text cleaning and metadata preservation
    def format_docs(docs):
        """Format and clean retrieved documents before sending to LLM with source info."""
        if not docs:
            return "NO_RELEVANT_DOCUMENTS"
        
        cleaned_docs = []
        for idx, doc in enumerate(docs, 1):
            # Check if doc is a dict or Document object
            if isinstance(doc, dict):
                content = doc.get('page_content', str(doc))
                metadata = doc.get('metadata', {})
            else:
                content = doc.page_content if hasattr(doc, 'page_content') else str(doc)
                metadata = doc.metadata if hasattr(doc, 'metadata') else {}
            
            # Apply OCR cleaning to each retrieved document
            cleaned_content = clean_ocr_text(content)
            if cleaned_content:  # Only include non-empty cleaned content
                # Add source information for citation tracking
                source_file = metadata.get('source_file', 'Unknown')
                chunk_id = metadata.get('chunk_id', 'N/A')
                
                doc_with_source = f"[Source {idx}: {source_file}, Chunk {chunk_id}]\n{cleaned_content}"
                cleaned_docs.append(doc_with_source)
        
        if not cleaned_docs:
            return "NO_RELEVANT_DOCUMENTS"
        
        # Join with clear separators
        return "\n\n--- Document Separator ---\n\n".join(cleaned_docs)
    
    # Build RAG chain - simple version that just needs context and question
    qa_chain = (
        {
            "context": (lambda x: x["question"]) | retriever | format_docs, 
            "question": lambda x: x["question"],
            "chat_history": lambda x: x.get("chat_history", "No previous conversation."),
            "uploaded_docs": lambda x: x.get("uploaded_docs", "No uploaded documents.")
        }
        | final_prompt
        | llm
        | StrOutputParser()
    )
    
    print("RAG chain loaded successfully.")
    return qa_chain, retriever


# -----------------------------------
# Document Validation Function
# -----------------------------------

def validate_retrieved_documents(query: str, retrieved_docs):
    """
    Validate that retrieved documents actually contain relevant content for the query.
    RELAXED VALIDATION: Only filters out clearly irrelevant foreign documents.
    Keeps all Indian legal documents that are semantically relevant.
    
    Args:
        query: The user's question
        retrieved_docs: List of retrieved documents
        
    Returns:
        List of validated documents that actually contain relevant content
    """
    import re
    
    query_lower = query.lower()
    validated_docs = []
    
    # Extract what legal provision is being asked about (for logging only)
    article_pattern = r'article\s+(\d+[a-z]*)'
    section_pattern = r'section\s+(\d+[a-z]*)'
    
    article_match = re.search(article_pattern, query_lower)
    section_match = re.search(section_pattern, query_lower)
    
    if article_match:
        print(f"[VALIDATION] Query about Article {article_match.group(1)}")
    elif section_match:
        print(f"[VALIDATION] Query about Section {section_match.group(1)}")
    
    # RELAXED VALIDATION: Just filter out foreign documents, keep all Indian docs
    for doc in retrieved_docs:
        metadata = doc.metadata if hasattr(doc, 'metadata') else {}
        source_file = metadata.get('source_file', '').lower()
        
        # Filter out NON-INDIAN documents only
        is_foreign = False
        foreign_keywords = ['south africa', 'usa', 'canada', 'australia', 'uk', 'germany', 'france']
        
        for keyword in foreign_keywords:
            if keyword in source_file:
                is_foreign = True
                print(f"  ✗ Filtered: {metadata.get('source_file', 'Unknown')} - Foreign jurisdiction ({keyword})")
                break
        
        # If NOT foreign, accept it (trust Pinecone's semantic search)
        if not is_foreign:
            validated_docs.append(doc)
            print(f"  ✓ Accepted: {metadata.get('source_file', 'Unknown')} - Indian legal document")
    
    # If no docs passed validation, return original docs (trust the vector search)
    if len(validated_docs) == 0:
        print("[VALIDATION] No docs passed strict filter, returning all retrieved docs")
        return retrieved_docs
    
    return validated_docs


# -----------------------------------
# Query function with classification and out-of-scope detection
# -----------------------------------

def answer_legal_query(query: str, qa_chain, retriever, chat_history=None, uploaded_docs_text=None):
    """
    Answer a legal query with proper explanation.
    Classifies queries first to avoid unnecessary retrieval for non-legal questions.
    Supports conversation history for follow-up questions.
    
    Args:
        query: The user's question
        qa_chain: The RAG chain
        retriever: The document retriever
        chat_history: List of previous messages [{"role": "user", "content": "..."}, ...]
        uploaded_docs_text: Text content from user-uploaded documents
    """
    print(f"\\nProcessing query: '{query}'")
    if chat_history:
        print(f"Chat history length: {len(chat_history)} messages")
    if uploaded_docs_text:
        print(f"Uploaded documents context: {len(uploaded_docs_text)} characters")
    
    # QUICK PATTERN-BASED GREETING HANDLER (runs before OpenAI to avoid quota issues)
    query_lower = query.lower().strip()
    
    # Handle greetings
    if query_lower in ["hi", "hello", "hey", "namaste", "hii", "hiii", "helloo"]:
        return "Hi! I'm LegAI, your legal research assistant for Indian law. How can I help you today?", []
    
    # Handle "who are you" type questions
    if any(phrase in query_lower for phrase in ["who are you", "what are you", "introduce yourself", "what is this", "what can you do"]):
        return "I'm LegAI, your legal assistant specialized in Indian law. I can help you with questions about the Indian Constitution, IPC (Indian Penal Code), Fundamental Rights, legal procedures, and more. Ask me any legal question!", []
    
    # Handle "how are you" type questions
    if any(phrase in query_lower for phrase in ["how are you", "how r u", "whats up", "what's up"]):
        return "I'm doing great, thank you! I'm here to assist you with Indian legal questions. What would you like to know?", []
    
    # Handle "thanks" type messages
    if query_lower in ["thanks", "thank you", "thankyou", "thx", "ty"]:
        return "You're welcome! Feel free to ask if you have any other legal questions.", []
    
    # DETECT NON-LEGAL QUERIES (before retrieval to save resources)
    non_legal_keywords = [
        'cricket', 'football', 'soccer', 'sports', 'game', 'player', 'match', 'tournament',
        'weather', 'climate', 'rain', 'temperature', 'forecast',
        'movie', 'film', 'actor', 'actress', 'cinema', 'entertainment',
        'recipe', 'cooking', 'food', 'restaurant', 'dish',
        'travel', 'tourism', 'vacation', 'holiday', 'trip',
        'medicine', 'disease', 'symptoms', 'doctor', 'hospital', 'health',
        'astronomy', 'space', 'planet', 'star', 'meteor', 'galaxy',
        'mathematics', 'physics', 'chemistry', 'biology', 'science',
        'computer', 'programming', 'software', 'hardware', 'technology',
        'music', 'song', 'singer', 'album', 'concert',
        'fashion', 'clothes', 'style', 'outfit'
    ]
    
    # Check if query contains non-legal keywords and NO legal keywords
    legal_keywords = [
        'law', 'legal', 'article', 'section', 'act', 'constitution', 'ipc', 'crpc',
        'court', 'judge', 'petition', 'case', 'rights', 'fundamental', 'directive',
        'offense', 'crime', 'punishment', 'bail', 'appeal', 'jurisdiction',
        'contract', 'agreement', 'evidence', 'witness', 'trial', 'verdict',
        'statute', 'ordinance', 'amendment', 'clause', 'provision'
    ]
    
    has_non_legal = any(keyword in query_lower for keyword in non_legal_keywords)
    has_legal = any(keyword in query_lower for keyword in legal_keywords)
    
    if has_non_legal and not has_legal:
        non_legal_response = """I apologize, but I can only assist with questions related to Indian law and legal matters.

My expertise includes:
  • Indian Constitution (Articles, Fundamental Rights, etc.)
  • Indian Penal Code (IPC) - Criminal Law
  • Criminal Procedure Code (CrPC)
  • Indian Evidence Act
  • Indian Contract Act
  • Supreme Court landmark cases
  • Legal procedures and rights

For non-legal questions, please consult appropriate resources or experts in that field.

Please feel free to ask any legal questions!"""
        return non_legal_response, []
    
    # ALL OTHER QUERIES ARE TREATED AS LEGAL (no OpenAI classifier needed)
    # Proceed directly with retrieval
    try:
        retrieved_docs = retriever.invoke(query)
        
        # Check if any relevant documents were retrieved
        if not retrieved_docs or len(retrieved_docs) == 0:
            out_of_scope_response = """I apologize, but I couldn't find relevant information in my legal database for your query.

**My Knowledge Domain:**
  ✓ Indian Constitution (Fundamental Rights, Directive Principles, etc.)
  ✓ Indian Penal Code (IPC) - Criminal Law
  ✓ Indian Evidence Act
  ✓ Data Protection Laws in India
  ✓ Constitutional Law Principles

**Please try questions like:**
  • "Explain Article 21 of the Indian Constitution"
  • "What is the punishment for theft under IPC?"
  • "What are Fundamental Rights?"
  • "Explain Right to Equality"

Please rephrase your question or ask about a topic within my legal database."""
            return out_of_scope_response, []
        
        print(f"✅ Retrieved {len(retrieved_docs)} documents initially")
        
        # CRITICAL: Validate and filter retrieved documents for relevance
        validated_docs = validate_retrieved_documents(query, retrieved_docs)
        
        if not validated_docs or len(validated_docs) == 0:
            # Extract what was asked for better error message
            query_lower = query.lower()
            if 'article' in query_lower:
                import re
                article_match = re.search(r'article\s+(\d+[a-z]*)', query_lower)
                if article_match:
                    article_num = article_match.group(1)
                    return f"I could not find specific information about Article {article_num} in the indexed Indian legal documents. The retrieved documents did not contain the exact article text you requested. Please verify the article number or try rephrasing your query.", retrieved_docs
            elif 'section' in query_lower:
                import re
                section_match = re.search(r'section\s+(\d+[a-z]*)', query_lower)
                if section_match:
                    section_num = section_match.group(1)
                    return f"I could not find specific information about Section {section_num} in the indexed Indian legal documents. The retrieved documents did not contain the exact section text you requested. Please verify the section number or try rephrasing your query.", retrieved_docs
            
            return "The retrieved documents do not contain relevant information about your specific query. The content may be indexed but not precisely matching your request. Please try rephrasing or ask about a different legal topic.", retrieved_docs
        
        print(f"✅ {len(validated_docs)} documents passed validation")
        
        # Format chat history for the prompt
        formatted_history = ""
        if chat_history and len(chat_history) > 0:
            # Take last 6 messages (3 exchanges) to avoid token limits
            recent_history = chat_history[-6:] if len(chat_history) > 6 else chat_history
            for msg in recent_history:
                role = "User" if msg["role"] == "user" else "Assistant"
                formatted_history += f"{role}: {msg['content']}\n\n"
        
        # Build context from ONLY validated documents
        validated_context = ""
        for idx, doc in enumerate(validated_docs, 1):
            content = doc.page_content if hasattr(doc, 'page_content') else str(doc)
            metadata = doc.metadata if hasattr(doc, 'metadata') else {}
            source_file = metadata.get('source_file', 'Unknown')
            
            validated_context += f"[Source {idx}: {source_file}]\n{clean_ocr_text(content)}\n\n--- Document Separator ---\n\n"
        
        # Use validated documents with RAG chain
        response = qa_chain.invoke({
            "question": query,
            "chat_history": formatted_history if formatted_history else "No previous conversation.",
            "uploaded_docs": uploaded_docs_text if uploaded_docs_text else "No uploaded documents."
        })
        
        # Extract the answer from the response
        if isinstance(response, dict):
            answer = response.get('result', response.get('answer', str(response)))
        else:
            answer = str(response)
        
        return answer, validated_docs
        
    except Exception as e:
        # FALLBACK: Return actual retrieved documents when OpenAI fails
        error_msg = str(e).lower()
        print(f"⚠️ Error calling OpenAI: {str(e)}")
        
        # Check if it's an OpenAI quota/API error
        if 'quota' in error_msg or 'api' in error_msg or 'billing' in error_msg or '401' in error_msg or '429' in error_msg:
            print("📚 Using document-based fallback (no LLM needed)")
            
            # Try to retrieve documents even if LLM failed
            try:
                if 'retrieved_docs' not in locals() or not retrieved_docs:
                    retrieved_docs = retriever.invoke(query)
                
                if retrieved_docs and len(retrieved_docs) > 0:
                    # Format the retrieved documents into a comprehensive answer
                    answer_parts = ["Based on the legal documents:\n"]
                    
                    for i, doc in enumerate(retrieved_docs[:3], 1):  # Use top 3 most relevant docs
                        content = doc.page_content.strip()
                        source = doc.metadata.get('source_file', 'Legal Database')
                        
                        answer_parts.append(f"\n{i}. From {source}:")
                        answer_parts.append(f"{content}\n")
                    
                    answer_parts.append("\nSource: Legal documents indexed in the system")
                    
                    final_answer = "\n".join(answer_parts)
                    print(f"✅ Generated answer from {len(retrieved_docs)} retrieved documents")
                    return final_answer, retrieved_docs
                else:
                    return "I couldn't find relevant information in the legal database for your query. Please try rephrasing or ask about topics like IPC, Constitution, or legal procedures.", []
                    
            except Exception as retrieval_error:
                print(f"❌ Retrieval also failed: {str(retrieval_error)}")
                return "Service temporarily unavailable. Please try again.", []
        
        # For other errors, return standard error message
        error_response = f"""An error occurred while processing your query.

Please try:
  - Rephrasing your question
  - Asking about topics like Indian Constitution, IPC, or legal rights
  - Ensuring your query is clear and legal-related

Error details: {str(e)}"""
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
