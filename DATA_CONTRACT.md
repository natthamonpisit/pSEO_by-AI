# CompareX Agent Data Contract (v1)

This doc defines the shared data contract for agents and the minimum payloads that are persisted to Supabase.
All agents should output stable, predictable JSON with explicit source links and confidence.

**Core Agent Envelope (optional but recommended)**
```json
{
  "entity_type": "trend|product|article",
  "entity_id": "uuid-or-external-id",
  "status": "NEW|ENRICHING|READY|ADDED|DRAFT|REVIEW|PUBLISHED",
  "payload": {"...": "..."},
  "sources": ["https://example.com"],
  "confidence": 0.0,
  "agent": "RESEARCHER|SPEC|EDITOR|DESIGNER",
  "generated_at": "2026-02-03T12:00:00Z"
}
```

**1) Researcher Output -> `trends`**
- Purpose: store candidate products discovered from news/trends.
- Table: `public.trends`

**Payload (minimum)**
```json
{
  "product_name": "Xiaomi 15 Pro",
  "category_slug": "mobile-phones",
  "news_headline": "Xiaomi announces 15 Pro with new camera",
  "reason": "New flagship launch with major camera upgrade",
  "launch_date": "2026-02-01T00:00:00Z",
  "status": "NEW"
}
```

**2) Spec Finder Output -> `trends` enrichment**
- Purpose: enrich trend item with specs and review snippets before creating product.
- Table: `public.trends` columns: `suggested_specs`, `suggested_price`, `status`

**Payload for `suggested_specs`**
```json
{
  "specs": {
    "Screen": "6.7\" OLED",
    "Processor": "Snapdragon 8 Gen 4",
    "Battery": "5200mAh"
  },
  "pros": ["Bright display", "Great battery"],
  "cons": ["No charger"],
  "review_snippets": [
    {"source": "techsite", "quote": "Best battery life", "sentiment": "positive"}
  ],
  "source_urls": [
    "https://example.com/specs",
    "https://example.com/review"
  ],
  "confidence": 0.78
}
```

**3) Product Sources -> `product_sources`**
- Purpose: retain canonical sources for specs/reviews/news.

**Payload**
```json
{
  "product_id": "uuid",
  "url": "https://example.com/specs",
  "source_type": "SPEC",
  "confidence": 0.85,
  "notes": "Official specs page"
}
```

**4) Product Reviews -> `product_reviews`**
- Purpose: store distilled review info used by editor.

**Payload**
```json
{
  "product_id": "uuid",
  "source": "GSMArena",
  "rating": 4.5,
  "summary": "Great camera and battery, average charging speed",
  "sentiment": "positive",
  "url": "https://example.com/review"
}
```

**5) Editor Output -> `article_drafts`**
- Purpose: store raw article drafts.

**Payload**
```json
{
  "product_id": "uuid",
  "language": "TH",
  "title": "Xiaomi 15 Pro รีวิว: คุ้มไหมสำหรับสายถ่ายรูป",
  "body": "...full article...",
  "status": "DRAFT",
  "metadata": {
    "focus": ["camera", "battery"],
    "audience": "mobile photographers"
  }
}
```

**6) Blog Designer Output -> `article_layouts`**
- Purpose: store layout decision + images to render.

**Payload**
```json
{
  "draft_id": "uuid",
  "layout_json": {
    "sections": [
      {"type": "hero", "ref": "intro"},
      {"type": "spec_table", "ref": "specs"},
      {"type": "gallery", "ref": "camera_samples"}
    ]
  },
  "hero_image": "https://example.com/hero.jpg",
  "gallery": [
    "https://example.com/1.jpg",
    "https://example.com/2.jpg"
  ]
}
```

**Status Flow (recommended)**
- `trends`: `NEW` -> `ENRICHING` -> `READY_TO_ADD` -> `ADDED` or `IGNORED`
- `article_drafts`: `DRAFT` -> `REVIEW` -> `READY` -> `PUBLISHED`

**Flow Example (end-to-end)**
1. Researcher inserts into `trends` with `status=NEW`.
2. Spec Finder updates trend. Details: set `status=ENRICHING` (atomic update), fill `suggested_specs` and `suggested_price`, then set `status=READY_TO_ADD`.
3. Product creation service converts trend -> product. Details: insert into `products`, insert sources into `product_sources`, insert reviews into `product_reviews`, then update `trends.status=ADDED`.
4. Editor generates article. Details: insert into `article_drafts` with `status=DRAFT`.
5. Blog Designer generates layout. Details: insert into `article_layouts` linked by `draft_id`.
6. Publisher marks `article_drafts.status=PUBLISHED`.
