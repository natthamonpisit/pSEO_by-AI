# 🚀 Complete Deployment Guide

## Current Issue
Your Vercel frontend is trying to connect to `localhost:8000` which doesn't exist in production!

## Solution: Deploy Backend → Configure Frontend → Redeploy

---

## Step 1: Deploy Backend to Railway 🚂

### Option A: Using Railway CLI (Recommended)
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize project
cd backend
railway init

# Deploy
railway up
```

### Option B: Using Railway Dashboard
1. Go to https://railway.app/
2. Sign up/Login with GitHub
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Choose your `pSEO_by-AI` repository
6. **Important Settings**:
   - **Root Directory**: `backend`
   - **Build Command**: (leave empty, uses Procfile)
   - **Start Command**: (leave empty, uses Procfile)

### Configure Environment Variables in Railway
Add these variables in Railway Dashboard → Variables:

```bash
GOOGLE_API_KEY=your_actual_key_here
SUPABASE_URL=https://hqmnmesllhdpacowfhbd.supabase.co
SUPABASE_KEY=your_supabase_anon_key
FRONTEND_URL=https://p-seo-by-ai.vercel.app
```

### Get Your Railway Backend URL
After deployment, Railway will give you a URL like:
```
https://pseo-by-ai-production.up.railway.app
```

**Copy this URL!** You'll need it for Vercel.

---

## Step 2: Configure Vercel Environment Variables 🔧

1. Go to https://vercel.com/dashboard
2. Select your `p-seo-by-ai` project
3. Go to **Settings** → **Environment Variables**
4. Add this variable:

```
Name: VITE_API_URL
Value: https://pseo-by-ai-production.up.railway.app
```

**Important**:
- No trailing slash!
- Must be your actual Railway URL
- Must start with `VITE_` prefix for Vite to read it

---

## Step 3: Redeploy Frontend 🔄

### Option A: Push to GitHub (Auto-deploy)
```bash
# Make a small change to trigger rebuild
cd frontend
echo "\n# Trigger rebuild" >> README.md
git add .
git commit -m "chore: trigger Vercel rebuild with Railway backend URL"
git push origin main
```

Vercel will automatically redeploy with the new environment variable.

### Option B: Manual Redeploy in Vercel
1. Go to Vercel Dashboard
2. Click on your project
3. Go to **Deployments** tab
4. Click the **...** menu on the latest deployment
5. Click **Redeploy**
6. Check "Use existing Build Cache" (optional)
7. Click **Redeploy**

---

## Step 4: Verify Deployment ✅

### Test Backend
```bash
curl https://your-railway-url.up.railway.app/health
```

Should return:
```json
{
  "status": "ok",
  "database": "healthy",
  "version": "1.0.0"
}
```

### Test Frontend
1. Open https://p-seo-by-ai.vercel.app/
2. You should see the admin dashboard
3. Check browser console (F12) for any errors
4. Test navigation between tabs

### Test Comparison Pages
```
https://p-seo-by-ai.vercel.app/compare/{product_id}
```

---

## Quick Checklist ☑️

Backend (Railway):
- [ ] Repository connected
- [ ] Root directory set to `backend`
- [ ] Environment variables added (3 required)
- [ ] Deployment successful
- [ ] `/health` endpoint returns 200

Frontend (Vercel):
- [ ] `VITE_API_URL` environment variable added
- [ ] Points to Railway backend URL
- [ ] Redeployed after adding variable
- [ ] Site loads without errors
- [ ] Admin dashboard accessible
- [ ] Products tab shows data

---

## Common Issues & Solutions

### Issue 1: "Failed to fetch" errors
**Cause**: CORS or backend not accessible
**Solution**:
- Check Railway backend is running
- Verify FRONTEND_URL in Railway matches your Vercel URL
- Check Railway logs for errors

### Issue 2: Blank page on Vercel
**Cause**: Missing VITE_API_URL or pointing to localhost
**Solution**:
- Add/update VITE_API_URL in Vercel
- Must start with `https://` not `http://`
- Redeploy after adding variable

### Issue 3: 404 on refresh
**Cause**: SPA routing not configured
**Solution**:
- ✅ Already fixed! `vercel.json` has rewrites

### Issue 4: Database connection failed
**Cause**: Missing Supabase credentials in Railway
**Solution**:
- Copy from `.env` file
- Add to Railway environment variables
- Redeploy

---

## Environment Variables Reference

### Backend (Railway)
```bash
GOOGLE_API_KEY=AIzaSy... (Redacted)
SUPABASE_URL=https://hqmnmesllhdpacowfhbd.supabase.co
SUPABASE_KEY=eyJhbGc...  # Your actual key
FRONTEND_URL=https://p-seo-by-ai.vercel.app
```

### Frontend (Vercel)
```bash
VITE_API_URL=https://your-railway-url.up.railway.app
```

---

## Testing Your Deployment

### 1. Test Backend Health
```bash
curl https://your-railway-url.up.railway.app/health
```

### 2. Test Products API
```bash
curl https://your-railway-url.up.railway.app/api/products
```

### 3. Test Frontend
Open in browser:
```
https://p-seo-by-ai.vercel.app/admin
```

### 4. Test Comparison Page
```
https://p-seo-by-ai.vercel.app/compare/b086455a-6f2e-4c6f-bacf-75b039f5545b
```

---

## Alternative: Deploy Backend to Render

If you prefer Render over Railway:

1. Go to https://render.com/
2. New → Web Service
3. Connect GitHub repo
4. Settings:
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add same environment variables
6. Deploy

---

## Monitoring & Logs

### Railway Logs
```bash
railway logs
```

### Vercel Logs
Dashboard → Project → Runtime Logs

### Check Errors
Browser F12 → Console tab

---

## Next Steps After Deployment

1. **Custom Domain** (Optional):
   - Vercel: Settings → Domains
   - Railway: Settings → Domains

2. **Analytics**:
   - Add Google Analytics
   - Set up Vercel Analytics

3. **Monitoring**:
   - Set up uptime monitoring (UptimeRobot)
   - Configure error tracking (Sentry)

4. **Performance**:
   - Enable Vercel Edge Network
   - Configure Railway autoscaling

---

## Support

If you're still having issues:

1. Check Railway logs: `railway logs`
2. Check Vercel logs in dashboard
3. Check browser console (F12)
4. Verify all environment variables are set
5. Try a hard refresh (Ctrl+Shift+R)

---

**Last Updated**: 2026-01-29
**Deployment Status**: Pending backend deployment
