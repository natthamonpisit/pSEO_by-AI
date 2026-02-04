from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
import time
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv

from .agents import hunter, clerk, editor, analyst
from .scheduler import start_scheduler

load_dotenv()

app = FastAPI(title="CompareX Brain API")

# Allow Frontend access (Vercel + Local Dev)
import os
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
allowed_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    FRONTEND_URL,  # Production Vercel URL from env
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from .logger import sys_logger

# Logging Middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()

    # Process request
    response = await call_next(request)

    # Calculate duration
    duration = time.time() - start_time

    # Log request
    log_message = f"{request.method} {request.url.path} - {response.status_code} ({duration:.3f}s)"

    if response.status_code >= 400:
        sys_logger.log("WARNING", log_message)
    elif duration > 5.0:  # Slow request
        sys_logger.log("WARNING", f"Slow request: {log_message}")

    return response

@app.on_event("startup")
def startup_event():
    sys_logger.log("INFO", "🚀 System Started")
    start_scheduler()

@app.get("/")
def read_root():
    return {"status": "online", "service": "CompareX Brain"}

@app.get("/health")
def health_check():
    """Health check endpoint for monitoring and load balancers"""
    import time
    try:
        # Test database connection
        clerk.get_db().table("categories").select("count", count="exact").limit(1).execute()
        db_status = "healthy"
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"

    return {
        "status": "ok",
        "timestamp": time.time(),
        "service": "CompareX Brain API",
        "database": db_status,
        "version": "1.0.0"
    }

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

    class Config:
        str_min_length = 1
        str_max_length = 500

from pydantic import field_validator

class EnrichRequestValidated(BaseModel):
    product_name: str
    category: str
    required_fields: List[str] = []
    language: str = "TH"

    @field_validator('product_name')
    @classmethod
    def validate_product_name(cls, v):
        if not v or len(v.strip()) == 0:
            raise ValueError('Product name cannot be empty')
        if len(v) > 200:
            raise ValueError('Product name too long (max 200 characters)')
        return v.strip()

    @field_validator('category')
    @classmethod
    def validate_category(cls, v):
        if not v or len(v.strip()) == 0:
            raise ValueError('Category cannot be empty')
        return v.strip()

@app.post("/api/clerk/enrich")
async def enrich_product(req: EnrichRequestValidated):
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

class ProductSourceCreate(BaseModel):
    product_id: str
    url: str
    source_type: str = "OTHER"
    confidence: float = 0.0
    notes: Optional[str] = None

class ProductReviewCreate(BaseModel):
    product_id: str
    source: Optional[str] = None
    rating: Optional[float] = None
    summary: Optional[str] = None
    sentiment: str = "neutral"
    url: Optional[str] = None

class ArticleDraftCreate(BaseModel):
    product_id: Optional[str] = None
    language: str = "TH"
    title: str
    body: str
    status: str = "DRAFT"
    metadata: Dict[str, Any] = Field(default_factory=dict)

class ArticleLayoutCreate(BaseModel):
    draft_id: str
    layout_json: Dict[str, Any]
    hero_image: Optional[str] = None
    gallery: List[str] = Field(default_factory=list)

@app.post("/api/editor/compare")
async def compare_products(req: CompareRequest):
    try:
        return await editor.generate_comparison(
            req.p1, req.p2, req.focus_fields, req.tone, req.language
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/products/sources")
async def create_product_source(req: ProductSourceCreate):
    try:
        payload = req.model_dump()
        response = clerk.get_db().table("product_sources").insert(payload).execute()
        return response.data[0] if response.data else {}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/products/reviews")
async def create_product_review(req: ProductReviewCreate):
    try:
        payload = req.model_dump()
        response = clerk.get_db().table("product_reviews").insert(payload).execute()
        return response.data[0] if response.data else {}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/articles/drafts")
async def create_article_draft(req: ArticleDraftCreate):
    try:
        payload = req.model_dump()
        response = clerk.get_db().table("article_drafts").insert(payload).execute()
        return response.data[0] if response.data else {}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/articles/drafts")
async def list_article_drafts(status: Optional[str] = None):
    try:
        query = clerk.get_db().table("article_drafts").select("*").order("created_at", desc=True)
        if status:
            query = query.eq("status", status)
        response = query.limit(20).execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/articles/drafts/{draft_id}")
async def get_article_draft(draft_id: str):
    try:
        response = clerk.get_db().table("article_drafts").select("*").eq("id", draft_id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Draft not found")
        return response.data[0]
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/articles/layouts")
async def create_article_layout(req: ArticleLayoutCreate):
    try:
        payload = req.model_dump()
        response = clerk.get_db().table("article_layouts").insert(payload).execute()
        return response.data[0] if response.data else {}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/articles/layouts/{draft_id}")
async def get_article_layout(draft_id: str):
    try:
        response = clerk.get_db().table("article_layouts").select("*").eq("draft_id", draft_id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Layout not found")
        return response.data[0]
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/comparisons")
async def list_comparisons(limit: int = 10):
    try:
        response = clerk.get_db().table("comparisons")\
            .select("*")\
            .order("created_at", desc=True)\
            .limit(limit)\
            .execute()
        return response.data
    except Exception as e:
        sys_logger.log("ERROR", f"Failed to list comparisons: {e}")
        return []

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

        comp_data = response.data[0]

        # 2. Fetch Product Details (Images, etc.)
        try:
            p_ids = [comp_data['product_a_id'], comp_data['product_b_id']]
            prods_res = clerk.get_db().table("products").select("id, name, image_url").in_("id", p_ids).execute()
            
            # Map by ID
            prod_map = {p['id']: p for p in prods_res.data}
            
            # Attach to response
            comp_data['product_a_data'] = prod_map.get(comp_data['product_a_id'], {})
            comp_data['product_b_data'] = prod_map.get(comp_data['product_b_id'], {})
        
        except Exception as e:
            sys_logger.log("WARNING", f"Failed to fetch product images: {e}")
            # Non-critical, continue without images
            comp_data['product_a_data'] = {}
            comp_data['product_b_data'] = {}

        return comp_data

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- SYSTEM / DEBUG ---
from .logger import sys_logger
from .scheduler import run_hunter_job, run_processing_loop

@app.get("/api/system/logs")
def get_logs():
    return sys_logger.get_logs()

@app.get("/api/system/trigger/{job_name}")
async def trigger_job(job_name: str):
    sys_logger.log("INFO", f"👆 Manual Trigger: {job_name}")
    try:
        if job_name == "hunter":
            await run_hunter_job()
        elif job_name == "loop":
            await run_processing_loop()
        else:
            raise HTTPException(status_code=400, detail="Unknown job")
        
        return {"status": "triggered", "job": job_name}
    except Exception as e:
        sys_logger.log("ERROR", f"Manual Trigger Failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
