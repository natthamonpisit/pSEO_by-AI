from apscheduler.schedulers.asyncio import AsyncIOScheduler
from app.agents import hunter, clerk, analyst, editor
from app.database import get_db
import asyncio

scheduler = AsyncIOScheduler()

async def run_hunter_job():
    print("⏰ [Scheduler] Running Hunter Job...")
    await hunter.get_daily_trends(category="Technology")

async def run_processing_loop():
    """
    Core Automation Loop:
    1. Check 'trends' table for NEW items.
    2. For each new trend:
       - Check/Fetch Product (Clerk)
       - Find Competitor (Analyst)
       - Generate Comparison (Editor)
       - Save to DB
       - Mark trend as PROCESSED
    """
    print("⏰ [Scheduler] Running Processing Loop...")
    db = get_db()
    
    # 1. Fetch NEW trends
    # trends = db.table("trends").select("*").eq("status", "NEW").limit(5).execute().data
    # Note: For now, we assume simple fetch. Real implementation might need more robust queue.
    try:
        trends_res = db.table("trends").select("*").eq("status", "NEW").limit(1).execute()
        trends = trends_res.data
    except Exception as e:
        print(f"⚠️ Scheduler DB Error: {e}")
        return

    if not trends:
        print("💤 [Scheduler] No new trends to process.")
        return

    for trend in trends:
        print(f"🔄 [Scheduler] Processing: {trend['product_name']}")
        
        try:
            # 2. Clerk: Ensure product exists
            product_a = await clerk.enrich_product_specs(trend['product_name'], trend['category_slug'])
            
            # 3. Analyst: Find Competitor
            # Analyst returns {product_a, product_b} or error
            # We need to adapt analyst to accept product object or ID. 
            # Current analyst.find_best_match takes product_id.
            
            # We need to ensure product_a is saved first? 
            # enrich_product_specs returns an object, but doesn't necessarily save it?
            # actually clerk.enrich_product_specs DOES NOT save to DB, it just returns data.
            # We need to save product_a to DB if it's new.
            
            # Check if exists by name
            existing_a = db.table("products").select("id, has_content").eq("name", product_a.name).execute().data
            if existing_a:
                p1_id = existing_a[0]['id']
                # CHECK DUPLICATE: If already has content, skip
                if existing_a[0].get('has_content', False):
                     print(f"⏭️ [Scheduler] Skipping {product_a.name} (Content already exists)")
                     db.table("trends").update({"status": "DUPLICATE"}).eq("id", trend['id']).execute()
                     continue
            else:
                # Save Product A
                p1_payload = {
                    "name": product_a.name,
                    "brand": product_a.brand,
                    "category_slug": trend['category_slug'], # Use trend category
                    "price": product_a.price,
                    "currency": product_a.currency,
                    "specs": product_a.specs,
                    "image_url": product_a.imageUrl,
                    "affiliate_link": product_a.affiliateLink,
                    "has_content": False
                }
                res_a = db.table("products").insert(p1_payload).execute()
                p1_id = res_a.data[0]['id']

            # 4. Analyst Match
            match_res = await analyst.find_best_match(p1_id)
            if "error" in match_res:
                print(f"⚠️ Analyst Error: {match_res['error']}")
                continue

            # 5. Editor Generate
            # We need p1 and p2 objects from match_res
            p1_data = match_res['product_a']
            p2_data = match_res['product_b']
            
            comparison = await editor.generate_comparison(
                p1=p1_data,
                p2=p2_data,
                focus_fields=["Price", "Specs", "Features"],
                tone="Neutral",
                language="TH" 
            )
            
            # 6. Save Comparison
            comp_payload = {
                "product_a_id": p1_id,
                "product_b_id": p2_data['id'],
                "title": comparison.title,
                "intro": comparison.intro,
                "verdict": comparison.verdict,
                "winner_id": None, # complex to resolve winner name to ID if it's dynamic. Editor returns winnerId string (name).
                # ideally we should map name to ID, but schema says winner_id is UUID.
                # If Editor returns product Name as winnerId, we can't save it directly to UUID column.
                
                "score_a": comparison.scoreA,
                "score_b": comparison.scoreB,
                "pros_a": comparison.prosA,
                "cons_a": comparison.consA,
                "pros_b": comparison.prosB,
                "cons_b": comparison.consB,
                "spec_comparison": comparison.specComparison,
                "faqs": comparison.faqs,
                "language": "TH"
            }
            
            # Resolve winner_id (Optional)
            if comparison.winnerId:
                 # Check if match Product A or B
                 if comparison.winnerId == p1_data['name']:
                     comp_payload["winner_id"] = p1_id
                 elif comparison.winnerId == p2_data['name']:
                     comp_payload["winner_id"] = p2_data['id']

            db.table("comparisons").insert(comp_payload).execute()
            
            # 7. Update Trend Status AND Product Flag
            db.table("trends").update({"status": "ADDED"}).eq("id", trend['id']).execute()
            db.table("products").update({"has_content": True}).eq("id", p1_id).execute()
            print(f"✅ [Scheduler] Processed {trend['product_name']} complete!")
            
        except Exception as e:
            print(f"❌ [Scheduler] Failed to process {trend['product_name']}: {e}")
            # Optional: Mark as ERROR
            db.table("trends").update({"status": "IGNORED"}).eq("id", trend['id']).execute()

def start_scheduler():
    scheduler.add_job(run_hunter_job, 'interval', hours=6) # Run every 6 hours
    scheduler.add_job(run_processing_loop, 'interval', minutes=1) # Run every minute to check queue
    scheduler.start()
    print("🚀 [Scheduler] Started background jobs.")
