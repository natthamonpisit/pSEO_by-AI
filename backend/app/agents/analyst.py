from .core import client, MODEL_NAME
from .clerk import enrich_product_specs
from ..database import get_db
from google.genai.types import GenerateContentConfig
import json
from typing import List, Dict, Any

async def find_best_match(product_id: str) -> Dict[str, Any]:
    """
    The 'Smart Loop': 
    1. Check target product.
    2. Identify best competitor.
    3. Check if competitor exists in DB.
    4. If NOT, force Clerk to fetch it.
    5. Return both products ready for Editor.
    """
    db = get_db()
    
    # 1. Get Target Product
    try:
        response = db.table("products").select("*").eq("id", product_id).execute()
        if not response.data:
            return {"error": "Product not found"}
        target_product = response.data[0]
    except Exception as e:
        return {"error": f"DB Error: {e}"}

    print(f"🧠 [Analyst] Analyzing match for: {target_product['name']}")

    # 2. Identify Competitors via AI
    prompt = f"""
    Role: You are a Tech Market Analyst.
    Task: Identify the SINGLE best direct competitor for: "{target_product['name']}" (Category: {target_product['category_slug']}).
    Context: Must be a real product, similar price range, same generation.
    Output: JSON only. {{ "competitor_name": "string", "reason": "string" }}
    """
    
    competitor_name = "Unknown"
    try:
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=prompt,
            config=GenerateContentConfig(response_mime_type="application/json")
        )
        data = json.loads(response.text)
        competitor_name = data.get("competitor_name")
        print(f"🤔 [Analyst] AI suggests competitor: {competitor_name}")
    except Exception as e:
        print(f"⚠️ Analyst AI Error: {e}")
        return {"error": "Failed to identify competitor"}

    # 3. Check DB for Competitor
    competitor_product = None
    
    # Simple fuzzy search or exact match? Let's try text search first
    try:
        # Check by name similarity or exact match
        # Using full text search or just ILIKE
        res = db.table("products").select("*").ilike("name", f"%{competitor_name}%").execute()
        if res.data:
            print(f"✅ [Analyst] Competitor found in DB: {res.data[0]['name']}")
            competitor_product = res.data[0]
    except Exception:
        pass

    # 4. FORCE FETCH LOOP (If missing)
    if not competitor_product:
        print(f"🚨 [Analyst] Competitor '{competitor_name}' MISSING! Triggering Clerk Force-Fetch...")
        
        # Call Clerk to scrape and save
        # We need the schema from the target product to ensure apples-to-apples comparison fields
        required_fields = list(target_product.get("specs", {}).keys())
        
        new_prod_obj = await enrich_product_specs(
            product_name=competitor_name,
            category=target_product['category_slug'], # Use slug as category name? Clerk might need conversion.
            required_fields=required_fields
        )
        
        # Save new competitor to DB
        try:
            payload = {
                "name": new_prod_obj.name,
                "brand": new_prod_obj.brand,
                "category_slug": target_product['category_slug'],
                "price": new_prod_obj.price,
                "currency": new_prod_obj.currency,
                "specs": new_prod_obj.specs,
                "image_url": new_prod_obj.imageUrl,
                "affiliate_link": new_prod_obj.affiliateLink
            }
            data_res = db.table("products").insert(payload).execute()
            if data_res.data:
                competitor_product = data_res.data[0]
                print(f"💾 [Analyst] Competitor saved: {competitor_product['name']}")
        except Exception as db_err:
            print(f"⚠️ Failed to save competitor: {db_err}")
            return {"error": "Failed to save competitor"}

    # 5. Return Pair
    return {
        "status": "ready",
        "product_a": target_product,
        "product_b": competitor_product
    }
