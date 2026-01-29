# Changelog & Decision Log 📝

All notable changes to the **CompareX** project will be documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased] - Phase 3: Dashboard & Admin UI

### 🚀 Features (New)
*   **Modern Dashboard (React + Tailwind v4):**
    *   Initialize `frontend/` with Vite.
    *   Implemented `TrendMonitor` (Real-time RSS Feed View).
    *   Implemented `ProductManager` (Database View).
    *   Designed Admin Layout with Sidebar.
*   **RSS Feed Integration (`Hunter`):**
    *   Added `feedparser` library.
    *   Implemented `fetch_rss_trends` to scan GSMArena, TheVerge, etc.
    *   *Decision:* Use RSS as the primary "Free" signal source to reduce API costs.
*   **Hybrid Search Strategy (`Hunter`):**
    *   Logic: RSS -> DuckDuckGo (Free) -> Gemini Search Tool (Paid Fallback).
    *   *Decision:* Prioritize $0 cost methods first, use Paid API only as a safety net.
*   **Dynamic Category Templates (`Clerk` / "The Architect"):**
    *   Implemented `ensure_category_config` function.
    *   *Logic:* If a category is new, AI automatically designs the `comparison_fields` (schema) and saves to DB.
    *   *Decision:* Remove hardcoded categories to allow infinite scaling without code changes.
*   **Real Web Scraping (`Clerk`):**
    *   Added `beautifulsoup4` and `requests`.
*   **Analyst "Smart Loop":**
    *   Implemented `analyst.py` to identify competitors via AI.
    *   *Logic:* Force-fetches competitor data via `Clerk` if missing in DB (Recursive Data Gathering).

### ⚙️ Technical Changes & Refactoring
*   **Database Schema (v3.0.0):**
    *   Refactored `categories` to use `parent_id` (Hierarchy).
    *   Added `TEXT[]` column for `comparison_fields` to support dynamic templates.
    *   Added `trends` table to store raw findings before they become products.
*   **API Optimization:**
    *   Disabled `response_mime_type="application/json"` when using Google Search Tool (Fixed `400 INVALID_ARGUMENT` error).
    *   Forced "Text Mode" + Manual JSON Parsing for better compatibility with Search Tools.

### 🐛 Bug Fixes
*   Fixed `ModuleNotFoundError: No module named 'feedparser'` by adding to `requirements.txt`.
*   Fixed `AttributeError` in RSS parser when feed entries lacked `source` metadata.
*   Fixed DuckDuckGo Rate Limit (`202 Ratelimit`) handling by implementing the Fallback mechanism.

---

## [0.1.0] - Phase 1: Connectivity & Foundation
### Added
*   Initial FastAPI Backend setup.
*   Supabase connection module (`database.py`).
*   Basic Agent structures (Hunter, Clerk, Editor).
*   Docker support.

---

## 🏗️ Architectural Decisions (ADR)
> Key decisions that shaped the system.

1.  **JSONB for Specs:** We chose `JSONB` for the `products.specs` column instead of separate columns (e.g., `cpu`, `ram`) to allow for flexible schemas across different product types (Shoes vs Phones).
2.  **The "Analyst Loop":** We decided that if a competitor is missing during analysis, the system must **Force Fetch** it (Recursive Logic) rather than skipping the comparison.
3.  **Monolith to Microservices:** The project is structured as a Modular Monolith (in `app/agents/`) but ready to be split into Microservices (Cloud Functions) if scaling is needed.
