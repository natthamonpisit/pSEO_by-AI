import os
from google import genai
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("API_KEY", "")
MODEL_NAME = "gemini-2.0-flash"  # Using Flash for speed/cost

client = genai.Client(api_key=API_KEY)

def get_model():
    return client
