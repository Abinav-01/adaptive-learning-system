import sys
import os
import requests
import json

# Add parent directory to path for imports
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from backend_app.ai.llm_service import clean_math_text

def test_cleaning():
    print("--- Testing clean_math_text ---")
    
    test_cases = [
        {"input": "x + y = 0", "expected": "x + y = 0"},
        {"input": "a \u2013 b", "expected": "a - b"},       
        {"input": "2 \u00d7 3", "expected": r"2 \times 3"}, 
        {"input": "x \u2264 5", "expected": r"x \le 5"},   
        {"input": "  multiple   spaces  ", "expected": "multiple spaces"},
    ]
    
    overall_pass = True
    for case in test_cases:
        actual = clean_math_text(case["input"])
        if actual == case["expected"]:
            print(f"✅ PASS: '{case['input']}' -> '{actual}'")
        else:
            print(f"❌ FAIL: '{case['input']}' -> Expected '{case['expected']}', got '{actual}'")
            overall_pass = False
            
    return overall_pass

def test_pedagogy_structure(lesson_json):
    print("\n--- Testing Premium Pedagogy Structure ---")
    slides = lesson_json.get("slides", [])
    topic = lesson_json.get("topic", "N/A")
    is_fallback = lesson_json.get("is_fallback", False)
    
    print(f"Topic: {topic}")
    print(f"Content Type: {'⚠️ FALLBACK' if is_fallback else '🚀 AI GENERATED'}")
    print(f"Total Slides: {len(slides)}")
    
    if not slides:
        print("❌ No slides found in response.")
        return False

    mandatory_fields = ["title", "bullets", "formula", "example_steps", "practice_questions", "narration"]
    
    all_valid = True
    for i, slide in enumerate(slides):
        print(f"\nChecking Slide {i+1}: {slide.get('title', 'UNTITLED')}")
        
        missing = [f for f in mandatory_fields if f not in slide]
        if missing:
            print(f"❌ Missing fields: {missing}")
            all_valid = False
        else:
            print("✅ All mandatory fields present")
            
        # Verify content types
        if not isinstance(slide.get("bullets"), list):
            print("❌ 'bullets' should be a list")
            all_valid = False
        if not isinstance(slide.get("example_steps"), list):
            print("❌ 'example_steps' should be a list")
            all_valid = False
        if not isinstance(slide.get("practice_questions"), list):
            print("❌ 'practice_questions' should be a list")
            all_valid = False
            
    return all_valid

API_BASE = "http://localhost:8000"

def get_token(email, password):
    url = f"{API_BASE}/users/login"
    try:
        resp = requests.post(url, data={"username": email, "password": password}, timeout=5)
        return resp.json().get("access_token")
    except:
        return None

def test_live_generation():
    print("\n--- Testing Live Generation ---")
    email = "cache_test@example.com"
    password = "password123"
    
    token = get_token(email, password)
    if not token:
        print("❌ Could not connect to backend at localhost:8000. Is it running?")
        return

    print("Calling generate with force_refresh=True...")
    url = f"{API_BASE}/lessons/chapter_2/generate?force_refresh=True"
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        resp = requests.get(url, headers=headers, timeout=30)
        if resp.status_code != 200:
            print(f"❌ API failure ({resp.status_code}): {resp.text}")
            return
            
        data = resp.json()
        success = test_pedagogy_structure(data)
        if success:
            print("\n✅ PREPARATION COMPLETE: All pedagogical tests passed!")
        else:
            print("\n❌ PEDAGOGY ERROR: Structural issues detected in response.")
            
    except requests.exceptions.Timeout:
        print("❌ Request timed out. LLM took longer than 30s.")
    except Exception as e:
        print(f"❌ Unexpected error: {str(e)}")

if __name__ == "__main__":
    if test_cleaning():
        test_live_generation()
    else:
        print("❌ Cleaning tests failed. Skipping live test.")
