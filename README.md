# CompareX: The pSEO Engine (Automation Factory)

**Project Owner:** P'Ook  
**Lead Developer:** Jay (Full-stack AI Engineer)  
**Version:** 1.5 (Refactored & Curator Mode)

---

## 1. The Core Concept (Business Logic)
เราไม่ได้ทำเว็บรีวิวธรรมดา แต่เรากำลังสร้าง **"โรงงานผลิตหน้าเว็บ (Page Factory)"** เพื่อดักจับ Long-tail Keywords ผ่านกลยุทธ์ **Programmatic SEO (pSEO)**

*   **Goal:** สร้างหน้าเปรียบเทียบสินค้า (A vs B) จำนวนมหาศาลโดยอัตโนมัติ (เช่น 50 สินค้า = 2,450 หน้า)
*   **The Trap:** Google เกลียดหน้าเว็บขยะ (Spam/Duplicate Content)
*   **The Solution:** ใช้ **AI Agents** สร้าง "Unique Opinion" และ "Analysis" ในทุกหน้า เพื่อให้ Google มองว่าเป็น High Quality Content

---

## 2. Code Architecture (Refactored)

เพื่อรองรับการขยายตัวในอนาคต เจได้ระเบิดไฟล์ `geminiService.ts` เดิม ออกเป็น Module ย่อยตามหน้าที่ (Separation of Concerns):

```
services/gemini/
├── core.ts              # Config กลาง (API Key, Model Name)
├── agents/
│   ├── hunter.ts        # Agent 1: ค้นหาเทรนด์และคู่แข่ง
│   ├── clerk.ts         # Agent 2: หา Spec และทำ Affiliate Link
│   └── editor.ts        # Agent 3 & 4: วิเคราะห์และเขียนบทความ
└── index.ts             # Facade (ทางเข้าหลัก) ให้ Frontend เรียกใช้ง่ายๆ
```

---

## 3. The New AI Workflow & Toolbelts

ทีมงาน AI 4 ตัว จะแบ่งหน้าที่และเครื่องมือดังนี้:

### 🔭 Phase 1: Ingestion (หาของเข้าโกดัง)

**1. Agent 1: The Hunter (นักล่า)**
*   **Role:** Trend Spotter & Competitor Discovery
*   **Task:** ตื่นเช้ามาหา "keyword สินค้ามาใหม่" และจับคู่ "สินค้าคู่แข่ง"
*   **Toolbelt:** Google Search Grounding

**2. Agent 2: The Clerk (เสมียนข้อมูล)**
*   **Role:** Data Entry & Monetization
*   **Task:** หา Spec สินค้า และ **สร้างลิงค์ทำเงิน (Affiliate Link)**
*   **Toolbelt:** Python Scraper (Simulation) + Google Search
*   **Monetization Strategy:** สร้าง Search Link อัตโนมัติ (`shopee.co.th/search?keyword=...`) เพื่อความเสถียรและแม่นยำ

### ⚙️ Phase 2: Production (สายพานการผลิต)

**3. Agent 3: The Analyst (นักวิเคราะห์)**
*   **Role:** Logic & Scoring (The Brain)
*   **Task:** เปรียบเทียบสินค้า A vs B ทีละบรรทัด แล้วให้คะแนน โดยเน้น **Price-to-Performance** (ไม่ใช่แค่ Spec แรงกว่าแล้วชนะ)

**4. Agent 4: The Editor (บรรณาธิการ)**
*   **Role:** Trusted Tech Curator (The Voice)
*   **Tone:** "Sophisticated but Grounded" (เหมือนเพื่อนที่มีรสนิยมดี แนะนำแกมเล่าเรื่อง)
*   **Task:** แปลงผลคะแนนเป็นบทความ SEO
*   **Key Instruction:** 
    *   ❌ ห้าม Hard Sell (เลิกใช้คำว่า "Buy Now", "Magic", "Unbelievable")
    *   ✅ เน้น Experience (ใช้คำว่า "Effortless", "Refined", "Worthwhile")
    *   ✅ เขียนสั้น กระชับ แบบ Apple แต่จริงใจแบบเพื่อน

---

## 4. Backend Target Architecture (Python Worker)

ใน Production จริง เราจะย้าย Logic การหาข้อมูล (Agent 1 & 2) ไปรันบน Server แยก (เช่น Railway) เพื่อประหยัด Cost และเพิ่มความเร็ว

```python
# ตัวอย่าง Logic ของ Python Worker (Future Implementation)
def enrich_product(name):
    # 1. Search for Spec URL (GSMArena/Official)
    url = search_google(f"{name} specs")
    
    # 2. Scrape HTML Table
    specs = scrape_table(url)
    
    # 3. Generate Affiliate Link
    aff_link = generate_shopee_link(name)
    
    return { "specs": specs, "affiliate_link": aff_link }
```

---

## 5. Database Schema (Supabase)

เราใช้ Hybrid Schema (SQL + JSONB) เพื่อความยืดหยุ่น:

*   **`products` Table:** เก็บ Spec และ Affiliate Link
*   **`categories` Table:** เก็บ Config ของแต่ละหมวด (เช่น มือถือต้องเทียบกล้อง, รถ EV ต้องเทียบระยะทาง)
*   **`comparisons` Table:** เก็บ Content ที่ AI เขียนเสร็จแล้ว พร้อมสำหรับทำ SEO

---

*Note: เอกสารนี้เขียนโดย Jay เพื่อส่งต่อให้ทีม Dev รุ่นถัดไปรักษามาตรฐาน Codebase นี้ไว้*
