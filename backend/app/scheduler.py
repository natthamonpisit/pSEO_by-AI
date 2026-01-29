from apscheduler.schedulers.asyncio import AsyncIOScheduler
from app.agents import hunter, clerk, analyst, editor
from app.database import get_db
from app.logger import sys_logger
import asyncio

scheduler = AsyncIOScheduler()

async def run_hunter_job():
    sys_logger.log("INFO", "[Scheduler] Running Hunter Job...")
    try:
        await hunter.get_daily_trends(category="Technology")
    except Exception as e:
        sys_logger.log("ERROR", f"[Hunter] Job Failed: {e}")

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
    # sys_logger.log("INFO", "[Scheduler] Running Processing Loop...") # Too noisy for every minute
    db = get_db()
    
    # 1. Fetch NEW trends
    try:
        trends_res = db.table("trends").select("*").eq("status", "NEW").limit(1).execute()
        trends = trends_res.data
    except Exception as e:
        # sys_logger.log("ERROR", f"Scheduler DB Error: {e}") # Too noisy if DB is temporarily down
        return

    if not trends:
        # sys_logger.log("INFO", "[Scheduler] No new trends to process.")
        return

    for trend in trends:
        sys_logger.log("INFO", f"[Scheduler] Processing: {trend['product_name']}")
        
        try:
            # 2. Clerk: Ensure product exists
            product_a = await clerk.enrich_product_specs(trend['product_name'], trend['category_slug'])
            
            # 3. Analyst: Find Competitor
            existing_a = db.table("products").select("id, has_content").eq("name", product_a.name).execute().data
            if existing_a:
                p1_id = existing_a[0]['id']
                if existing_a[0].get('has_content', False):
                     sys_logger.log("WARNING", f"[Scheduler] Skipping {product_a.name} (Content already exists)")
                     db.table("trends").update({"status": "DUPLICATE"}).eq("id", trend['id']).execute()
                     continue
            else:
                # Save Product A
                p1_payload = {
                    "name": product_a.name,
                    "brand": product_a.brand,
                    "category_slug": trend['category_slug'], 
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
                sys_logger.log("ERROR", f"Analyst Error: {match_res['error']}")
                continue

            # 5. Editor Generate
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
                "winner_id": None, 
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
            
            if comparison.winnerId:
                 if comparison.winnerId == p1_data['name']:
                     comp_payload["winner_id"] = p1_id
                 elif comparison.winnerId == p2_data['name']:
                     comp_payload["winner_id"] = p2_data['id']

            db.table("comparisons").insert(comp_payload).execute()
            
            # 7. Update Trend Status AND Product Flag
            db.table("trends").update({"status": "ADDED"}).eq("id", trend['id']).execute()
            db.table("products").update({"has_content": True}).eq("id", p1_id).execute()
            sys_logger.log("SUCCESS", f"[Scheduler] Processed {trend['product_name']} complete!")
            
        except Exception as e:
            sys_logger.log("ERROR", f"[Scheduler] Failed to process {trend['product_name']}: {e}")
            db.table("trends").update({"status": "IGNORED"}).eq("id", trend['id']).execute()

def start_scheduler():
    scheduler.add_job(run_hunter_job, 'interval', hours=6) 
    scheduler.add_job(run_processing_loop, 'interval', minutes=1)
    scheduler.start()
    sys_logger.log("SUCCESS", "[Scheduler] Started background jobs.")
