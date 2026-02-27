# Progress Report — Adaptive Learning System (Backend + Frontend)

Date: 2026-02-19

This document summarizes the work completed so far (MVP phases 1–5), the current folder structure, and the files created or modified for the backend and frontend. Use this for status reporting.

---

## High-level status

- Frontend: React (Vite) project initialized (no feature work in this report).
- Backend: FastAPI application initialized and runnable locally. SQLite database is integrated and tables are auto-created on startup. JWT-based authentication implemented. RBAC and an Admin-only Subjects module implemented.

All work follows a modular, clean-architecture style (separation of api, services, models, schemas, core, db, ai, rag, etc.).

---

## Folder structure (files & folders)

ADAPTIVE-LEARNING-SYSTEM/
├── .git/
├── README.md
├── PROGRESS.md                     # <-- this file
├── backend/
│   ├── app.db                      # SQLite created at runtime
│   ├── main.py                     # FastAPI entrypoint
│   ├── requirements.txt
│   └── backend_app/
│       ├── __init__.py
│       ├── ai/
│       │   └── llm_service.py
│       ├── api/
│       │   ├── user.py             # register, login, /me
│       │   └── subject.py          # subjects router (admin create, list)
│       ├── core/
│       │   └── security.py         # JWT utilities, get_current_user, get_current_admin
│       ├── db/
│       │   ├── base.py             # SQLAlchemy Base
│       │   └── session.py          # engine, SessionLocal, get_db
│       ├── models/
│       │   ├── __init__.py
│       │   ├── user.py             # User model (role column added)
│       │   └── subject.py          # Subject model
│       ├── rag/
│       ├── schemas/
│       │   ├── user.py             # UserCreate, UserResponse
│       │   └── subject.py          # SubjectCreate, SubjectResponse
│       └── services/
│           └── user_service.py     # create_user, get_user_by_email
├── frontend/
│   ├── package.json
│   ├── package-lock.json
# Progress Report — Adaptive Learning System (Backend + Frontend)

Date: 2026-02-20

This document summarizes the work completed so far (MVP phases), the current folder structure, and the files created or modified for the backend and frontend. Use this for status reporting and for onboarding other engineers.

---

## High-level status

- Frontend: React (Vite) project initialized and feature work completed for a Lesson viewer and a Biometric Attention monitor (MediaPipe). The LessonPlayer fetches lesson JSON and renders LaTeX via KaTeX with animated transitions.
- Backend: FastAPI application initialized and runnable locally. SQLite database is integrated and tables are auto-created on startup. JWT-based authentication implemented. RBAC and an Admin-only Subjects module implemented.

All work follows a modular, clean-architecture style (separation of api, services, models, schemas, core, db, ai, rag, etc.).

---

## Folder structure (files & folders)

ADAPTIVE-LEARNING-SYSTEM/
├── .git/
├── README.md
├── PROGRESS.md                     # <-- this file
├── backend/
│   ├── app.db                      # SQLite created at runtime
│   ├── main.py                     # FastAPI entrypoint
│   ├── requirements.txt
│   └── backend_app/
│       ├── __init__.py
│       ├── ai/
│       │   └── llm_service.py
│       ├── api/
│       │   ├── user.py             # register, login, /me
│       │   ├── subject.py          # subjects router (admin create, list)
│       │   ├── lesson.py           # lesson generation endpoint
│       │   └── attention.py        # attention logging endpoint
│       ├── core/
│       │   └── security.py         # JWT utilities, get_current_user, get_current_admin
│       ├── db/
│       │   ├── base.py             # SQLAlchemy Base
│       │   └── session.py          # engine, SessionLocal, get_db
│       ├── models/
│       │   ├── __init__.py
│       │   ├── user.py             # User model (role column added)
│       │   ├── subject.py          # Subject model
│       │   ├── chapter_content.py  # content chunks for RAG
│       │   └── attention_log.py    # attention logs table
│       ├── rag/
│       ├── schemas/
│       │   ├── user.py             # UserCreate, UserResponse
│       │   ├── subject.py          # SubjectCreate, SubjectResponse
│       │   └── attention.py        # AttentionLogCreate
│       └── services/
│           └── user_service.py     # create_user, get_user_by_email
├── frontend/
│   ├── package.json
│   ├── package-lock.json
│   ├── index.html
│   ├── src/
│   │   ├── App.jsx
│   │   ├── index.css
│   │   ├── main.jsx
│   │   └── components/
│   │       ├── LessonPlayer.jsx
│   │       ├── LessonPlayer.css
│   │       └── AttentionMonitor.jsx
│   └── public/

---

## What has been implemented (phase-by-phase)

Phase 1 — Backend environment setup
- Created `backend/requirements.txt` with core packages (fastapi, uvicorn, sqlalchemy, pydantic, python-jose, passlib[bcrypt], faiss-cpu).
- Created `backend/main.py` with a minimal FastAPI app, CORS middleware, and root health endpoint.

Phase 2 — Database initialization
- Added `backend_app/db/base.py` (SQLAlchemy Base) and `backend_app/db/session.py` (engine, SessionLocal, get_db dependency).
- `main.py` startup event runs `Base.metadata.create_all(bind=engine)` and prints "Database connected".

Phase 3 — First data model: User
- Implemented `backend_app/models/user.py` (id, email, hashed_password, full_name, role).
- Implemented Pydantic schemas `backend_app/schemas/user.py` (UserCreate and UserResponse) with v2-compatible config (`from_attributes = True`).
- Implemented `backend_app/services/user_service.py` with password hashing (passlib) and create_user/get_user_by_email.
- Implemented API router `backend_app/api/user.py` with endpoints:
  - POST /users/register — create user
  - POST /users/login — returns JWT access_token
  - GET /users/me — protected, returns current user

Phase 4 — Authentication (JWT)
- Implemented `backend_app/core/security.py` with:
  - SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES
  - create_access_token, verify_password, authenticate_user
  - get_current_user dependency (decodes JWT and fetches user)

Phase 5 — RBAC and Subjects
- Added `role` column to User model (default "student").
- Added `get_current_admin` dependency in `core/security.py` to enforce admin-only routes (raises 403 otherwise).
- Added Subject model `backend_app/models/subject.py` and schemas `backend_app/schemas/subject.py`.
- Added Subjects router `backend_app/api/subject.py` exposing:
  - POST /subjects/  (admin-only, creates subject)
  - GET /subjects/   (authenticated users can list)

Phase 6 — RAG (Retrieval-Augmented Generation) and Vector Store
- Implemented RAG vector store manager using FAISS and SentenceTransformers:
  - `backend_app/rag/vector_service.py` — VectorStoreManager
    - Uses `sentence-transformers/all-MiniLM-L6-v2` to produce embeddings.
    - In-memory FAISS IndexFlatIP with L2-normalized vectors for cosine similarity.
    - Methods: add_documents(texts, metadatas), search(query, top_k).
    - Persistence: save_index() and load_index() (writes `backend/faiss_index.bin` and `backend/faiss_entries.json`).
  - Persisted index is attempted to be loaded at startup if files exist.

Phase 7 — Content model and ingestion pipeline
- Added `backend_app/models/chapter_content.py` to store raw chunks and metadata (chapter_id, content, page_number, source).
- Refactored ingestion script:
  - `backend_app/rag/ingest_ncert.py` supports PDF ingestion via PyMuPDF (fitz).
  - Uses LangChain's `RecursiveCharacterTextSplitter` with chunk_size=800 and chunk_overlap=150 to preserve math context and formulas.
  - Each chunk is saved to the `ChapterContent` table (SQLite) and added to the FAISS index via VectorStoreManager.
  - After ingestion the FAISS index and entries are saved to `backend/faiss_index.bin` and `backend/faiss_entries.json`.

Phase 8 — LLM Slide Generation (Groq)
- Implemented `backend_app/ai/llm_service.py` to call Groq LLM with a strict JSON prompt and a heuristic fallback.
  - Function: `generate_lesson_slides(chapter_title, retrieved_context)` produces lesson slides JSON with structure:
    ```json
    { "slides": [ { "title": "", "bullets": [], "formula": "LaTeX_here", "narration": "TTS_script", "hint": "" } ] }
    ```
  - Iterations and robustness: the Groq integration was iterated to fix SDK call shapes (removed unsupported args like `max_output_tokens`), handle multiple response shapes, and keep a fallback generator so the endpoint does not crash when the SDK or key is missing.

Phase 9 — Lesson API and End-to-end flow
- Added `backend_app/api/lesson.py` with endpoint `GET /lessons/{chapter_id}/generate` (protected by existing `get_current_user`).
  - Workflow: search FAISS for relevant chunks → call `generate_lesson_slides` with retrieved context → return structured JSON to frontend.
  - Router is mounted in `backend/main.py` with `app.include_router(lesson_router, prefix="/lessons", tags=["Lessons"])`.

Phase 10 — Frontend lesson viewer & attention monitoring
- Added `frontend/src/components/LessonPlayer.jsx` that fetches the lesson JSON and renders slides with animations using `framer-motion`. It uses `react-katex` to render LaTeX formulas and `axios` for requests. A TEMP_TOKEN constant exists in the component for initial testing (replace with a real JWT in production).
- Added `frontend/src/components/AttentionMonitor.jsx` which dynamically imports MediaPipe Face Mesh and uses a hidden webcam video to detect presence of a face. It computes a simple `attentionScore` (1.0 when face detected, 0.0 when not) and POSTs the score every 10s to the backend endpoint `/lessons/attention-log`.
- Embedded `AttentionMonitor` into `LessonPlayer` as a small overlay eye icon that turns green when focused and red when not focused.

Phase 11 — Attention logging (backend)
- Added persistent model `backend_app/models/attention_log.py` (table `attention_logs`) and registered it so SQLAlchemy `create_all` creates the table on startup.
- Added Pydantic schema `backend_app/schemas/attention.py` and router `backend_app/api/attention.py` with POST `/lessons/attention-log` to accept logs (optionally authenticated).
- Added `get_current_user_optional` dependency so the attention endpoint can accept logs with or without a token (will associate an authenticated user if token present).

Phase 12 — Configuration, env, and test tools
- Added `.env.example` with placeholders for `GROQ_API_KEY`, `SECRET_KEY`, and `DATABASE_URL`.
- Added `.gitignore` to exclude `.env`, `backend/app.db`, virtualenvs and cache files.
- Implemented `backend_app/core/config.py` (uses `python-dotenv`) and exposes `settings` used across the app (`GROQ_API_KEY`, `SECRET_KEY`, `DATABASE_URL`).
- Updated DB session factory to read `DATABASE_URL` from `settings` so scripts and service use same DB endpoint.
- Added `backend/test_final_generator.py` — a test script that logs in, calls `/lessons/2/generate` and prints/validates JSON locally. Note: the script depends on the `requests` package.
- Added `backend/test_query.py` snippet to query FAISS directly (example usage) and verify retrieval quality.

---

## Complete file-level summary (created/modified)
Below is a more exhaustive file list including files created or modified during the full session up to 2026-02-20. For each file I list a short purpose and any important notes.

Backend (detailed)
- `backend/requirements.txt` — dependency manifest. Important packages added during iteration: fastapi, uvicorn[standard], sqlalchemy, pydantic, python-jose, passlib[bcrypt], sentence-transformers, faiss-cpu, numpy, groq, python-dotenv, PyMuPDF (fitz), langchain, requests.
- `backend/main.py` — FastAPI entrypoint. Registers routers, CORS policy, and runs `Base.metadata.create_all(bind=engine)` on startup.
- `backend/app.db` — SQLite file (created at runtime). If you change models, recreate or use migrations.
- `backend/backend_app/core/config.py` — loads `.env` and exposes settings used across the app.
- `backend/backend_app/core/security.py` — JWT utilities, password hashing, `get_current_user`, `get_current_admin`, plus `get_current_user_optional` (optional auth for attention logs).
- `backend/backend_app/db/base.py` — SQLAlchemy declarative `Base`.
- `backend/backend_app/db/session.py` — engine creation, `SessionLocal`, and `get_db` dependency. Reads `DATABASE_URL` from `settings`.
- `backend/backend_app/models/user.py` — User model with fields: id, email, hashed_password, full_name, role (student/admin). NOTE: adding `role` after initial table creation requires migration or manual ALTER TABLE.
- `backend/backend_app/models/subject.py` — Subject model (id, title, description, created_at).
- `backend/backend_app/models/chapter_content.py` — ChapterContent model to store text chunks and metadata used by RAG.
- `backend/backend_app/models/attention_log.py` — AttentionLog model (lesson_id, attention_score, user_id, created_at).
- `backend/backend_app/models/__init__.py` — imports models so SQLAlchemy registers them for `create_all()`.
- `backend/backend_app/schemas/user.py` — Pydantic models for UserCreate and UserResponse (v2 from_attributes configured).
- `backend/backend_app/schemas/subject.py` — Subject create/response schemas.
- `backend/backend_app/schemas/lesson.py` — Lesson slide response schemas (title, bullets, formula, narration, hint) — used for documentation and validation.
- `backend/backend_app/schemas/attention.py` — `AttentionLogCreate` Pydantic schema for the attention endpoint.
- `backend/backend_app/services/user_service.py` — password hashing, create_user, get_user_by_email.
- `backend/backend_app/ai/llm_service.py` — Groq integration and fallback generator. Important notes:
-   - Iterated multiple times to correct SDK usage: initially used an unsupported `generate` call, later replaced with `client.chat.completions.create(...)` and removed invalid kwargs (e.g., `max_output_tokens`).
-   - Adds robust fallback that creates deterministic slides from retrieved context when Groq is unavailable or fails.
- `backend/backend_app/rag/vector_service.py` — VectorStoreManager
-   - Uses SentenceTransformers (`all-MiniLM-L6-v2`) to compute embeddings.
-   - Uses FAISS (IndexFlatIP) with normalization to emulate cosine similarity.
-   - Methods: add_documents, search, save_index, load_index. Persists to `backend/faiss_index.bin` and `backend/faiss_entries.json`.
- `backend/backend_app/rag/ingest_ncert.py` — Ingest pipeline for NCERT PDFs using PyMuPDF + LangChain splitter. Stores chunks to ChapterContent and adds them to FAISS index.
- `backend/backend_app/api/user.py` — user router: `/users/register`, `/users/login`, `/users/me`.
- `backend/backend_app/api/subject.py` — subject router (admin create + auth-protected list).
- `backend/backend_app/api/lesson.py` — lesson generation endpoint (`GET /lessons/{chapter_id}/generate`). Searches FAISS and calls `generate_lesson_slides`.
- `backend/backend_app/api/attention.py` — attention router with `POST /lessons/attention-log` to persist attention events.
-
-Frontend (detailed)
- `frontend/package.json` — project manifest, dependencies installed during the session (framer-motion, lucide-react, axios, react-katex, katex, @mediapipe packages optionally).
- `frontend/src/App.jsx` — replaced example content to render `LessonPlayer` as the main app view.
- `frontend/src/index.css` — added `@import 'katex/dist/katex.min.css';` and styles for the lesson player and slides.
- `frontend/src/components/LessonPlayer.jsx` — main lesson viewer component that fetches `GET http://localhost:8000/lessons/2/generate` (Authorization: Bearer token), renders slides with `framer-motion`, shows LaTeX via `react-katex`, and includes `AttentionMonitor` overlay.
- `frontend/src/components/AttentionMonitor.jsx` — MediaPipe-based monitor which computes a binary attention score and POSTs every 10s to the backend attention log endpoint. Uses dynamic import of `@mediapipe/face_mesh` and `@mediapipe/camera_utils` so it's only loaded when needed.
- `frontend/src/components/LessonPlayer.css` — small component-scoped CSS file (placeholder). Most slide styles are in `src/index.css`.
-
-Tests & Utilities
- `backend/test_final_generator.py` — integration test: logs in via `/users/login`, calls `/lessons/2/generate` and validates output. Depends on `requests` package.
- `backend/test_query.py` — script to run FAISS queries directly against the persisted vector store (useful to debug missing ingestion or failed retrievals).
