#!/usr/bin/env python3
"""
Test script to verify lesson generation endpoint.

Usage:
  - Ensure backend is running (uvicorn main:app --app-dir backend --reload)
  - Set environment variables or edit the defaults below for credentials
  - Run: python backend/test_final_generator.py

The script will:
  1. POST /users/login to obtain an access token
  2. GET /lessons/2/generate with Authorization Bearer token
  3. Pretty-print the returned JSON and perform basic validation checks
"""

import os
import sys
import json
import requests
from getpass import getpass

API_BASE = os.environ.get("API_BASE", "http://localhost:8000")
LOGIN_PATH = "/users/login"
LESSON_PATH = "/lessons/2/generate"


def get_token(email: str, password: str):
    url = API_BASE + LOGIN_PATH
    payload = {"email": email, "password": password}
    resp = requests.post(url, json=payload)
    if resp.status_code != 200:
        print("Login failed:", resp.status_code, resp.text)
        sys.exit(1)
    data = resp.json()
    return data.get("access_token")


def call_generate(token: str):
    url = API_BASE + LESSON_PATH
    headers = {"Authorization": f"Bearer {token}"}
    resp = requests.get(url, headers=headers)
    if resp.status_code != 200:
        print("Generate endpoint failed:", resp.status_code, resp.text)
        sys.exit(1)
    return resp.json()


def validate_lesson(resp_json):
    # Look for curriculum-specific keywords and LaTeX formulas
    text_blob = json.dumps(resp_json)
    keywords = ["zero", "zeroes", "zeros", "coefficient", "Sum of Zeroes", "product of zeroes", "\u005cfrac", "\\frac", "\\sqrt"]
    found = {k: (k.lower() in text_blob.lower()) for k in keywords}
    return found


def main():
    email = os.environ.get("TEST_USER_EMAIL")
    password = os.environ.get("TEST_USER_PASSWORD")
    if not email:
        email = input("Login email: ")
    if not password:
        password = getpass("Password: ")

    print("Logging in as", email)
    token = get_token(email, password)
    print("Got token (len):", len(token) if token else token)

    print("Calling lesson generator for chapter 2...")
    result = call_generate(token)

    print("\n--- Lesson JSON (pretty) ---\n")
    print(json.dumps(result, indent=2, ensure_ascii=False))

    print("\n--- Validation checks ---")
    found = validate_lesson(result)
    for k, v in found.items():
        print(f"{k}: {'FOUND' if v else 'MISSING'}")

    # Basic pass/fail
    if any(found.values()):
        print("\nBasic validation: some curriculum content or LaTeX detected.")
    else:
        print("\nBasic validation: NO curriculum keywords or LaTeX detected. Review LLM output.")


if __name__ == "__main__":
    main()
