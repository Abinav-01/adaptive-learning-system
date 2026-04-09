import os
import sqlite3
import json
import requests
import time

API_BASE = "http://localhost:8000"
DB_PATH = "backend/app.db" # Adjusted path based on list_dir

def get_token(email, password):
    url = f"{API_BASE}/users/login"
    # Try as form data first since loc: ["body", "username"] often implies form-request-form
    resp = requests.post(url, data={"username": email, "password": password})
    if resp.status_code != 200:
        # Fallback to JSON if form fails
        resp = requests.post(url, json={"username": email, "password": password})
    
    if resp.status_code != 200:
        print(f"❌ Login failed ({resp.status_code}): {resp.text}")
    return resp.json().get("access_token")

def clear_cache(token):
    url = f"{API_BASE}/lessons/clear-cache"
    requests.post(url, headers={"Authorization": f"Bearer {token}"})
    print("✅ Cache cleared")

def call_generate(token, chapter_id="chapter_1"):
    url = f"{API_BASE}/lessons/{chapter_id}/generate"
    start = time.time()
    resp = requests.get(url, headers={"Authorization": f"Bearer {token}"})
    end = time.time()
    print(f"⏱️ Call took {end-start:.2f}s")
    return resp.json()

def check_db_metrics(chapter_id="chapter_1"):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT is_fallback, quality_score, created_at FROM lesson_content WHERE chapter_id = ?", (chapter_id,))
    row = cursor.fetchone()
    conn.close()
    return row

def set_bad_quality(chapter_id="chapter_1"):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("UPDATE lesson_content SET quality_score = 0.1, is_fallback = 1 WHERE chapter_id = ?", (chapter_id,))
    conn.commit()
    conn.close()
    print(f"👹 Manually set {chapter_id} to BAD quality in DB")

def register_user(email, password):
    url = f"{API_BASE}/users/register"
    resp = requests.post(url, json={"email": email, "password": password, "full_name": "Test User"})
    if resp.status_code in [200, 201]:
        print(f"✅ User {email} registered")
    else:
        print(f"ℹ️ User {email} possibly exists or registration failed: {resp.text[:100]}")

def main():
    email = "cache_test@example.com"
    password = "password123"
    
    # Ensure user exists
    register_user(email, password)
    
    token = get_token(email, password)
    if not token:
        print("❌ Could not get token. Check credentials.")
        return

    # 1. Clear everything
    clear_cache(token)

    # 2. First generate (should be cache miss, fresh gen)
    print("\n--- First Generate (Fresh) ---")
    call_generate(token)
    m1 = check_db_metrics()
    print(f"DB Metrics: fallback={m1[0]}, score={m1[1]}, saved_at={m1[2]}")

    # 3. Second generate (should be cache hit, fast)
    print("\n--- Second Generate (Cache Hit) ---")
    call_generate(token)
    m2 = check_db_metrics()
    if m1[2] == m2[2]:
        print("✅ Cache hit confirmed (timestamp identical)")
    else:
        print("❌ Cache miss unexpected (timestamp changed)")

    # 4. Make it bad
    set_bad_quality()
    m_bad = check_db_metrics()
    print(f"DB now has: fallback={m_bad[0]}, score={m_bad[1]}")

    # 5. Third generate (should be REJECTED and REGENERATED)
    print("\n--- Third Generate (Should reject bad cache) ---")
    call_generate(token)
    m3 = check_db_metrics()
    print(f"DB Metrics now: fallback={m3[0]}, score={m3[1]}, saved_at={m3[2]}")
    
    if m3[2] != m_bad[2]:
        print("✅ REGENERATION SUCCESSFUL (timestamp changed despite cache existing)")
    else:
        print("❌ REGENERATION FAILED (stale cache served)")

if __name__ == "__main__":
    main()
