# 🔒 Security Guide

## ✅ Current Security Status

### Frontend (Vercel) - SECURE
- ✅ **No API keys** in code
- ✅ **No sensitive credentials**
- ✅ **No direct API calls** to Google/Supabase
- ✅ All API calls go through backend
- ✅ Environment variables managed in Vercel dashboard
- ✅ `.env` files not committed to git

### Backend (Railway) - SECURE
- ✅ API keys stored as **environment variables**
- ✅ CORS configured for specific origins
- ✅ Request validation enabled
- ✅ No credentials in code
- ✅ `.env` file in `.gitignore`

---

## 🔑 Where API Keys Should Be

### ❌ NEVER Put Keys Here:
- Frontend source code
- Git repository
- `.env` files committed to git
- Client-side JavaScript
- Public repositories

### ✅ Keys Should Be Here:

**Backend (Railway):**
```
GOOGLE_API_KEY=your_key      # For AI API calls
SUPABASE_URL=your_url        # For database
SUPABASE_KEY=your_key        # For database
FRONTEND_URL=your_vercel_url # For CORS
```

**Frontend (Vercel):**
```
VITE_API_URL=your_railway_url  # Only this, no API keys!
```

---

## 🏗️ Secure Architecture

```
┌─────────────┐
│   Browser   │  ← No API keys here!
└──────┬──────┘
       │ HTTPS
       ▼
┌─────────────┐
│   Vercel    │  ← Only VITE_API_URL
│  (Frontend) │
└──────┬──────┘
       │ API Calls
       ▼
┌─────────────┐
│   Railway   │  ← All API keys here!
│  (Backend)  │
└──────┬──────┘
       │
       ├─► Google AI API
       └─► Supabase DB
```

---

## 🛡️ Security Best Practices

### 1. Environment Variables
- **Frontend**: Set in Vercel Dashboard → Settings → Environment Variables
- **Backend**: Set in Railway Dashboard → Variables
- **Never** commit `.env` files to git

### 2. API Keys
- **Rotate keys** regularly
- **Use different keys** for dev/staging/production
- **Never log** API keys
- **Restrict API keys** to specific domains/IPs when possible

### 3. CORS Configuration
- Backend only allows requests from:
  - `http://localhost:3000` (local dev)
  - Your Vercel URL (production)
- Never use `allow_origins=["*"]` in production

### 4. Git Security
```bash
# .gitignore should include:
.env
*.env
.env.local
.env.production
backend/.env
frontend/.env
```

---

## 🔍 Security Checklist

### Before Deploying:
- [ ] No API keys in frontend code
- [ ] All `.env` files in `.gitignore`
- [ ] CORS configured for specific origins
- [ ] Environment variables set in hosting platforms
- [ ] No sensitive data in git history
- [ ] Dependencies up to date
- [ ] HTTPS enabled (automatic on Vercel/Railway)

### Regular Maintenance:
- [ ] Review environment variables monthly
- [ ] Rotate API keys quarterly
- [ ] Update dependencies for security patches
- [ ] Monitor access logs
- [ ] Review CORS configuration

---

## 🚨 What to Do If Keys Are Exposed

### If API Key Leaked:

1. **Immediately Revoke** the key:
   - Google Cloud Console → APIs & Services → Credentials
   - Supabase Dashboard → Settings → API

2. **Generate New Key**:
   - Create new key with same permissions
   - Update in Railway environment variables

3. **Update Repository** (if committed):
   ```bash
   # Remove from git history
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch .env" \
     --prune-empty --tag-name-filter cat -- --all

   # Force push (dangerous!)
   git push origin --force --all
   ```

4. **Notify Team**:
   - Inform all developers
   - Update documentation
   - Review access logs

---

## 📋 Current Configuration

### Frontend Package Dependencies:
```json
{
  "dependencies": {
    "lucide-react": "^0.563.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-helmet-async": "^2.0.5",
    "react-router-dom": "^7.13.0",
    "recharts": "^3.7.0"
  }
}
```
✅ No `@google/genai` - removed for security

### Backend Package Dependencies:
```
fastapi
google-genai  ← Only in backend!
supabase
```

---

## 🔐 API Key Restrictions

### Google API Key Restrictions (Recommended):
1. Go to Google Cloud Console
2. Select your API key
3. Add restrictions:
   - **Application restrictions**: HTTP referrers
   - **Allowed referrers**:
     - `pseoby-ai-production.up.railway.app/*`
   - **API restrictions**: Restrict to specific APIs
     - Gemini API only

### Supabase Key:
- Use **anon key** for read operations
- Use **service_role key** for admin operations (backend only)
- Enable Row Level Security (RLS) in Supabase

---

## 📊 Security Monitoring

### Logs to Monitor:
1. **Railway Logs**: Check for failed API calls
2. **Vercel Logs**: Monitor for unusual traffic
3. **Supabase Logs**: Watch for unauthorized access
4. **Google Cloud Logs**: Track API usage

### Set Up Alerts:
- Google Cloud Console → Monitoring → Alerts
- Alert on: High API usage, failed requests, unusual patterns

---

## 🆘 Security Contact

If you discover a security issue:
1. **DO NOT** post in public issues
2. **DO NOT** commit the issue to git
3. Contact project maintainers directly
4. Rotate compromised keys immediately

---

## ✅ Security Verification

Run this check to verify security:

```bash
# Check for exposed keys in git history
git log --all --full-history --source --pretty=format: \
  --name-only | xargs grep -l "AIzaSy\|eyJhbG" 2>/dev/null

# Should return nothing

# Check current files for keys
grep -r "AIzaSy\|eyJhbG" . --exclude-dir={node_modules,dist,.git}

# Should return nothing in frontend
```

---

**Last Security Audit**: 2026-01-29
**Status**: ✅ Secure
**Next Review**: 2026-02-29
