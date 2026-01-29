import os
import asyncio
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")

if not url or not key:
    print("❌ Error: SUPABASE_URL or SUPABASE_KEY is missing in .env")
    exit(1)

supabase: Client = create_client(url, key)

def trigger_trend():
    print("🚀 Firing fake signal: Xiaomi 17 Pro Leica...")
    
    # 1. Define the fake trend
    trend_data = {
        "query": "Xiaomi 17 Pro Leica",
        "search_volume": 88888,
        "status": "NEW",
        "category_slug": "smartphones", 
        "timestamp": "now()"
    }
    
    # 2. Check overlap
    try:
        existing = supabase.table("trends").select("*").eq("query", trend_data["query"]).execute()
        
        if existing.data:
            print("⚠️ Trend already exists! Resetting status to 'NEW' for re-processing...")
            supabase.table("trends").update({"status": "NEW"}).eq("query", trend_data["query"]).execute()
        else:
            print("✨ Inserting new test trend...")
            supabase.table("trends").insert(trend_data).execute()
            
        print("\n✅ Signal sent successfully!")
        print("⏳ The Scheduler (running locally or on Railway) should pick this up within 1 minute.")
        print("👉 Go to your Dashboard -> Trends to see it in action.")
        
    except Exception as e:
        print(f"❌ Database Error: {e}")

if __name__ == "__main__":
    trigger_trend()
