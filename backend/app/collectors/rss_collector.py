import datetime
import re
from typing import Dict, List

import feedparser

from app.database import get_db
from app.logger import sys_logger

# Reuse feeds from hunter (single source of truth)
try:
    from app.agents.hunter import RSS_FEEDS
except Exception:
    RSS_FEEDS = {}


def _guess_product_name(title: str) -> str:
    # Heuristic: take left side of separators, strip bracketed tags
    cleaned = re.sub(r"\[[^\]]+\]", "", title).strip()
    for sep in [" - ", " — ", ": ", "| "]:
        if sep in cleaned:
            return cleaned.split(sep)[0].strip()
    return cleaned


def _collect_from_feed(url: str, max_items: int = 5) -> List[Dict[str, str]]:
    items: List[Dict[str, str]] = []
    feed = feedparser.parse(url)
    for entry in feed.entries[:max_items]:
        title = getattr(entry, "title", "").strip()
        link = getattr(entry, "link", "").strip()
        if not title:
            continue
        items.append({
            "product_name": _guess_product_name(title),
            "news_headline": title,
            "source_url": link,
        })
    return items


def collect_trends(category: str) -> int:
    feeds = RSS_FEEDS.get(category, RSS_FEEDS.get("Technology", []))
    if not feeds:
        sys_logger.log("WARNING", f"[Collector] No RSS feeds for category '{category}'")
        return 0

    db = get_db()
    inserted = 0
    now = datetime.datetime.now(datetime.timezone.utc).isoformat()

    for feed_url in feeds:
        try:
            items = _collect_from_feed(feed_url, max_items=5)
            for item in items:
                # Basic de-dupe by headline within category
                existing = db.table("trends")\
                    .select("id")\
                    .eq("news_headline", item["news_headline"])\
                    .eq("category_slug", category.lower().replace(" ", "-"))\
                    .limit(1)\
                    .execute()
                if existing.data:
                    continue

                db.table("trends").insert({
                    "product_name": item["product_name"],
                    "category_slug": category.lower().replace(" ", "-"),
                    "news_headline": item["news_headline"],
                    "reason": "Collected from RSS",
                    "status": "NEW",
                    "found_at": now,
                }).execute()
                inserted += 1
        except Exception as e:
            sys_logger.log("ERROR", f"[Collector] RSS error for {feed_url}: {e}")

    sys_logger.log("INFO", f"[Collector] Inserted {inserted} trends for {category}")
    return inserted


def collect_all_categories() -> int:
    total = 0
    categories = list(RSS_FEEDS.keys()) if RSS_FEEDS else ["Technology"]
    for category in categories:
        total += collect_trends(category)
    return total


if __name__ == "__main__":
    collect_all_categories()
