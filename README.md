# CompareX: The pSEO Engine (Automation Factory)

**Project Owner:** P'Ook  
**Lead Developer:** Jay (Full-stack AI Engineer)  
**Version:** 2.1 (Clean Architecture & Observability Ready)

---

## 1. The Core Concept (Business Logic)
เราไม่ได้ทำเว็บรีวิวธรรมดา แต่เรากำลังสร้าง **"โรงงานผลิตหน้าเว็บ (Page Factory)"** เพื่อดักจับ Long-tail Keywords ผ่านกลยุทธ์ **Programmatic SEO (pSEO)**

---

## 2. Software Architecture (The "Good Design" Update) 🏛️

อ้างอิงจากหลักการ **Good Software Design (2025)** เราได้ปรับโครงสร้างระบบให้แข็งแกร่งขึ้นดังนี้:

### 2.1 Clean Architecture (Repository Pattern)
*   **Problem:** เดิมทีโค้ดผูกติดกับ `LocalStorage` ทำให้เปลี่ยนไปใช้ Database อื่นยาก
*   **Solution:** ใช้ **Repository Pattern** แยก Data Access Layer ออกจาก Business Logic
    *   `IDataRepository` (Interface): สัญญากลางว่าต้องมีฟังก์ชัน `saveProduct`, `getLogs` ฯลฯ
    *   `LocalStorageRepository` (Adapter): ตัวทำงานจริง (สามารถเปลี่ยนเป็น `SupabaseRepository` ได้ในอนาคตโดยไม่ต้องแก้โค้ดส่วนอื่น)

### 2.2 Observability (System Logs)
*   **Concept:** AI Agent ทำงานแบบเบื้องหลัง เราต้อง "มองเห็น" การทำงานของมัน
*   **Solution:** เพิ่มระบบ **System Logs** บันทึกการทำงานของ Agent ทุกตัว (Hunter, Clerk, Analyst) ลงใน Dashboard เพื่อให้ตรวจสอบปัญหาได้ง่าย (Traceability)

### 2.3 Modular Monolith
*   โครงสร้างไฟล์แยกตาม Feature (`components/generator/*`) และ Service (`services/gemini/*`) ทำให้ทีมงานหลายคนทำงานร่วมกันได้โดยไม่เหยียบเท้ากัน

---

## 3. The Monetization Strategy (Hybrid Model) 💰

เราใช้กลยุทธ์การทำเงินแบบผสมผสาน เพื่อให้ได้ Conversion สูงสุดในแต่ละตลาด:

| Market | Strategy | Why? |
| :--- | :--- | :--- |
| **🇹🇭 Thailand** | **Shopee Search Link** | คนไทยชอบซื้อของใน Shopee/Lazada การส่งไปหน้า Search (`shopee.co.th/search?keyword=...`) conversion ดีกว่าส่งไปร้านเดียว (เพราะร้านนั้นของอาจหมด) |
| **🌍 Global** | **Skimlinks (Auto)** | ฝรั่งชอบกดเว็บ Official Brand (เช่น Samsung.com) เราจึงให้ AI หาลิงก์ Official แล้วใช้ Skimlinks JS เปลี่ยนเป็น Affiliate Link อัตโนมัติ (ไม่ต้องไล่สมัครเอง) |

---

## 4. The AI Workflow (4-Agent System)

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

*Note: เอกสารนี้เขียนโดย Jay เพื่อส่งต่อให้ทีม Dev รุ่นถัดไปรักษามาตรฐาน Codebase นี้ไว้*
