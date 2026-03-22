import os
from pinecone import Pinecone
from sentence_transformers import SentenceTransformer

PINECONE_API_KEY = os.environ.get("PINECONE_API_KEY")
INDEX_NAME = os.environ.get("PINECONE_INDEX_NAME", "legal-index-v1")

# Initialize Pinecone client and index
print("Connecting to Pinecone...")
pc = Pinecone(api_key=PINECONE_API_KEY)
index = pc.Index(INDEX_NAME)
print("Model loaded!")

# Load embedding model
model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")

# Example query
query = "Fundamental Rights."

print(f"\n>> Searching for legal query: {query}")


# Convert query to embedding
query_vector = model.encode([query])[0].tolist()

# Search Pinecone (semantic search)
results = index.query(vector=query_vector, top_k=3, include_metadata=True)

print(f"\n>> Top Matches:\n")

# FIXED LOOP — shows Result 1, Result 2, Result 3
for i, match in enumerate(results.matches, 1):
    print(f"Result {i}:")
    print(f"Score: {match.score:.7f}")
    print(match.metadata.get('chunk_text', 'No text available'))
    print()

    if i < len(results.matches):
        print("-" * 80)
        print()
