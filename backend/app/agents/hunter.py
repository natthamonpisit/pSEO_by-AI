from .core import client, MODEL_NAME
from pydantic import BaseModel
from typing import List, Optional
import json
import datetime
import feedparser
from duckduckgo_search import DDGS
from google.genai.types import Tool, GenerateContentConfig, GoogleSearch
# Import Database Connection
from ..database import get_db

class TrendItem(BaseModel):
    id: str
    productName: str
    category: str
    newsHeadline: str
    reason: str
    launchDate: Optional[str] = None
    status: str = "NEW"

class CompetitorItem(BaseModel):
    name: str
    reason: str

# RSS Configuration
RSS_FEEDS = {
    "Technology": [
        "https://feeds.feedburner.com/TechCrunch/",
        "https://www.theverge.com/rss/index.xml",
        "https://www.engadget.com/rss.xml",
        "https://9to5mac.com/feed/",
        "https://www.androidauthority.com/feed/"
    ],
    "Mobile Phones": [
        "https://www.gsmarena.com/rss-news-reviews.php3",
        "https://9to5mac.com/feed/",
        "https://www.androidcentral.com/feed"
    ]
    # Add more categories as needed
}

def fetch_rss_trends(category: str) -> str:
    """Fetches latest headlines from RSS feeds."""
    print(f"📡 [Hunter] Scanning RSS Feeds for: {category}...")
    feeds = RSS_FEEDS.get(category, RSS_FEEDS.get("Technology", []))
    
    headlines = []
    for url in feeds:
        try:
            feed = feedparser.parse(url)
            feed_title = feed.feed.get('title', 'News')
            for entry in feed.entries[:3]: # Top 3 per feed
                headlines.append(f"- [{feed_title}]: {entry.title} ({entry.link})")
        except Exception as e:
            print(f"⚠️ RSS Error {url}: {e}")
            
    return "\n".join(headlines[:15]) # Limit to top 15 total

def search_duckduckgo(query: str, max_results: int = 5) -> str:
    """Free search using DuckDuckGo"""
    try:
        results = DDGS().text(keywords=query, max_results=max_results)
        return "\n".join([f"- {r['title']}: {r['body']}" for r in results])
    except Exception as e:
        print(f"⚠️ DDG Search Error: {e}")
        return ""

async def get_daily_trends(category: str) -> List[TrendItem]:
    print(f"🦅 [Hunter] Hunting trends for: {category}...")
    
    # 1. RSS FEED (Fastest & Free)
    rss_context = fetch_rss_trends(category)
    
    # 2. HYBRID SEARCH (DuckDuckGo -> Fallback)
    search_query = f"latest new {category} releases trends news {datetime.datetime.now().year}"
    search_context = search_duckduckgo(search_query, max_results=5)
    
    combined_context = f"""
    [RSS News Feeds]:
    {rss_context}
    
    [Web Search Results]:
    {search_context}
    """
    
    tools = []
    response_mode = "primary"

    # If both free sources fail/empty, trigger Paid Search
    if not rss_context and not search_context:
        print("⚠️ All free sources failed. Switching to Google Search Tool (Paid)...")
        response_mode = "fallback"
        tools = [Tool(google_search=GoogleSearch())]
        
    prompt = f"""
    Role: You are a Tech Trend Hunter.
    Task: Find valid product trends for category: "{category}".
    
    {'Context from Free Sources:' if response_mode == 'primary' else ''}
    {combined_context if response_mode == 'primary' else ''}
    
    Instructions:
    - Identify NEW or TRENDING products.
    - Output STRICT JSON Array.
    - Schema: [{{ "productName": "string", "newsHeadline": "string", "reason": "string", "launchDate": "YYYY-MM-DD" }}]
    """
    
    try:
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=prompt,
            config=GenerateContentConfig(
                tools=tools,
                response_mime_type="text/plain" 
            )
        )
        
        # Parse JSON
        text = response.text.replace("```json", "").replace("```", "").strip()
        trends_data = json.loads(text)
        
        results = []
        db = get_db()
        
        for idx, item in enumerate(trends_data):
             trend_obj = TrendItem(
                 id=f"trend-{category}-{idx}",
                 productName=item.get("productName", "Unknown"),
                 category=category,
                 newsHeadline=item.get("newsHeadline", ""),
                 reason=item.get("reason", ""),
                 launchDate=item.get("launchDate"),
                 status="NEW"
             )
             results.append(trend_obj)

             # 💾 SAVE TO DB
             try:
                 db.table("trends").insert({
                     "product_name": trend_obj.productName,
                     "category_slug": category.lower().replace(" ", "-"),
                     "news_headline": trend_obj.newsHeadline,
                     "reason": trend_obj.reason,
                     "status": "NEW",
                     "found_at": datetime.datetime.now().isoformat()
                 }).execute()
             except Exception:
                 pass

        return results

    except Exception as e:
        print(f"Error in Hunter: {e}")
        return []

async def discover_competitors(product_name: str) -> List[CompetitorItem]:
    # Strategy: Try Free Search First -> Fallback to Paid Search
    search_context = search_duckduckgo(f"{product_name} vs competitors alternatives", max_results=5)
    
    tools = []
    if not search_context:
        tools = [Tool(google_search=GoogleSearch())]

    prompt = f"""
    Task: Identify top 3 direct competitors for "{product_name}".
    {'Context: ' + search_context if search_context else ''}
    Output: JSON Array.
    Schema: [{{ "name": "string", "reason": "string" }}]
    """
    
    try:
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=prompt,
            config=GenerateContentConfig(
                tools=tools,
                response_mime_type="text/plain" 
            )
        )
        
        text = response.text.replace("```json", "").replace("```", "").strip()
        data = json.loads(text)
        if isinstance(data, dict) and "competitors" in data:
            data = data['competitors']
        return [CompetitorItem(**c) for c in data]

    except Exception as e:
        print(f"Error in Competitor Discovery: {e}")
        return []
