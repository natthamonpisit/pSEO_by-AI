from .core import client, MODEL_NAME
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import json
from google.genai.types import Tool, GenerateContentConfig, GoogleSearch
import requests

class Product(BaseModel):
    name: str
    price: float = 0
    currency: str = "USD"
    brand: str
    category: str
    specs: Dict[str, Any]
    tags: List[str] = []
    imageUrl: str = ""
    affiliateLink: str = ""

# Import Database Connection
from ..database import get_db

async def ensure_category_config(category_name: str) -> List[str]:
    """
    Checks if a category exists in DB and has comparison_fields.
    If not, uses AI to generate them and saves to DB.
    """
    db = get_db()
    
    # 1. Check DB
    try:
        # Slugify name (e.g. "Running Shoes" -> "running-shoes")
        slug = category_name.lower().replace(" ", "-")
        
        response = db.table("categories").select("*").eq("slug", slug).execute()
        existing = response.data
        
        if existing and existing[0].get("comparison_fields"):
            print(f"✅ [Clerk] Found config for: {category_name}")
            return existing[0]["comparison_fields"]
            
        print(f"⚡ [Clerk] New Category detected: {category_name}. Agent is designing spec template...")
        
    except Exception as e:
        print(f"⚠️ DB Check Error: {e}")
        # Proceed to generation anyway if DB check fails
    
    # 2. AI Generation (The Architect)
    prompt = f"""
    Role: You are a Category Manager & Data Architect.
    Task: Define the standard "Comparison Fields" for product category: "{category_name}".
    Context: We need 5-7 technical specs that are crucial for comparing products in this category.
    Output: JSON Object only.
    Schema: {{ "comparison_fields": ["Field1", "Field2", ...], "content_tone": "Professional/Excited/Technical" }}
    """
    
    default_fields = ["Features", "Performance", "Value", "Price"]
    tone = "Professional"
    
    try:
        gen_response = client.models.generate_content(
            model=MODEL_NAME,
            contents=prompt,
            config=GenerateContentConfig(response_mime_type="application/json")
        )
        data = json.loads(gen_response.text)
        fields = data.get("comparison_fields", default_fields)
        tone = data.get("content_tone", "Professional")
        
        # 3. Save to DB
        try:
            slug = category_name.lower().replace(" ", "-")
            
            # Upsert logic (Insert or Update)
            # Check exist first to decide ID logic or just upsert by slug? 
            # Supabase upsert by unique constraint (slug) is best.
            
            payload = {
                "name": category_name,
                "slug": slug,
                "comparison_fields": fields,
                "content_tone": tone,
                # "parent_id": ... hard to guess parent, leave null for manual assign
            }
            
            # Upsert
            db.table("categories").upsert(payload, on_conflict="slug").execute()
            print(f"💾 [Clerk] Saved new template for {category_name}")
            
        except Exception as db_err:
            print(f"⚠️ Failed to save category config: {db_err}")
            
        return fields
        
    except Exception as e:
        print(f"⚠️ Template Generation Failed: {e}")
        return default_fields

async def generate_spec_template(category_name: str) -> Dict[str, Any]:
    # Wrapper for independent testing
    fields = await ensure_category_config(category_name)
    return {"fields": fields}

# Scraping Libs
from duckduckgo_search import DDGS
from bs4 import BeautifulSoup
import requests

def find_product_url(product_name: str, category: str) -> str:
    """Finds the best URL for product specs using DuckDuckGo."""
    query = f"{product_name} {category} official specs features"
    try:
        results = DDGS().text(keywords=query, max_results=1)
        if results:
            return results[0]['href']
    except Exception as e:
        print(f"⚠️ URL Search Error: {e}")
    return ""

def find_product_image(product_name: str) -> str:
    """Finds a relevant product image using DuckDuckGo Images."""
    query = f"{product_name} official product photo white background"
    try:
        # max_results=1 to get the top hit
        results = DDGS().images(keywords=query, max_results=1)
        if results:
            return results[0]['image']
    except Exception as e:
        print(f"⚠️ Image Search Error: {e}")
    # Fallback placeholder
    return "https://placehold.co/600x400?text=No+Image"

def scrape_page_content(url: str) -> str:
    """Scrapes text content from a URL."""
    try:
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'}
        response = requests.get(url, headers=headers, timeout=10)
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Remove script and style elements
        for script in soup(["script", "style", "nav", "footer"]):
            script.decompose()
            
        text = soup.get_text()
        # Generic cleanup
        lines = (line.strip() for line in text.splitlines())
        chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
        clean_text = '\n'.join(chunk for chunk in chunks if chunk)
        return clean_text[:10000] # Limit context window
    except Exception as e:
        print(f"⚠️ Scraping Error: {e}")
        return ""

async def enrich_product_specs(product_name: str, category: str, required_fields: List[str] = [], language: str = 'TH') -> Product:
    
    # 0. Dynamic Config Check
    if not required_fields:
        required_fields = await ensure_category_config(category)

    print(f"🤖 [Clerk] Researching: {product_name} (Fields: {required_fields})")
    
    # 1. FIND & SCRAPE (Real Web Scraping)
    target_url = find_product_url(product_name, category)
    scraped_content = ""
    
    if target_url:
        print(f"🌐 Found URL: {target_url}")
        scraped_content = scrape_page_content(target_url)
    
    # 2. PARSE WITH AI (Gemini as Parser, not Generator)
    # This is "Grounding" - using AI to extract data from real text
    
    tools = []
    # If scraping failed, enable Google Search Tool as fallback
    if not scraped_content:
        print("⚠️ Scraping failed. Switching to Google Search Tool (Fallback)...")
        tools = [Tool(google_search=GoogleSearch())]
    
    prompt = f"""
    Role: You are a Data Entry Specialist.
    Task: Extract technical specifications for: "{product_name}" (Category: {category}).
    
    {'Source Text:' if scraped_content else 'Context: Search for OFFICIAL specs.'}
    {scraped_content if scraped_content else ''}
    
    Target Fields: {', '.join(required_fields)}
    
    Instructions:
    - Extract ONLY the requested fields.
    - If a field is not found, leave it as null or "N/A".
    - Output STRICT JSON. Do not include markdown keys.
    """
    
    try:
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=prompt,
            config=GenerateContentConfig(
                tools=tools,
                response_mime_type="text/plain" # Avoid JSON mode conflict with tools/large text
            )
        )
        
        # Parse JSON
        text = response.text.replace("```json", "").replace("```", "").strip()
        data = json.loads(text)
        
        # Affiliate Link Logic
        aff_link = ""
        if language == 'TH':
            aff_link = f"https://shopee.co.th/search?keyword={product_name}"
        else:
             aff_link = f"https://www.google.com/search?q={product_name}"

        # IMAGE SEARCH
        real_image_url = find_product_image(product_name)
        print(f"📸 Found Image for {product_name}: {real_image_url}")

        return Product(
            name=product_name,
            price=data.get("price", 0),
            currency="USD",
            brand=data.get("brand", "Unknown"),
            category=category,
            specs=data.get("specs", data), # Some AI models return flat JSON, some nested. Handle both.
            tags=data.get("tags", []),
            imageUrl=real_image_url,
            affiliateLink=aff_link
        )
        
    except Exception as e:
        print(f"Clerk Error: {e}")
        return Product(name=product_name, brand="Unknown", category=category, specs={})
