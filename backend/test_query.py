#!/usr/bin/env python3
"""
Test FAISS retrieval for the Polynomials chapter.

- Initializes VectorStoreManager (which loads persisted FAISS index if present)
- Performs a search for a specific curriculum question
- If no results, attempts to re-run ingestion for known PDFs and retry
"""
import os
import subprocess
import sys
from backend_app.rag.vector_service import VectorStoreManager

QUERY = "What is the relationship between zeroes and coefficients of a quadratic polynomial?"
TOP_K = 3

PDF_CANDIDATES = [
    os.path.join("backend", "data", "polynomials.pdf"),
    os.path.join("backend", "data", "jemh102.pdf"),
]


def run_ingest(pdf_path, chapter_id="polynomials"):
    if not os.path.exists(pdf_path):
        print(f"Ingest PDF not found: {pdf_path}")
        return False
    cmd = [sys.executable, os.path.join("backend", "backend_app", "rag", "ingest_ncert.py"), pdf_path, chapter_id]
    print("Running ingest command:", " ".join(cmd))
    res = subprocess.run(cmd, capture_output=True, text=True)
    print("Ingest stdout:\n", res.stdout)
    print("Ingest stderr:\n", res.stderr)
    return res.returncode == 0


def pretty_print_results(results):
    if not results:
        print("No results returned.")
        return
    for i, r in enumerate(results, start=1):
        print(f"\nResult {i} (score={r.get('score'):.4f}):\n")
        text = r.get("text", "")
        print(text)
        meta = r.get("metadata")
        if meta:
            print("-- metadata:", meta)


def main():
    manager = VectorStoreManager()
    results = manager.search(QUERY, top_k=TOP_K)
    if results:
        print(f"Found {len(results)} result(s) from existing index.")
        pretty_print_results(results)
        return

    print("No results found in existing index. Attempting re-ingest from PDFs...")
    ingested = False
    for pdf in PDF_CANDIDATES:
        if os.path.exists(pdf):
            ok = run_ingest(pdf)
            if ok:
                ingested = True
                break
    if not ingested:
        print("No candidate PDFs were ingested (none found or ingest failed). Exiting.")
        return

    # Reload index into a fresh manager
    print("Reloading FAISS index and retrying search...")
    manager = VectorStoreManager()
    results = manager.search(QUERY, top_k=TOP_K)
    if results:
        print(f"Found {len(results)} result(s) after re-ingestion.")
        pretty_print_results(results)
    else:
        print("Still no results after re-ingestion.")


if __name__ == "__main__":
    main()
