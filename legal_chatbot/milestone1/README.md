# Milestone 1: Data Processing and Embedding

## Overview
This milestone focuses on data ingestion, processing, and indexing legal documents into a vector database for semantic search capabilities.

## Features Implemented

### 1. Data Ingestion (`src/ingest_data.py`)
- Processes legal documents from various formats (PDF, TXT, HTML)
- Chunks documents into manageable pieces
- Extracts metadata (source file, document type)
- Saves processed chunks to JSON format

### 2. Pinecone Indexing (`src/index_pinecone.py`)
- Creates embeddings using `sentence-transformers/all-MiniLM-L6-v2`
- Uploads document chunks to Pinecone vector database
- Configures index with 384 dimensions (matching embedding model)
- Implements batch processing for efficient indexing

### 3. Corpus Preparation (`src/prepare_corpus.py`)
- Cleans and preprocesses legal text
- Handles OCR artifacts from PDF extraction
- Normalizes formatting and whitespace
- Prepares data for embedding generation

### 4. Pinecone Setup (`src/setup_pinecone.py`)
- Initializes Pinecone client
- Creates vector index with proper configuration
- Sets up serverless deployment (AWS us-east-1)
- Configures cosine similarity metric

## Technical Details

### Embedding Model
- **Model**: sentence-transformers/all-MiniLM-L6-v2
- **Dimensions**: 384
- **Purpose**: Convert text to vector representations for semantic search
- **Provider**: HuggingFace

### Vector Database
- **Platform**: Pinecone
- **Index Name**: legal-index-v1
- **Metric**: Cosine similarity
- **Cloud**: AWS (us-east-1)
- **Type**: Serverless

### Data Sources
- Indian Constitution
- Indian Penal Code (IPC)
- Contract Law documents
- Data Protection Laws
- Constitutional law references

## Files Structure
```
milestone1/
├── src/
│   ├── prepare_corpus.py    # Text preprocessing
│   ├── setup_pinecone.py    # Vector DB initialization
│   ├── index_pinecone.py    # Document embedding & indexing
│   └── ingest_data.py       # Data ingestion pipeline
└── README.md
```

## Usage

### 1. Prepare Corpus
```bash
python milestone1/src/prepare_corpus.py
```

### 2. Setup Pinecone Index
```bash
python milestone1/src/setup_pinecone.py
```

### 3. Index Documents
```bash
python milestone1/src/index_pinecone.py
```

## Key Achievements
✅ Successfully processed legal documents from multiple formats  
✅ Implemented text cleaning for OCR-corrupted PDFs  
✅ Created vector embeddings using all-MiniLM-L6-v2  
✅ Indexed documents into Pinecone vector database  
✅ Configured semantic search infrastructure  

## Next Steps
Proceed to Milestone 2 for RAG implementation and query answering system.
