# CompareX: The pSEO Engine (Monorepo)

**Project Owner:** P'Ook
**Lead Developer:** Jay

---

## Structure

This repository uses a Monorepo structure to separate concerns:

- **`frontend/`**: The "Body". React/Vite application for the Admin Interface and Public Views. Deployed on **Vercel**.
- **`backend/`**: The "Brain". Python/FastAPI application for AI Agents, Data Processing, and Complex Logic. Deployed on **Railway**.

## Deployment 🚀
### 1. Database (Supabase)
- Create a new Project.
- Run the SQL from `supabase_schema.sql` (and manual `has_content` migration if upgrading).
- Copy `SUPABASE_URL` and `SUPABASE_KEY` (anon) to your `.env` variables.

### 2. Backend (Railway)
- Link your GitHub repo.
- Set Root Directory: `backend`
- Add Variables: `SUPABASE_URL`, `SUPABASE_KEY`, `GOOGLE_API_KEY`.
- Railway will detect `Procfile` and `requirements.txt` automatically.
- **Result:** You will get a Backend URL (e.g., `https://api-comparex.up.railway.app`).

### 3. Frontend (Vercel)
- Link your GitHub repo.
- Set Root Directory: `frontend`
- Add Variable: `VITE_API_URL` = Your Railway Backend URL (no trailing slash).
- **Result:** You will get a Frontend URL.

## Local Development 🛠️
1. **Backend:**
   ```bash
   cd backend
   pip install -r requirements.txt
   uvicorn app.main:app --reload
   ```
2. **Frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

