import os
import json
from pathlib import Path
from typing import List

from langchain_community.document_loaders import PyPDFLoader, TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document
from bs4 import BeautifulSoup

BASE_DIR = Path(__file__).resolve().parent.parent
RAW_DATA_DIR = BASE_DIR / "data" / "raw"
PROCESSED_DIR = BASE_DIR / "data" / "processed"


def load_all_documents(raw_dir: Path) -> List:
    """Load ALL PDFs, TXT, and HTML files from the data/raw directory as LangChain Documents."""
    documents = []

    for pdf_path in raw_dir.glob("*.pdf"):
        print(f"Loading PDF: {pdf_path.name}")
        try:
            loader = PyPDFLoader(str(pdf_path))
            docs = loader.load()
            documents.extend(docs)
        except Exception as e:
            print(f"Error loading {pdf_path.name}: {e}")
    
    # Load TXT files
    for txt_path in raw_dir.glob("*.txt"):
        print(f"Loading TXT: {txt_path.name}")
        try:
            loader = TextLoader(str(txt_path), encoding='utf-8')
            docs = loader.load()
            documents.extend(docs)
        except Exception as e:
            print(f"Error loading {txt_path.name}: {e}")
    
    # Load HTML files
    for html_path in raw_dir.glob("*.html"):
        print(f"Loading HTML: {html_path.name}")
        try:
            with open(html_path, 'r', encoding='utf-8') as f:
                html_content = f.read()
            
            soup = BeautifulSoup(html_content, 'html.parser')
            
            # Remove unwanted elements
            for tag in soup(['script', 'style', 'nav', 'footer', 'header', 'aside']):
                tag.decompose()
            
            text = soup.get_text(separator='\n', strip=True)
            
            # Create a document-like object
            doc = Document(page_content=text, metadata={"source": str(html_path)})
            documents.append(doc)
        except Exception as e:
            print(f"Error loading {html_path.name}: {e}")
    
    return documents


def split_documents(documents: List) -> List:
    """Split documents into smaller chunks for RAG model."""
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=2000,
        chunk_overlap=200,  # 10% of chunk_size
        length_function=len,
    )
    
    chunks = text_splitter.split_documents(documents)
    return chunks


def save_corpus(chunks: List, output_path: Path):
    """Save processed chunks to JSON file."""
    corpus = []
    
    for idx, chunk in enumerate(chunks):
        corpus.append({
            "id": f"chunk_{idx}",
            "text": chunk.page_content,
            "metadata": chunk.metadata
        })
    
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(corpus, f, indent=2, ensure_ascii=False)
    
    print(f"\n✓ Saved {len(corpus)} chunks to {output_path}")


def main():
    print("="*80)
    print("PREPARING LEGAL CORPUS")
    print("="*80)
    
    # Ensure directories exist
    RAW_DATA_DIR.mkdir(parents=True, exist_ok=True)
    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
    
    # Check if there are files
    pdf_files = list(RAW_DATA_DIR.glob("*.pdf"))
    txt_files = list(RAW_DATA_DIR.glob("*.txt"))
    html_files = list(RAW_DATA_DIR.glob("*.html"))
    
    if not pdf_files and not txt_files and not html_files:
        print(f"\n⚠ No PDF, TXT, or HTML files found in {RAW_DATA_DIR}")
        print("Please add files to the data/raw folder and run again.")
        return
    
    print(f"\nFound {len(pdf_files)} PDF file(s), {len(txt_files)} TXT file(s), and {len(html_files)} HTML file(s)")
    print("-" * 80)
    
    # Load all documents
    print("\n Loading documents...")
    documents = load_all_documents(RAW_DATA_DIR)
    print(f"✓ Loaded {len(documents)} document(s)")
    
    # Split into chunks
    print("\n Splitting into chunks...")
    chunks = split_documents(documents)
    print(f"✓ Created {len(chunks)} chunks")
    
    # Save to JSON
    output_file = PROCESSED_DIR / "legal_corpus.json"
    print(f"\n Saving corpus...")
    save_corpus(chunks, output_file)
    
    print("\n" + "="*80)
    print(" CORPUS PREPARATION COMPLETE!")
    print("="*80)
    print(f"\nStatistics:")
    print(f"   PDF files: {len(pdf_files)}")
    print(f"   TXT files: {len(txt_files)}")
    print(f"   HTML files: {len(html_files)}")
    print(f"   Total documents: {len(documents)}")
    print(f"   Total chunks: {len(chunks)}")
    print(f"\n Output: {output_file}")
    print("="*80)


if __name__ == "__main__":
    main()
