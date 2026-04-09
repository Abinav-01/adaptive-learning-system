import os
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import traceback

import json
from backend_app.ai.llm_service import client

router = APIRouter()

class SlideContext(BaseModel):
    title: Optional[str] = ""
    bullets: Optional[List[str]] = []
    formula: Optional[str] = ""
    narration: Optional[str] = ""

class AskRequest(BaseModel):
    question: str
    context: SlideContext

@router.post("/ask")
def ask_ai_tutor(request: AskRequest):
    try:
        # Format context for the tutor
        bullets_text = " ".join(request.context.bullets) if request.context.bullets else "None"
        context_str = (
            f"Slide Title: {request.context.title}\n"
            f"Bullets: {bullets_text}\n"
            f"Formula: {request.context.formula}\n"
            f"Narration: {request.context.narration}"
        )
        
        prompt = f"""
You are a helpful math tutor.

Context:
{context_str}

User Question:
{request.question}

Rules:
- Answer clearly and simply.
- Stay within the provided context.
- Keep the response concise.
"""
        
        # Call Groq
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": "You are a helpful math tutor."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.4,
            max_tokens=250
        )
        
        answer = response.choices[0].message.content.strip()
        
        if not answer:
            return {"answer": "I don't see that in the current lesson"}
            
        return {"answer": answer}
        
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

class TopicQuery(BaseModel):
    query: str

@router.post("/interpret-topic")
def interpret_topic(request: TopicQuery):
    query_text = request.query.lower()
    
    # Basic logic as requested (Only chapter 2 is fully mocked out with RAG context)
    keywords = ["polynomial", "quadratic", "roots", "equation"]
    
    if any(k in query_text for k in keywords):
        return {
            "chapter_id": "chapter_2",
            "chapter_name": "Polynomials"
        }
        
    # Fallback to the same chapter to ensure the demo continues safely
    return {
        "chapter_id": "chapter_2",
        "chapter_name": "Polynomials"
    }
