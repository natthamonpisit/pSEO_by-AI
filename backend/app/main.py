from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv

from .agents import hunter, clerk, editor, analyst
from .scheduler import start_scheduler

load_dotenv()

app = FastAPI(title="CompareX Brain API")

# Allow Frontend access (Vercel)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # TODO: Restrict to Vercel domain in generic prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    start_scheduler()

@app.get("/")
def read_root():
    return {"status": "online", "service": "CompareX Brain"}

# --- HUNTER ---
@app.get("/api/hunter/trends")
async def get_trends(category: str):
    return await hunter.get_daily_trends(category)

@app.get("/api/hunter/competitors")
async def get_competitors(product_name: str):
    return await hunter.discover_competitors(product_name)

# --- CLERK ---
class EnrichRequest(BaseModel):
    product_name: str
    category: str
    required_fields: List[str] = []
    language: str = "TH"

@app.post("/api/clerk/enrich")
async def enrich_product(req: EnrichRequest):
    return await clerk.enrich_product_specs(
        req.product_name, req.category, req.required_fields, req.language
    )

@app.get("/api/clerk/template")
async def get_spec_template(category: str):
    return await clerk.generate_spec_template(category)

@app.get("/api/products")
async def list_products():
    """List all verified products in the database."""
    response = clerk.get_db().table("products").select("*").order("created_at", desc=True).limit(20).execute()
    return response.data

# --- ANALYST ---
@app.get("/api/analyst/match/{product_id}")
async def match_competitor(product_id: str):
    """
    Triggers the 'Smart Loop':
    Finds best competitor. Scrapes it if missing. Returns pair.
    """
    return await analyst.find_best_match(product_id)

# --- EDITOR ---
class CompareRequest(BaseModel):
    p1: Dict[str, Any]
    p2: Dict[str, Any]
    focus_fields: List[str]
    tone: str = "Professional"
    language: str = "TH"

@app.post("/api/editor/compare")
async def compare_products(req: CompareRequest):
    try:
        return await editor.generate_comparison(
            req.p1, req.p2, req.focus_fields, req.tone, req.language
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/comparisons/{product_id}")
async def get_comparison(product_id: str):
    try:
        # 1. Check if comparison exists for this product
        response = clerk.get_db().table("comparisons")\
            .select("*")\
            .eq("product_a_id", product_id)\
            .execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Comparison not found")
            
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
