# 🔧 Vercel Not Working - Troubleshooting Steps

## Issue: Blank Page on https://p-seo-by-ai.vercel.app/

Your Railway backend works fine, but Vercel shows a blank page.

## ✅ Checklist to Verify:

### 1. Environment Variable is Set
Go to Vercel Dashboard:
1. Project → **Settings** → **Environment Variables**
2. Verify you see:
   ```
   VITE_API_URL = https://pseoby-ai-production.up.railway.app
   ```
3. Make sure it's checked for: **Production** ✓

### 2. Force a Complete Rebuild

**Option A: Delete & Redeploy**
1. Go to Vercel Dashboard → **Deployments**
2. Find the latest deployment
3. Click **...** → **Delete Deployment**
4. Go to **Deployments** → **Redeploy** button
5. **UNCHECK** "Use existing Build Cache"
6. Click **Redeploy**

**Option B: Update a File**
```bash
cd /Users/natthamonpisit/Coding/pSEO_by-AI/frontend
echo "# Updated $(date)" >> README.md
git add README.md
git commit -m "force: rebuild without cache"
git push origin main
```

### 3. Verify Build Includes Railway URL

After redeployment, check build logs:
1. Vercel Dashboard → **Deployments** → Click latest
2. Click **Building** to see logs
3. Look for environment variable being set

### 4. Clear Vercel Cache

In Vercel Dashboard:
1. **Settings** → **Data Cache**
2. Click **Purge Cache**
3. Then redeploy

---

## 🎯 Most Common Causes:

### Cause 1: Environment Variable Not Applied
**Solution**: Delete the variable and add it again
1. Settings → Environment Variables
2. Delete `VITE_API_URL`
3. Add it again with the correct URL
4. Redeploy

### Cause 2: Build Cache Issue
**Solution**: Force rebuild without cache
1. Go to Deployments
2. Redeploy WITHOUT cache

### Cause 3: Wrong Root Directory
**Solution**: Verify in Vercel Settings
1. Settings → General
2. Root Directory should be: `frontend`
3. Build Command: (leave empty, uses package.json)
4. Output Directory: `dist`

---

## 🧪 Manual Test Steps:

### Test 1: Check Environment Variable in Build
After deployment, run:
```bash
curl -s https://p-seo-by-ai.vercel.app/assets/index-*.js | strings | grep railway
```

Should show: `pseoby-ai-production.up.railway.app`

### Test 2: Check Browser Console
1. Open https://p-seo-by-ai.vercel.app/admin
2. Press F12
3. Console tab
4. Look for errors

Common errors:
- `Failed to fetch` → Backend not reachable
- `CORS error` → Backend CORS not configured for Vercel URL
- `Unexpected token` → JavaScript loading issue

### Test 3: Network Tab
1. F12 → Network tab
2. Reload page
3. Look for requests to Railway
4. Should see: `pseoby-ai-production.up.railway.app/api/products`

---

## 🔄 Nuclear Option: Complete Redeploy

If nothing works, do a complete clean redeploy:

```bash
# 1. Delete all deployments in Vercel Dashboard

# 2. Update frontend to ensure new build
cd /Users/natthamonpisit/Coding/pSEO_by-AI/frontend
echo "# Force rebuild $(date +%s)" >> src/config.ts
git add .
git commit -m "force: complete rebuild"
git push origin main

# 3. Wait for Vercel to auto-deploy

# 4. Verify it's building the right commit
```

---

## 📋 Vercel Settings Should Be:

```
Framework Preset: Vite
Root Directory: frontend
Build Command: (default)
Output Directory: dist
Install Command: npm install

Environment Variables:
  VITE_API_URL = https://pseoby-ai-production.up.railway.app
```

---

## 🚨 Important Notes:

1. **VITE_ prefix is required** for Vite to read the variable
2. **No trailing slash** on the Railway URL
3. **Production checkbox must be checked** for the environment variable
4. **Build cache can cause issues** - always try without cache first

---

## ✅ Success Indicators:

When it works, you should see:
- Admin dashboard loads
- Products tab shows 20 items
- Trends tab works
- Settings tab shows logs
- Comparison pages load at `/compare/{id}`

---

## 🆘 If Still Not Working:

1. **Screenshot your Vercel environment variables** page
2. **Copy the latest deployment logs** from Vercel
3. **Check browser console errors** (F12)
4. **Verify Railway backend** is still working:
   ```bash
   curl https://pseoby-ai-production.up.railway.app/health
   ```

---

## Quick Command Reference:

```bash
# Test Railway backend
curl https://pseoby-ai-production.up.railway.app/health

# Check if Vercel has Railway URL
curl -s https://p-seo-by-ai.vercel.app/assets/index-*.js | grep railway

# Force redeploy
git commit --allow-empty -m "force: redeploy" && git push

# Check deployment status
# Go to: https://vercel.com/dashboard
```

---

**Most likely solution**: Delete the old deployment and redeploy without cache!
