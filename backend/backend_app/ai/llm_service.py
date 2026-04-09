import os
import json
import re
from typing import List, Dict, Any
from groq import Groq

# Initialize clean Groq client
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def clean_math_text(text: str) -> str:
    """Post-process text/math to remove artifacts and normalize symbols."""
    if not text:
        return ""
    # Fix literal \n escape sequences returned by LLM
    text = text.replace("\\n", " ").replace("\r", " ")
    text = re.sub(r'[\uFFFD]', '', text)
    text = " ".join(text.split())  # collapse all whitespace
    replacements = {
        "–": "-", "—": "-", "−": "-",
        "×": r"\times", "÷": r"\div", "±": r"\pm",
        "≤": r"\le", "≥": r"\ge", "≠": r"\ne"
    }
    for old, new in replacements.items():
        text = text.replace(old, new)
    return text

def fallback_generator(chapter_title: str, topic: str, context_text: str) -> Dict[str, Any]:
    """Safety net for failed AI calls or broken JSON."""
    exact_topic = topic if topic else chapter_title
    slides = [
        {
            "title": f"The Fundamentals of {exact_topic}",
            "bullets": [f"Introduction to the core concepts of {exact_topic}", f"Understanding its relevance in mathematics"],
            "formula": "ax^2 + bx + c = 0",
            "example_steps": ["Identify variables", "Apply the core formula"],
            "practice_questions": [f"Define {exact_topic} in your own words."],
            "narration": f"Hi there! Let's explore {exact_topic} together. We'll start with the basics before moving to examples."
        }
    ]
    return {"topic": exact_topic, "slides": slides, "is_fallback": True, "quality_score": 0.2}

def generate_lesson_slides(chapter_title: str, retrieved_context: List[Dict[str, Any]], topic: str = None) -> Dict[str, Any]:
    """Generation function using Groq's high-speed API with explicit constraint handling."""
    exact_topic = topic if topic else chapter_title
    
    # Token Control: limit to 4000 chars exactly as instructed
    raw_context = "\n\n".join([e.get("text", "") for e in retrieved_context])
    context_text = raw_context[:4000]

    prompt = f"""
STRICT RULES:
- Output ONLY valid JSON
- NO markdown
- NO explanation outside JSON
- Use clean LaTeX (KaTeX compatible)

FORMAT:
[
  {{
    "title": "...",
    "bullets": ["...", "..."],
    "formula": "LaTeX",
    "example_steps": ["step1", "step2"],
    "practice_questions": ["Q1", "Q2"],
    "narration": "..."
  }}
]

CONTEXT INFO:
{context_text}

TOPIC: {exact_topic}
    """
    
    try:
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": "You are a math teacher. Generate structured lesson content."},
                {"role": "user", "content": prompt.strip()}
            ],
            temperature=0.4,
            max_tokens=2500
        )

        content = response.choices[0].message.content.strip()
        
        # Important Output Cleaning
        content = content.replace("```json", "").replace("```", "").strip()
        
        slides = json.loads(content)
        
        if not isinstance(slides, list):
            raise ValueError("Parsed content is not a list")

        processed_slides = []
        for slide in slides:
            processed_slides.append({
                "title": clean_math_text(slide.get("title", "Algebra Focus")),
                "bullets": [clean_math_text(b) for b in slide.get("bullets", [])],
                "formula": clean_math_text(slide.get("formula", "")),
                "example_steps": [clean_math_text(s) for s in slide.get("example_steps", [])],
                "practice_questions": [clean_math_text(q) for q in slide.get("practice_questions", [])],
                "narration": clean_math_text(slide.get("narration", ""))
            })

        return {
            "topic": exact_topic,
            "slides": processed_slides,
            "is_fallback": False,
            "quality_score": 1.0
        }

    except Exception as e:
        print(f"⚠️ Groq JSON failed: {str(e)}")
        return fallback_generator(chapter_title, exact_topic, context_text)
