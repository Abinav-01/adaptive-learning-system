import threading
from typing import List, Dict, Optional

import faiss
import numpy as np
from sentence_transformers import SentenceTransformer
import os
import json


DEFAULT_INDEX_PATH = os.path.join("backend", "faiss_index.bin")
DEFAULT_ENTRIES_PATH = os.path.join("backend", "faiss_entries.json")


class VectorStoreManager:
    """Simple FAISS-backed vector store manager using SentenceTransformers.

    This manager keeps an in-memory FAISS index (IndexFlatIP with normalized vectors)
    and an in-memory list of entries (text + metadata) aligned with index positions.
    """

    def __init__(self, model_name: str = "sentence-transformers/all-MiniLM-L6-v2"):
        self.lock = threading.Lock()
        self.model = SentenceTransformer(model_name)
        self.dim = self.model.get_sentence_embedding_dimension()
        # Using inner product on L2-normalized vectors approximates cosine similarity
        self.index = faiss.IndexFlatIP(self.dim)
        self.entries: List[Dict] = []

        # Try to load persisted index and entries if available
        if os.path.exists(DEFAULT_INDEX_PATH) and os.path.exists(DEFAULT_ENTRIES_PATH):
            try:
                self.load_index(DEFAULT_INDEX_PATH, DEFAULT_ENTRIES_PATH)
            except Exception:
                # If loading fails, continue with empty index
                pass

    def _ensure_index_ready(self):
        if self.index is None:
            raise RuntimeError("FAISS index is not initialized")

    def add_documents(self, texts: List[str], metadatas: Optional[List[Dict]] = None):
        """Embed and add documents to the FAISS index.

        texts: list of strings
        metadatas: optional list of dicts aligned with texts
        """
        if not texts:
            return
        metadatas = metadatas or [None] * len(texts)

        # Compute embeddings
        embeddings = self.model.encode(texts, convert_to_numpy=True, show_progress_bar=False)
        # Normalize for cosine-sim using inner product
        faiss.normalize_L2(embeddings)

        with self.lock:
            # add to index
            self.index.add(embeddings)
            for t, m in zip(texts, metadatas):
                self.entries.append({"text": t, "metadata": m})

    def save_index(self, index_path: str = DEFAULT_INDEX_PATH, entries_path: str = DEFAULT_ENTRIES_PATH):
        """Persist FAISS index and entries to disk."""
        with self.lock:
            # write FAISS index
            faiss.write_index(self.index, index_path)
            # write entries
            with open(entries_path, "w", encoding="utf-8") as f:
                json.dump(self.entries, f, ensure_ascii=False)

    def load_index(self, index_path: str = DEFAULT_INDEX_PATH, entries_path: str = DEFAULT_ENTRIES_PATH):
        """Load FAISS index and entries from disk."""
        with self.lock:
            idx = faiss.read_index(index_path)
            # Ensure dimension matches
            if idx.d != self.dim:
                raise ValueError("Index dimension does not match model embedding dimension")
            self.index = idx
            with open(entries_path, "r", encoding="utf-8") as f:
                self.entries = json.load(f)

    def search(self, query: str, top_k: int = 3) -> List[Dict]:
        """Search the index for the most relevant documents to the query.

        Returns a list of dicts with keys: text, metadata, score
        """
        self._ensure_index_ready()
        if self.index.ntotal == 0:
            # empty index
            return []

        q_emb = self.model.encode([query], convert_to_numpy=True, show_progress_bar=False)
        faiss.normalize_L2(q_emb)

        D, I = self.index.search(q_emb, top_k)
        results = []
        for score, idx in zip(D[0], I[0]):
            if idx < 0 or idx >= len(self.entries):
                continue
            entry = self.entries[int(idx)]
            results.append({"text": entry["text"], "metadata": entry["metadata"], "score": float(score)})
        return results
