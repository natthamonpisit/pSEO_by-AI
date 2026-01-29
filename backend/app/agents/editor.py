from .core import client, MODEL_NAME
from google.genai.types import GenerateContentConfig
from pydantic import BaseModel
from typing import List, Dict, Any
import json
from datetime import datetime

class ComparisonResult(BaseModel):
    id: str
    productAId: str
    productBId: str
    generatedAt: str
    language: str
    title: str
    intro: str
    summaryA: str
    summaryB: str
    winnerId: str
    verdict: str
    scoreA: float
    scoreB: float
    prosA: List[str]
    consA: List[str]
    prosB: List[str]
    consB: List[str]
    specComparison: List[Dict[str, str]]
    faqs: List[Dict[str, str]]

async def generate_comparison(p1: Dict[str, Any], p2: Dict[str, Any], focus_fields: List[str], tone: str, language: str) -> ComparisonResult:
    
    prompt = f"""
    Role: You are a Trusted Tech Curator and SEO Specialist.
    Task: Compare {p1.get('name')} vs {p2.get('name')}.
    Language: {"THAI" if language == 'TH' else "ENGLISH"}
    
    Input Data:
    [Product A] {p1.get('name')}: {json.dumps(p1.get('specs'))} (Price: {p1.get('price')})
    [Product B] {p2.get('name')}: {json.dumps(p2.get('specs'))} (Price: {p2.get('price')})
    
    Instructions:
    - Compare line-by-line using focus fields: {', '.join(focus_fields)}
    - Prioritize PRICE-TO-PERFORMANCE.
    - Output STRICT JSON with these keys: title, intro, summaryA, summaryB, winnerId, verdict, scoreA, scoreB, prosA, consA, prosB, consB, specComparison (list of dicts with keys: field, valueA, valueB, winner (A or B or Tie)), faqs.
    - KEEP KEYS IN ENGLISH. VALUES IN {language}.

    Specific Content Guidance:
    - [Intro]: Generate a 2-3 sentence "Hook" that explains why people compare these two products. Mention their key target audience or main difference immediately to grab attention. Make it feel like a human expert starting a conversation. Do not just list specs here.
    - [SummaryA & SummaryB]: Generate a detailed 2-paragraph summary for EACH product explaining its key positioning, target audience, and standout features. This helps the reader get to know the contenders before the fight.
    """
    
    try:
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=prompt,
            config=GenerateContentConfig(response_mime_type="application/json")
        )
        
        print(f"DEBUG Editor Response: {response.text}")
        data = json.loads(response.text)
        if isinstance(data, list):
            data = data[0]
        
        return ComparisonResult(
            id=f"{p1.get('id')}-vs-{p2.get('id')}",
            productAId=str(p1.get('id')),
            productBId=str(p2.get('id')),
            generatedAt=datetime.now().isoformat(),
            language=language,
            **data
        )

    except Exception as e:
        print(f"Editor Error: {e}")
        # Return fallback error object (simplified)
        raise e
