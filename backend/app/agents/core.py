import os
from google import genai
from dotenv import load_dotenv

load_dotenv()

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY", "")
MODEL_NAME = "gemini-2.0-flash"  # Using Flash for speed/cost

client = genai.Client(api_key=GOOGLE_API_KEY)

def get_model():
    return client
