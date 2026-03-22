

import json
import os
from pathlib import Path
from dotenv import load_dotenv
from pinecone import Pinecone, ServerlessSpec
from sentence_transformers import SentenceTransformer
from tqdm import tqdm

# Load environment variables
load_dotenv()

# Configuration
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
INDEX_NAME = "legal-chatbot"
EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"  # 384 dimensions, fast and efficient
BATCH_SIZE = 100

# Paths
PROJECT_ROOT = Path(__file__).parent.parent.parent
CORPUS_PATH = PROJECT_ROOT / "MILESTONE1" / "data" / "processed" / "legal_corpus.json"


def load_corpus():
    """Load the prepared legal corpus."""
    print(f"Loading corpus from {CORPUS_PATH}...")
    with open(CORPUS_PATH, 'r', encoding='utf-8') as f:
        corpus = json.load(f)
    print(f"✓ Loaded {len(corpus)} chunks")
    return corpus


def create_embeddings(corpus, model_name=EMBEDDING_MODEL):
    """Create embeddings for all chunks using HuggingFace sentence transformers."""
    print(f"\nLoading embedding model: {model_name}...")
    model = SentenceTransformer(model_name)
    print(f"✓ Model loaded (embedding dimension: {model.get_sentence_embedding_dimension()})")
    
    print("\nCreating embeddings...")
    texts = [chunk["text"] for chunk in corpus]
    
    # Create embeddings in batches with progress bar
    embeddings = model.encode(
        texts,
        batch_size=BATCH_SIZE,
        show_progress_bar=True,
        convert_to_numpy=True
    )
    
    print(f"✓ Created {len(embeddings)} embeddings")
    return embeddings, model.get_sentence_embedding_dimension()


def setup_pinecone_index(dimension):
    """Create or connect to Pinecone index."""
    if not PINECONE_API_KEY:
        raise ValueError("PINECONE_API_KEY not found in .env file")
    
    print("\nConnecting to Pinecone...")
    pc = Pinecone(api_key=PINECONE_API_KEY)
    
    # Check if index exists
    existing_indexes = pc.list_indexes()
    index_names = [index.name for index in existing_indexes]
    
    if INDEX_NAME in index_names:
        print(f"✓ Index '{INDEX_NAME}' already exists")
    else:
        print(f"Creating new index '{INDEX_NAME}' with dimension {dimension}...")
        pc.create_index(
            name=INDEX_NAME,
            dimension=dimension,
            metric="cosine",
            spec=ServerlessSpec(
                cloud="aws",
                region="us-east-1"
            )
        )
        print(f"✓ Index created successfully")
    
    index = pc.Index(INDEX_NAME)
    return index


def upload_to_pinecone(index, corpus, embeddings):
    """Upload embeddings to Pinecone in batches."""
    print(f"\nUploading {len(embeddings)} vectors to Pinecone...")
    
    vectors = []
    for i, (chunk, embedding) in enumerate(zip(corpus, embeddings)):
        vector = {
            "id": chunk["id"],
            "values": embedding.tolist(),
            "metadata": {
                "text": chunk["text"][:1000],  # Pinecone metadata limit
                "source": chunk["metadata"].get("source", "unknown"),
                "full_text_id": chunk["id"]  # Reference to full text
            }
        }
        vectors.append(vector)
        
        # Upload in batches
        if len(vectors) >= BATCH_SIZE:
            index.upsert(vectors=vectors)
            vectors = []
            print(f"  Uploaded {i+1}/{len(embeddings)} vectors...", end='\r')
    
    # Upload remaining vectors
    if vectors:
        index.upsert(vectors=vectors)
    
    print(f"\n✓ Successfully uploaded all vectors")
    
    # Get index stats
    stats = index.describe_index_stats()
    print(f"\nIndex Statistics:")
    print(f"   Total vectors: {stats.total_vector_count}")
    print(f"   Dimension: {stats.dimension}")


def main():
    print("="*80)
    print("SETTING UP PINECONE VECTOR DATABASE")
    print("="*80)
    
    try:
        # Step 1: Load corpus
        corpus = load_corpus()
        
        # Step 2: Create embeddings
        embeddings, dimension = create_embeddings(corpus)
        
        # Step 3: Setup Pinecone index
        index = setup_pinecone_index(dimension)
        
        # Step 4: Upload to Pinecone
        upload_to_pinecone(index, corpus, embeddings)
        
        print("\n" + "="*80)
        print("✓ PINECONE SETUP COMPLETE!")
        print("="*80)
        print(f"\nIndex Name: {INDEX_NAME}")
        print(f"Total Chunks: {len(corpus)}")
        print(f"Embedding Model: {EMBEDDING_MODEL}")
        print(f"Dimension: {dimension}")
        print("="*80)
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        raise


if __name__ == "__main__":
    main()
