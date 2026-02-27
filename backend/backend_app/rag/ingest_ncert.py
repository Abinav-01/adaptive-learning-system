from typing import List
import argparse
import os

import fitz  # PyMuPDF
from langchain_text_splitters import RecursiveCharacterTextSplitter

from backend_app.rag.vector_service import VectorStoreManager
from backend_app.db.session import SessionLocal
from backend_app.models import ChapterContent
from backend_app.core.config import settings


def extract_text_from_pdf(filepath: str, page_start: int = None, page_end: int = None) -> str:
    doc = fitz.open(filepath)
    texts = []
    start = page_start - 1 if page_start else 0
    end = page_end - 1 if page_end else (doc.page_count - 1)
    for pno in range(start, end + 1):
        page = doc.load_page(pno)
        texts.append(page.get_text())
    doc.close()
    return "\n\n".join(texts)


def ingest_pdf(file_path: str, chapter_id: str, page_start: int = None, page_end: int = None):
    """Extract text from PDF, chunk, save to DB and FAISS index."""
    raw = extract_text_from_pdf(file_path, page_start, page_end)

    # Use RecursiveCharacterTextSplitter to preserve math context
    splitter = RecursiveCharacterTextSplitter(chunk_size=800, chunk_overlap=150)
    chunks = splitter.split_text(raw)

    metadatas = [{"chapter_id": chapter_id, "chunk_index": i} for i in range(len(chunks))]

    # Persist chunks to DB
    session = SessionLocal()
    created = 0
    try:
        for i, chunk in enumerate(chunks):
            cc = ChapterContent(chapter_id=chapter_id, content=chunk, page_number=None, source=os.path.basename(file_path))
            session.add(cc)
            created += 1
        session.commit()
    finally:
        session.close()

    # Add to vector store and persist index
    manager = VectorStoreManager()
    manager.add_documents(chunks, metadatas)
    # Ensure backend dir exists
    os.makedirs("backend", exist_ok=True)
    manager.save_index()

    print(f"Ingested {len(chunks)} chunks from {file_path} and saved to DB and FAISS index.")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("filepath", help="Path to NCERT PDF file to ingest")
    parser.add_argument("chapter_id", help="Chapter identifier")
    parser.add_argument("--start", type=int, help="Start page number (1-based)")
    parser.add_argument("--end", type=int, help="End page number (1-based)")
    args = parser.parse_args()
    ingest_pdf(args.filepath, args.chapter_id, args.start, args.end)


if __name__ == "__main__":
    # Ensure DB URL from settings is used by SessionLocal via backend_app.db.session
    main()
