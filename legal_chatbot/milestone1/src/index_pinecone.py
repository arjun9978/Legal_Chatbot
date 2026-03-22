import os
import json
from tqdm import tqdm
from pinecone import Pinecone, ServerlessSpec
from sentence_transformers import SentenceTransformer

# Load environment variables
PINECONE_API_KEY = os.environ.get("PINECONE_API_KEY")
INDEX_NAME = os.environ.get("PINECONE_INDEX_NAME", "legal-index-v1")

if not PINECONE_API_KEY:
    raise ValueError("PINECONE_API_KEY is not set. Please set it in the terminal.")

# Initialize Pinecone client
pc = Pinecone(api_key=PINECONE_API_KEY)

# Create index if it doesn't exist
if INDEX_NAME not in [idx.name for idx in pc.list_indexes()]:
    print(f"Creating index '{INDEX_NAME}'...")
    pc.create_index(
        name=INDEX_NAME,
        dimension=384,
        metric="cosine",
        spec=ServerlessSpec(
            cloud="aws",
            region="us-east-1"
        )
    )
    print(f"Index '{INDEX_NAME}' created successfully!")

# Connect to index
index = pc.Index(INDEX_NAME)

# Delete all existing vectors to ensure clean re-upload
print("Deleting all existing vectors...")
index.delete(delete_all=True)
print("All vectors deleted. Uploading fresh data...")

# Load your chunks JSON
json_path = os.path.join("data", "processed", "legal_chunks.json")

with open(json_path, "r", encoding="utf-8") as f:
    chunks = json.load(f)

print(f"Loaded {len(chunks)} chunks.")

# Load embedding model
model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")

# Upload chunks in batches
batch_size = 100
vectors_uploaded = 0

for i in tqdm(range(0, len(chunks), batch_size), desc="Uploading"):
    batch = chunks[i : i + batch_size]

    ids = [f"{c['source_file']}--{c['chunk_id']}" for c in batch]
    texts = [c["chunk_text"] for c in batch]

    embeddings = model.encode(texts).tolist()

    # Prepare records
    records = []

    for j in range(len(batch)):
        meta = {
            "source_file": batch[j]["source_file"],
            "source_path": batch[j]["source_path"],
            "file_type": batch[j]["file_type"],
            "chunk_id": batch[j]["chunk_id"],
            "chunk_text": batch[j]["chunk_text"][:1000]  # Store first 1000 chars (Pinecone metadata limit)
        }

        records.append({
            "id": ids[j],
            "values": embeddings[j],
            "metadata": meta
        })

    # Upsert to Pinecone
    index.upsert(records)
    vectors_uploaded += len(records)

print(f"\nDone! Total vectors uploaded: {vectors_uploaded}")
