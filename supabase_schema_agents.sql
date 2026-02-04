-- =====================================================================
-- CompareX: Agent Pipeline Add-on Schema
-- Generated: 2026-02-03
-- =====================================================================

-- 1) product_sources: source-of-truth links for specs/reviews/news
CREATE TABLE public.product_sources (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    source_type TEXT CHECK (source_type IN ('SPEC', 'REVIEW', 'NEWS', 'MANUAL', 'OTHER')) DEFAULT 'OTHER',
    confidence NUMERIC(3,2) DEFAULT 0.00,
    fetched_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    notes TEXT
);

CREATE INDEX idx_product_sources_product ON public.product_sources(product_id);
CREATE INDEX idx_product_sources_type ON public.product_sources(source_type);

-- 2) product_reviews: distilled user/critic reviews
CREATE TABLE public.product_reviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    source TEXT,
    rating NUMERIC(3,1),
    summary TEXT,
    sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative')) DEFAULT 'neutral',
    url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX idx_product_reviews_product ON public.product_reviews(product_id);
CREATE INDEX idx_product_reviews_sentiment ON public.product_reviews(sentiment);

-- 3) article_drafts: editor output
CREATE TABLE public.article_drafts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    language TEXT DEFAULT 'TH',
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    status TEXT CHECK (status IN ('DRAFT', 'REVIEW', 'READY', 'PUBLISHED', 'ARCHIVED')) DEFAULT 'DRAFT',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX idx_article_drafts_product ON public.article_drafts(product_id);
CREATE INDEX idx_article_drafts_status ON public.article_drafts(status);

-- 4) article_layouts: blog designer output
CREATE TABLE public.article_layouts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    draft_id UUID NOT NULL REFERENCES public.article_drafts(id) ON DELETE CASCADE,
    layout_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    hero_image TEXT,
    gallery JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX idx_article_layouts_draft ON public.article_layouts(draft_id);

-- =====================================================================
-- RLS POLICIES (optional baseline)
-- =====================================================================

ALTER TABLE public.product_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_layouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Read Product Sources" ON public.product_sources FOR SELECT USING (true);
CREATE POLICY "Public Read Product Reviews" ON public.product_reviews FOR SELECT USING (true);
CREATE POLICY "Public Read Article Drafts" ON public.article_drafts FOR SELECT USING (true);
CREATE POLICY "Public Read Article Layouts" ON public.article_layouts FOR SELECT USING (true);

CREATE POLICY "Admin Write Product Sources" ON public.product_sources FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin Write Product Reviews" ON public.product_reviews FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin Write Article Drafts" ON public.article_drafts FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin Write Article Layouts" ON public.article_layouts FOR ALL USING (auth.role() = 'authenticated');
