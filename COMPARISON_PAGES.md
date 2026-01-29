# 📖 Comparison Pages - Client Access Guide

## 🌐 Public URLs

Your comparison pages are accessible at:

```
http://localhost:3000/compare/{product_id}
```

In production (Vercel), they'll be:
```
https://your-domain.vercel.app/compare/{product_id}
```

---

## 📝 Currently Published Comparisons

### 1. Sony WH-1000XM6 vs Bose QuietComfort Ultra
**URL**: http://localhost:3000/compare/b086455a-6f2e-4c6f-bacf-75b039f5545b
- Category: Tech Accessories
- Language: Thai
- Scores: 7.5 vs 8.5

### 2. Samsung Galaxy S25 Ultra vs iPhone 16 Pro Max
**URL**: http://localhost:3000/compare/3c1e8da8-3314-46ef-b267-ee427b183022
- Category: Mobile Phones
- Language: Thai

### 3. iPhone 16 Pro Max vs Competitor
**URL**: http://localhost:3000/compare/afc9cff2-efb3-4c03-8509-5f9505f7332a
- Category: Mobile Phones
- Language: Thai

### 4. Thin and Light Gaming Phones
**URL**: http://localhost:3000/compare/10612399-262c-4df3-ad77-cd2ed9b07a6e
- Category: Technology
- Language: Thai

### 5. iPhone 17 Comparison
**URL**: http://localhost:3000/compare/14139ff8-27bb-4f46-8247-d83418567695
- Category: Technology
- Language: Thai

---

## 📄 What Clients See

Each comparison page includes:

### 1. **SEO Optimized Headers**
```html
<title>เปรียบเทียบ Sony WH-1000XM6 กับ Bose QuietComfort Ultra</title>
<meta name="description" content="บทความนี้เปรียบเทียบ..." />
<meta property="og:title" content="..." />
<meta property="og:image" content="..." />
```

### 2. **Hero Section**
- Thai language title
- Introduction paragraph
- "Verified by AI" badge
- Back to Admin navigation

### 3. **Visual Scores**
```
Product A: ⭐⭐⭐⭐ 7.5/10
Product B: ⭐⭐⭐⭐⭐ 8.5/10
```

### 4. **AI Verdict**
Full paragraph explaining why one product is better, with nuanced analysis in Thai.

### 5. **Detailed Specs Comparison**
Side-by-side table comparing:
- Price
- Key specifications
- Features
- Performance metrics

Example:
```
| Spec      | Sony WH-1000XM6 | Bose QuietComfort Ultra |
|-----------|-----------------|-------------------------|
| ราคา      | 0.0             | 0.0                     |
| ANC       | Standard        | World-class             |
```

### 6. **Pros & Cons**
Clear bullet lists in Thai:

**Product A Pros:**
- ✅ Feature 1
- ✅ Feature 2

**Product A Cons:**
- ❌ Limitation 1
- ❌ Limitation 2

### 7. **Affiliate Links**
- Product images (Unsplash)
- Shopee search links
- Ready for affiliate integration

---

## 🔍 How to Find Product IDs

### Method 1: Via Admin Dashboard
1. Open http://localhost:3000/admin
2. Click "Products" tab
3. Click "Details" button on any product
4. The URL will be `/compare/{product_id}`

### Method 2: Via API
```bash
curl http://127.0.0.1:8000/api/products | jq '.[] | select(.has_content==true) | {id, name}'
```

### Method 3: Via Database
Products with `has_content: true` have published comparisons.

---

## 📱 Responsive Design

All comparison pages are:
- ✅ Mobile-friendly
- ✅ Tablet optimized
- ✅ Desktop responsive
- ✅ Fast loading (<2s)
- ✅ SEO optimized

---

## 🌍 Production URLs

When deployed to Vercel, your URLs will be:

```
https://comparex.vercel.app/compare/b086455a-6f2e-4c6f-bacf-75b039f5545b
```

### Setting Custom Domain
1. Go to Vercel Dashboard
2. Settings → Domains
3. Add your domain (e.g., `compare.yoursite.com`)
4. Update DNS records
5. SSL automatically configured

Then URLs become:
```
https://compare.yoursite.com/compare/{product_id}
```

---

## 🔗 Sharing Comparisons

### For Social Media
The pages include Open Graph tags, so when shared on:
- **Facebook**: Shows title, description, image
- **Twitter**: Shows card with preview
- **LINE**: Shows rich preview
- **WhatsApp**: Shows link preview

### For SEO
Each page has:
- Canonical URL
- JSON-LD structured data (Product + Review schema)
- Meta descriptions
- Proper heading structure (H1, H2, H3)

### Example Meta Tags Generated:
```html
<meta property="og:type" content="website" />
<meta property="og:title" content="เปรียบเทียบ Sony WH-1000XM6 กับ Bose..." />
<meta property="og:description" content="บทความนี้เปรียบเทียบหูฟัง..." />
<meta property="og:site_name" content="CompareX - AI Powered Comparisons" />

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "เปรียบเทียบ Sony WH-1000XM6 กับ Bose...",
  "review": {
    "@type": "Review",
    "reviewRating": {
      "@type": "Rating",
      "ratingValue": "8.5",
      "bestRating": "100"
    }
  }
}
</script>
```

---

## 📊 Analytics Ready

Add your analytics code to:
- `frontend/index.html` for global tracking
- `frontend/src/pages/ComparisonPage.tsx` for page-specific events

Example (Google Analytics):
```html
<!-- Global site tag (gtag.js) - Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
```

---

## 🎨 Customization

To customize the comparison page design:

1. **Edit**: `frontend/src/pages/ComparisonPage.tsx`
2. **Styling**: Tailwind classes inline
3. **Colors**: Modify `tailwind.config.js`
4. **Fonts**: Update `index.css`

---

## 🚀 Next Steps

1. **Test in Browser**:
   - Open any comparison URL
   - Check mobile responsiveness
   - Verify Thai language displays correctly

2. **Deploy to Production**:
   ```bash
   # Frontend (Vercel)
   cd frontend
   vercel deploy --prod

   # Backend (Railway)
   git push origin main  # Auto-deploys
   ```

3. **Share with Clients**:
   - Copy comparison URLs
   - Share on social media
   - Add to your website navigation

4. **Monitor Traffic**:
   - Set up Google Analytics
   - Track which comparisons are popular
   - Optimize based on user behavior

---

## 📞 Support

If comparison pages aren't loading:
1. Check backend is running: `curl http://127.0.0.1:8000/health`
2. Check frontend is running: `curl http://localhost:3000/`
3. Verify product has `has_content: true` in database
4. Check browser console for errors

---

**Last Updated**: 2026-01-29
**Total Comparisons**: 5+ published and ready
**All content in Thai language** 🇹🇭
