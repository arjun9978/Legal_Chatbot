# Milestone 2: RAG Implementation with Retrieval System

## Overview
This milestone implements the complete Retrieval-Augmented Generation (RAG) system for the Legal Chatbot, including semantic search, document retrieval, and query answering capabilities.

## Features Implemented

### 1. Text Retrieval using `as_retriever()` Method
- **Method**: `vectorstore.as_retriever()`
- **Search Type**: `similarity_score_threshold`
- **Configuration**:
  - Top K results: 5
  - Score threshold: 0.4 (40% minimum relevance)
  - Automatic filtering of irrelevant results

### 2. Embedding Model Integration
- **Model**: `sentence-transformers/all-MiniLM-L6-v2`
- **Dimensions**: 384
- **Provider**: HuggingFace
- Converts queries and documents to vector embeddings for semantic similarity search

### 3. Query Answering with Explanation
The system provides structured legal responses including:
- Retrieved Legal Authorities (specific articles, sections)
- Contextual Interpretation (plain-language explanation)
- Applied Legal Analysis (step-by-step reasoning)
- Practical Guidance (actionable recommendations)
- Sources Consulted (complete citations)

### 4. Out-of-Scope Detection
Intelligently handles:
- Gibberish input
- Non-legal questions
- Random/irrelevant queries
- Returns helpful messages indicating the system's knowledge domain

## Files

### `src/rag_chain.py`
Main RAG implementation with:
- Interactive query interface
- Document retrieval and cleaning
- LLM-based response generation
- Out-of-scope detection

### `src/semantic_search.py`
Basic semantic search functionality for testing document retrieval from Pinecone.

## Usage

### Run the Interactive Chatbot
```bash
python milestone2/src/rag_chain.py
```

The system will:
1. Initialize the RAG chain
2. Prompt for user queries
3. Process and return structured legal analysis
4. Loop for multiple queries
5. Exit on 'quit' command

### Example Queries
- "What are Fundamental Rights?"
- "Explain Article 21 of the Indian Constitution"
- "What is the punishment for theft under IPC?"
- "Explain Right to Equality"

## Technical Stack
- **Framework**: LangChain
- **Vector Database**: Pinecone
- **LLM**: OpenAI GPT-3.5-turbo
- **Embeddings**: HuggingFace Sentence Transformers
- **Language**: Python 3.13

## Configuration
Requires `.env` file with:
```
PINECONE_API_KEY=your_api_key
OPENAI_API_KEY=your_api_key
PINECONE_INDEX_NAME=legal-index-v1
```

## Key Achievements
✅ Successfully implemented as_retriever() method with threshold filtering  
✅ Integrated all-MiniLM-L6-v2 embedding model (384 dimensions)  
✅ Built comprehensive RAG pipeline with structured responses  
✅ Implemented intelligent out-of-scope detection  
✅ Created interactive command-line interface  
✅ Added proper error handling and user feedback  

## Testing
The system has been tested with:
- Valid legal queries (returns detailed analysis)
- Out-of-scope queries (properly detected and handled)
- Edge cases (empty input, special characters, etc.)

All tests passed successfully.
