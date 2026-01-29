# CompareX: The pSEO Engine (Automation Factory)

**Project Owner:** P'Ook  
**Lead Developer:** Jay (Full-stack AI Engineer)  
**Version:** 2.0 (GEO Ready & Hybrid Monetization)

---

## 1. The Core Concept (Business Logic)
เราไม่ได้ทำเว็บรีวิวธรรมดา แต่เรากำลังสร้าง **"โรงงานผลิตหน้าเว็บ (Page Factory)"** เพื่อดักจับ Long-tail Keywords ผ่านกลยุทธ์ **Programmatic SEO (pSEO)**

*   **Goal:** สร้างหน้าเปรียบเทียบสินค้า (A vs B) จำนวนมหาศาลโดยอัตโนมัติ (เช่น 50 สินค้า = 2,450 หน้า)
*   **The Trap:** Google เกลียดหน้าเว็บขยะ (Spam/Duplicate Content)
*   **The Solution:** ใช้ **AI Agents** สร้าง "Unique Opinion" และ "Analysis" ในทุกหน้า เพื่อให้ Google มองว่าเป็น High Quality Content

---

## 2. Code Architecture (Micro-Agent Services)

เพื่อรองรับการขยายตัวในอนาคต เจได้ระเบิดไฟล์ `geminiService.ts` เดิม ออกเป็น Module ย่อยตามหน้าที่ (Separation of Concerns):

```
services/gemini/
├── core.ts              # Config กลาง (API Key, Model Name)
├── agents/
│   ├── hunter.ts        # Agent 1: ค้นหาเทรนด์และคู่แข่ง (Trend Spotter)
│   ├── clerk.ts         # Agent 2: หา Spec และจัดการข้อมูล (Data Entry)
│   └── editor.ts        # Agent 3 & 4: วิเคราะห์และเขียนบทความ (Content Creator)
└── index.ts             # Facade (ทางเข้าหลัก) ให้ Frontend เรียกใช้ง่ายๆ
```

---

## 3. The Monetization Strategy (Hybrid Model) 💰

เราใช้กลยุทธ์การทำเงินแบบผสมผสาน เพื่อให้ได้ Conversion สูงสุดในแต่ละตลาด:

| Market | Strategy | Why? |
| :--- | :--- | :--- |
| **🇹🇭 Thailand** | **Shopee Search Link** | คนไทยชอบซื้อของใน Shopee/Lazada การส่งไปหน้า Search (`shopee.co.th/search?keyword=...`) conversion ดีกว่าส่งไปร้านเดียว (เพราะร้านนั้นของอาจหมด) |
| **🌍 Global** | **Skimlinks (Auto)** | ฝรั่งชอบกดเว็บ Official Brand (เช่น Samsung.com) เราจึงให้ AI หาลิงก์ Official แล้วใช้ Skimlinks JS เปลี่ยนเป็น Affiliate Link อัตโนมัติ (ไม่ต้องไล่สมัครเอง) |

**Code Location:** `services/gemini/core.ts` -> `generateAffiliateLink()`

---

## 4. GEO Strategy (Generative Engine Optimization) 🤖

เพื่อให้เว็บเราติดหน้าแรก Google และถูก AI (Gemini/ChatGPT) นำข้อมูลไปตอบคำถาม เราใช้เทคนิคดังนี้:

### 4.1. JSON-LD Schema (Talking to Robots)
เราฝัง Code ลับที่คนมองไม่เห็น แต่ Robot ชอบอ่าน ไว้ในทุกหน้า:
*   **Type:** `Product` & `FAQPage`
*   **Effect:** ทำให้ Google รู้จักชื่อสินค้า ราคา และ Rating ทันที (มีโอกาสได้ Rich Snippet รูปดาวบนหน้าค้นหา)

### 4.2. FAQ Trap (Voice Search Optimization)
*   **Concept:** คนสมัยนี้ชอบถาม Google ด้วยเสียง (Voice Search) เป็นประโยคยาวๆ
*   **Execution:** เราให้ AI Agent สร้างหัวข้อ Q&A ท้ายบทความเสมอ เช่น *"iPhone 16 แบตอึดกว่า S24 ไหม?"*
*   **Goal:** เพื่อชิงตำแหน่ง **Featured Snippet** (กล่องคำตอบอันดับ 0)

---

## 5. The AI Workflow (4-Agent System)

### 🔭 Phase 1: Ingestion (หาของเข้าโกดัง)

**1. Agent 1: The Hunter (นักล่า)**
*   **Role:** Trend Spotter
*   **Task:** ตื่นเช้ามาหา "keyword สินค้ามาใหม่" และจับคู่ "สินค้าคู่แข่ง"
*   **Toolbelt:** Google Search Grounding

**2. Agent 2: The Clerk (เสมียนข้อมูล)**
*   **Role:** Data Entry
*   **Task:** หา Spec สินค้า (Price, Tech Specs) จากเว็บ Official
*   **Toolbelt:** Python Scraper (Simulation) + Google Search

### ⚙️ Phase 2: Production (สายพานการผลิต)

**3. Agent 3: The Analyst (นักวิเคราะห์)**
*   **Role:** Logic & Scoring (The Brain)
*   **Task:** เปรียบเทียบสินค้า A vs B ทีละบรรทัด แล้วให้คะแนน โดยเน้น **Price-to-Performance** (ไม่ใช่แค่ Spec แรงกว่าแล้วชนะ)

**4. Agent 4: The Editor (บรรณาธิการ)**
*   **Role:** Trusted Tech Curator (The Voice)
*   **Tone:** "Sophisticated but Grounded" (เหมือนเพื่อนที่มีรสนิยมดี แนะนำแกมเล่าเรื่อง)
*   **Task:** เขียนบทสรุป, Pros/Cons และ FAQ
*   **SEO Rule:** ห้าม Hard Sell, เน้น User Experience

---

## 6. Compliance & Safety 🛡️

*   **Disclaimer:** ทุกหน้าต้องมีข้อความ "Affiliate Disclaimer" เพื่อความโปร่งใสและไม่ผิดกฎ Amazon/Ad Networks
*   **Drip Feed:** (Future Plan) ในการ Submit Sitemap ห้ามส่ง 1,000 หน้าพร้อมกัน ต้องค่อยๆ ปล่อยทีละนิดเพื่อให้ Google Bot ไม่มองว่าเป็น Spam

---

*Note: เอกสารนี้เขียนโดย Jay เพื่อส่งต่อให้ทีม Dev รุ่นถัดไปรักษามาตรฐาน Codebase นี้ไว้*
