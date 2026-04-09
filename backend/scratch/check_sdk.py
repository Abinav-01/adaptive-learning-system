import os
from google import genai

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

# List available methods on the models proxy
print(dir(client.models))
