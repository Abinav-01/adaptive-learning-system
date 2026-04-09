import os
import base64
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

dummy_b64 = "/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA="
image_bytes = base64.b64decode(dummy_b64)

try:
    response = client.models.generate_content(
        model='gemini-2.0-flash',
        contents=[
            types.Part.from_bytes(data=image_bytes, mime_type='image/jpeg'),
            'Tell me what you see in this image.'
        ]
    )
    print("Success:", response.text)
except Exception as e:
    print("Error:", str(e))
