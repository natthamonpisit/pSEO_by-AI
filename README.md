# CompareX: The pSEO Engine (Automation Factory)

**Project Owner:** P'Ook  
**Lead Developer:** Jay (Full-stack AI Engineer)  
**Version:** 1.4 (Monetization Automation)

---

## 1. The Core Concept (Business Logic)
เราไม่ได้ทำเว็บรีวิวธรรมดา แต่เรากำลังสร้าง **"โรงงานผลิตหน้าเว็บ (Page Factory)"** เพื่อดักจับ Long-tail Keywords ผ่านกลยุทธ์ **Programmatic SEO (pSEO)**

*   **Goal:** สร้างหน้าเปรียบเทียบสินค้า (A vs B) จำนวนมหาศาลโดยอัตโนมัติ (เช่น 50 สินค้า = 2,450 หน้า)
*   **The Trap:** Google เกลียดหน้าเว็บขยะ (Spam/Duplicate Content)
*   **The Solution:** ใช้ **AI Agents** สร้าง "Unique Opinion" และ "Analysis" ในทุกหน้า เพื่อให้ Google มองว่าเป็น High Quality Content

---

## 2. Architecture: "Showroom" vs "Factory"

### 🏢 Front-office (The Showroom)
*   **Role:** หน้าร้านสำหรับให้คนและ Google Bot เข้ามาดู
*   **Tech:** Next.js (Hosting on Vercel)

### 🏭 Back-office (The Factory)
*   **Role:** โรงงานผลิตเนื้อหา ทำงานเบื้องหลัง (Background Worker)
*   **Tech:** Python/Node.js Script (Hosting on Railway) + Gemini AI
*   **Database:** Supabase (เก็บ Product Specs และ Generated Content)

---

## 3. The New AI Workflow & Toolbelts

ทีมงาน AI 4 ตัว จะแบ่งหน้าที่และเครื่องมือดังนี้:

### 🔭 Phase 1: Ingestion (หาของเข้าโกดัง)

**1. Agent 1: The Hunter (นักล่า)**
*   **Role:** Trend Spotter & Competitor Discovery
*   **Task:** ตื่นเช้ามาหา "keyword สินค้ามาใหม่" และจับคู่ "สินค้าคู่แข่ง"
*   **🧰 Toolbelt & APIs:**
    *   **Method A (Free/Tier B):** Python Library `duckduckgo_search`
        *   *Command:* `ddgs.news("smartphone release 2024", max_results=5)`
    *   **Method B (Paid/Tier A):** Gemini `googleSearch` Tool
        *   *Prompt:* "Find trending tech products launched this week."
    *   **Output:** List of Strings (Product Names).

**2. Agent 2: The Clerk (เสมียนข้อมูล)**
*   **Role:** Data Entry & Enrichment (Plus Monetization)
*   **Task:** วิ่งไปหน้าเว็บ Official หรือ GSMArena เพื่อดึง Spec มาลง Database + **สร้างลิงค์ทำเงิน**
*   **🧰 Toolbelt & APIs:**
    *   **Primary Tool (Python Scraper):**
        *   `duckduckgo_search`: เพื่อหา URL ของหน้า Spec Sheet (เช่น gsmarena.com/iphone16...)
        *   `requests` + `BeautifulSoup4`: เพื่อเจาะ HTML Table และดูดข้อมูล `<tr><td>`
    *   **💰 Monetization Module (New):**
        *   **Strategy 1 (Search Link):** สร้าง URL Pattern `shopee.co.th/search?keyword={Product_Name}&utm_source={POOK_ID}`
        *   **Strategy 2 (Deep Link API):** (Future) ยิง API ไปที่ Involve Asia/Ecomobi เพื่อแปลง URL ร้านค้าให้เป็น Affiliate Link
    *   **Cost Management:** ใช้ Python ฟรีเป็นหลัก ถ้าพลาดค่อยจ่ายเงินใช้ AI

### ⚙️ Phase 2: Production (สายพานการผลิต)

**3. Agent 3: The Analyst (นักวิเคราะห์)**
*   **Role:** Logic & Scoring (The Brain)
*   **Task:** เปรียบเทียบสินค้า A vs B ทีละบรรทัด แล้วให้คะแนน
*   **🧰 Toolbelt & APIs:**
    *   **Engine:** Gemini 1.5 Pro / Gemini 3 Flash
    *   **Configuration:**
        *   `temperature: 0.1` (เน้นตรรกะ ไม่เอาความคิดสร้างสรรค์ ห้ามมั่ว)
        *   `responseMimeType: "application/json"` (บังคับออก JSON เท่านั้น)
    *   **Input:** JSON Spec จาก Agent 2
    *   **Output:** JSON Score & Winner (e.g., `{ "camera_winner": "A", "score": 9/10 }`)

**4. Agent 4: The Editor (บรรณาธิการ)**
*   **Role:** Creative Writer (The Voice)
*   **Task:** แปลงผลคะแนน JSON ให้เป็นบทความภาษาคน ที่น่าอ่านและติด SEO
*   **🧰 Toolbelt & APIs:**
    *   **Engine:** Gemini 1.5 Flash (เร็วและถูก) หรือ Pro (ถ้าต้องการภาษาที่สละสลวย)
    *   **Configuration:**
        *   `temperature: 0.7` (ใส่ความ Creative ได้ เพื่อให้ภาษาไม่ดูเป็นหุ่นยนต์)
        *   `systemInstruction`: "You are a tech editor with a professional yet friendly tone."
    *   **Key Technique:** Prompt Engineering เพื่อใส่ "Brand Voice" ลงไป

---

## 4. Python Worker Script (The Engine Room)

สคริปต์นี้คือหัวใจของ **Agent 2 (The Clerk)** ที่รันบน Railway:

```python
# app.py (Deploy this to Railway)
from flask import Flask, request, jsonify
from duckduckgo_search import DDGS
import requests
from bs4 import BeautifulSoup

app = Flask(__name__)

# --- Agent 2 Tool: URL Finder ---
def search_product_spec_url(product_name):
    """ใช้ DuckDuckGo (Free) หา URL ของหน้า Spec"""
    # Trick: ระบุ site:gsmarena.com เพื่อความแม่นยำของ Format ตาราง
    query = f"{product_name} specs site:gsmarena.com" 
    try:
        with DDGS() as ddgs:
            results = list(ddgs.text(query, max_results=1))
            if results:
                return results[0]['href']
    except Exception as e:
        print(f"Search Error: {e}")
    return None

# --- Agent 2 Tool: HTML Extractor ---
def scrape_gsmarena(url):
    """ใช้ BeautifulSoup แกะ Table Specs ออกมา"""
    # Trick: ต้องใส่ User-Agent เพื่อหลอกว่าเราเป็น Browser คนจริงๆ ไม่ใช่บอท
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)...'}
    try:
        response = requests.get(url, headers=headers, timeout=10)
        soup = BeautifulSoup(response.content, 'html.parser')
        specs = {}
        # Logic การแกะตาราง (อาจต้องปรับตามเว็บเป้าหมาย)
        for table in soup.find_all('table'):
            for row in table.find_all('tr'):
                cols = row.find_all('td')
                if len(cols) > 1:
                    key = cols[0].get_text(strip=True)
                    val = cols[1].get_text(strip=True)
                    specs[key] = val
        return specs
    except Exception as e:
        return None

@app.route('/api/enrich', methods=['GET'])
def enrich_product():
    product_name = request.args.get('name')
    
    # Step 1: Find URL
    url = search_product_spec_url(product_name)
    if not url: return jsonify({"status": "failed", "reason": "URL not found"}), 404
        
    # Step 2: Scrape
    specs = scrape_gsmarena(url)
    if not specs: return jsonify({"status": "failed", "reason": "Scrape error"}), 404
        
    return jsonify({
        "status": "success",
        "source": url,
        "specs": specs
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
```

---

## 5. Database Schema (Supabase/PostgreSQL)

เจออกแบบเป็น **Hybrid Schema** คือใช้ SQL จัดโครงสร้างหลัก แต่ใช้ `JSONB` เก็บข้อมูลยืดหยุ่น เพื่อไม่ต้องเปลี่ยนไปใช้ NoSQL ให้วุ่นวายครับ

### Table: `categories`
ตารางนี้คุมโครงสร้างของสินค้าแต่ละประเภท
| Field Name | Type | Description |
| :--- | :--- | :--- |
| `id` | `uuid` (PK) | Unique ID |
| `name` | `text` | e.g., "Smartphone", "EV Car" |
| `slug` | `text` (Unique) | e.g., "smartphone" (for URL) |
| `settings` | `jsonb` | **[Object]** เก็บ Config ของ Agent 3 & 4<br>`{ "comparisonFields": ["Camera", "Battery"], "tone": "Excited" }` |
| `created_at` | `timestamptz` | - |

### Table: `products`
ตารางเก็บสินค้าทั้งหมด (Agent 2 เอาของมาใส่ที่นี่)
| Field Name | Type | Description |
| :--- | :--- | :--- |
| `id` | `uuid` (PK) | Unique ID |
| `name` | `text` | Product Name (e.g., "iPhone 16 Pro") |
| `slug` | `text` (Unique) | SEO Friendly URL (e.g., "iphone-16-pro") |
| `category_slug`| `text` (FK) | Links to `categories.slug` |
| `brand` | `text` | Brand name for filtering |
| `price` | `numeric` | Current price (USD) |
| `specs` | `jsonb` | **[Object]** เก็บ Spec แบบยืดหยุ่น <br>`{ "Screen": "6.1 OLED", "Ram": "8GB" }` |
| `metadata` | `jsonb` | **[Object]** เก็บรูปและ SEO Tags <br>`{ "images": [...], "tags": ["Flagship", "5G"] }` |
| `affiliate_link`| `text` | Link ทำเงิน |

### Table: `comparisons`
ตารางเก็บหน้าเว็บที่ Generate แล้ว (Agent 3 & 4 เอาผลลัพธ์มาใส่ที่นี่)
| Field Name | Type | Description |
| :--- | :--- | :--- |
| `id` | `uuid` (PK) | Unique ID |
| `slug` | `text` (Unique) | e.g., "iphone-16-pro-vs-s24" (The Money Page URL) |
| `product_a_id` | `uuid` (FK) | Reference to Product A |
| `product_b_id` | `uuid` (FK) | Reference to Product B |
| `seo_content` | `jsonb` | **[Object]** เนื้อหาบทความจาก Agent 4 <br>`{ "title": "...", "intro": "...", "verdict": "..." }` |
| `analysis_data`| `jsonb` | **[Object]** ผลคะแนนดิบจาก Agent 3 <br>`{ "scoreA": 9, "scoreB": 8, "table": [...] }` |
| `status` | `text` | 'DRAFT', 'PUBLISHED', 'INDEXED' |
| `updated_at` | `timestamptz` | เพื่อให้ Google รู้ว่าเนื้อหา Fresh |

---

## 6. Monetization Automation

วิธีทำให้ Affiliate Link เป็นอัตโนมัติ โดยไม่ต้องมานั่ง Copy-Paste เอง:

1.  **Search Link Pattern (The Reliable Method):**
    *   Agent 2 จะสร้าง Link อัตโนมัติไปที่หน้า Search Result ของ Shopee
    *   **Format:** `https://shopee.co.th/search?keyword={Product_Name}&utm_source={POOK_AFF_ID}`
    *   **ข้อดี:** ง่าย, ไม่ต้องใช้ API, ลิงค์ไม่มีวันเสีย (เพราะเป็นหน้า Search)
    *   **ข้อเสีย:** User ต้องกดเลือกสินค้าอีกที

2.  **API Deep Link (The Advanced Method):**
    *   *Step 1:* ใช้ Agent 2 หา URL ร้าน Official (เช่น `shopee.co.th/apple_flagship_store/iphone16`)
    *   *Step 2:* ส่ง URL นั้นไปที่ API ของ **Involve Asia** หรือ **Ecomobi**
    *   *Step 3:* API จะคืนค่ากลับมาเป็น `https://invol.co/cl12345...` (ลิงค์ที่ติด Tracking แล้ว)
    *   *Step 4:* บันทึกลง Supabase field `affiliate_link`

*Note: เอกสารนี้เขียนโดย Jay เพื่อส่งต่อให้ทีม Dev รุ่นถัดไปรักษามาตรฐาน Codebase นี้ไว้*
