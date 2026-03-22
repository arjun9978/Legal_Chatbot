import os
from dotenv import load_dotenv
from pinecone import Pinecone
from sentence_transformers import SentenceTransformer

load_dotenv()

PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
INDEX_NAME = "legal-chatbot"
EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"


def test_query(query_text):
    """Test querying the Pinecone index."""
    print(f"Testing query: '{query_text}'")
    
    # Connect to Pinecone
    pc = Pinecone(api_key=PINECONE_API_KEY)
    index = pc.Index(INDEX_NAME)
    
    # Get index stats
    stats = index.describe_index_stats()
    print(f"\nIndex Stats:")
    print(f"   Total vectors: {stats.total_vector_count}")
    print(f"   Dimension: {stats.dimension}")
    
    # Create query embedding
    print(f"\nCreating query embedding...")
    model = SentenceTransformer(EMBEDDING_MODEL)
    query_embedding = model.encode([query_text])[0]
    
    # Query Pinecone
    print(f"Querying Pinecone...")
    results = index.query(
        vector=query_embedding.tolist(),
        top_k=3,
        include_metadata=True
    )
    
    # Display results
    print(f"\nTop 3 Results:")
    print("="*80)
    for i, match in enumerate(results.matches, 1):
        print(f"\n{i}. Score: {match.score:.4f}")
        print(f"   Source: {match.metadata.get('source', 'N/A')}")
        print(f"   Text: {match.metadata.get('text', 'N/A')[:200]}...")
    print("="*80)


if __name__ == "__main__":
    test_query("What are fundamental rights in Indian Constitution?")
