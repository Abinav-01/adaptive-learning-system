import os
import json
import re
import traceback
from typing import List, Dict, Any

try:
    from groq import Groq
except Exception:
    Groq = None


def _build_system_prompt(chapter_title: str) -> str:
    return (
        "You are a CBSE Class 10 Mathematics Tutor. Produce lesson slides in strict JSON. "
        "The style must match CBSE Class 10 Board Exam expectations and provide step-by-step math solving. "
        "Use LaTeX for formulas. Output MUST be valid JSON and must not include any extra text."
        f" Topic: {chapter_title}."
    )


def _build_user_prompt(chapter_title: str, retrieved_context: List[Dict[str, Any]]) -> str:
    # Flatten retrieved context into a short context string
    pieces = []
    for i, entry in enumerate(retrieved_context):
        meta = entry.get("metadata") or {}
        title = meta.get("chapter_id", f"chunk_{i}")
        text = entry.get("text", "").strip()
        pieces.append(f"[{title}] {text}")
    context_text = "\n\n".join(pieces)

    return (
        "Using the following retrieved textbook context, generate EXACTLY 5 detailed slides in a JSON object with a single key 'slides' (an array). "
        "Each slide must be an object with the fields: title, bullets (array of short bullet strings), formula (LaTeX string or empty), "
        "narration (for TTS), and hint (short string). Ensure CBSE Class 10 Board Exam style, step-by-step solutions, and include formulas from the retrieved context where applicable (for example: \\\alpha + \\\beta = -\\frac{b}{a}, \\\alpha\\beta = \\\frac{c}{a}). "
        "Do not output any explanatory text outside the JSON.\n\nRetrieved Context:\n"
        + context_text
        + f"\n\nGenerate 5 slides about: {chapter_title}"
    )


def _extract_formulas_from_text(text: str) -> List[str]:
    # naive regex to find LaTeX-like or formula patterns
    patterns = [r"\\frac\{[^}]+\}\{[^}]+\}", r"\\alpha", r"\\beta", r"\bD\b", r"\b\d+\b", r"\^"]
    found = set()
    for pat in patterns:
        for m in re.findall(pat, text):
            found.add(m)
    # also look for common polynomial relations in plain text
    if "sum of zero" in text.lower() or "sum of roots" in text.lower() or "sum of zeroes" in text.lower():
        found.add("\\alpha + \\\beta = -\\frac{b}{a}")
    if "product of zero" in text.lower() or "product of roots" in text.lower():
        found.add("\\alpha\\beta = \\\frac{c}{a}")
    return list(found)


def generate_lesson_slides(chapter_title: str, retrieved_context: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Generate structured lesson slides JSON using Groq LLM (or fallback).

    This function is hardened to never raise — on any internal error it logs a traceback
    and returns a deterministic fallback with 5 slides.
    """

    # Ensure type safety for retrieved_context
    if not isinstance(retrieved_context, list):
        retrieved_context = []

    try:
        system_prompt = _build_system_prompt(chapter_title)
        user_prompt = _build_user_prompt(chapter_title, retrieved_context)

        api_key = os.environ.get("GROQ_API_KEY")
        if Groq and api_key:
            try:
                client = Groq(api_key=api_key)
                messages = [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ]
                response = client.chat.completions.create(
                    model="llama-3.3-70b-versatile",
                    messages=messages,
                    response_format={"type": "json_object"},
                    temperature=0.2,
                )

                # Standard SDK access pattern: choices[0].message.content
                content = None
                try:
                    # attempt attribute access
                    choices = getattr(response, "choices", None)
                    if choices and len(choices) > 0:
                        first = choices[0]
                        # first may be object-like or dict-like
                        if isinstance(first, dict):
                            msg = first.get("message") or first.get("text") or {}
                            if isinstance(msg, dict):
                                content = msg.get("content")
                            else:
                                content = msg
                        else:
                            # object style
                            msg = getattr(first, "message", None) or getattr(first, "text", None)
                            content = getattr(msg, "content", None) if msg is not None else None

                except Exception:
                    content = None

                if content:
                    try:
                        return json.loads(content)
                    except Exception:
                        # if content is already dict-like
                        if isinstance(content, dict):
                            return content

            except Exception:
                # fall through to fallback below after logging
                traceback.print_exc()

        # Fallback deterministic generation using retrieved_context
        context_text = "\n\n".join([e.get("text", "") for e in retrieved_context])
        formulas = _extract_formulas_from_text(context_text)
        if not formulas:
            formulas = ["\\frac{-b \\\pm \\\sqrt{D}}{2a}"]

        snippets = [s.replace("\n", " ") for s in context_text.split('\n\n') if s.strip()][:10]

        slides = []
        for i in range(5):
            bullets = []
            if i < len(snippets):
                parts = snippets[i].split('. ')
                bullets.append(parts[0][:200])
                if len(parts) > 1:
                    bullets.append(parts[1][:200])
            else:
                bullets = ["Definition or key point", "Important relation or note"]

            slide = {
                "title": f"{chapter_title} — Concept {i+1}",
                "bullets": bullets,
                "formula": formulas[i % len(formulas)],
                "narration": " ".join(bullets) + " — explain step by step for CBSE Class 10 board exam.",
                "hint": "Highlight the coefficient relationships and show example problems.",
            }
            slides.append(slide)

        return {"slides": slides}

    except Exception:
        # Catch any unexpected error and ensure we always return valid JSON
        traceback.print_exc()
        # Minimal safe fallback
        safe_slides = [
            {"title": "Fallback Slide 1", "bullets": ["Key idea"], "formula": "", "narration": "", "hint": ""},
            {"title": "Fallback Slide 2", "bullets": ["Key idea"], "formula": "", "narration": "", "hint": ""},
            {"title": "Fallback Slide 3", "bullets": ["Key idea"], "formula": "", "narration": "", "hint": ""},
            {"title": "Fallback Slide 4", "bullets": ["Key idea"], "formula": "", "narration": "", "hint": ""},
            {"title": "Fallback Slide 5", "bullets": ["Key idea"], "formula": "", "narration": "", "hint": ""},
        ]
        return {"slides": safe_slides}
