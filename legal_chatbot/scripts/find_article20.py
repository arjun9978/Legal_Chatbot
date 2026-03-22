import PyPDF2
import sys

pdf_path = sys.argv[1] if len(sys.argv) > 1 else 'data/COI_2024.pdf'

try:
    pdf = PyPDF2.PdfReader(pdf_path)
    print(f"Searching in {pdf_path} ({len(pdf.pages)} pages)...")
    
    for page_num, page in enumerate(pdf.pages[15:35], start=15):
        text = page.extract_text()
        if 'Article 20' in text or '20.' in text:
            idx = text.find('Article 20')
            if idx < 0:
                idx = text.find('20.')
            
            # Print context around Article 20
            start = max(0, idx - 100)
            end = min(len(text), idx + 1000)
            print(f"\n=== PAGE {page_num} ===")
            print(text[start:end])
            print("\n" + "="*50)
            
except Exception as e:
    print(f"Error: {e}")
