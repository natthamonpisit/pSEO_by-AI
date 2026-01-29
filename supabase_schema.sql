-- ---------------------------------------------------------------------------
-- CompareX: Supabase / PostgreSQL Schema (Trends & pSEO Support)
-- Version: 3.0.0
-- Author: Jay (AI Agent)
-- ---------------------------------------------------------------------------

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---------------------------------------------------------------------------
-- 📦 MODULE: PRODUCT MANAGEMENT
-- ---------------------------------------------------------------------------

-- Categories Table (Hierarchical: Parent -> Sub Main -> Sub Leaf)
CREATE TABLE public.categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL, 
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    
    -- Leaf Node Properties
    is_active BOOLEAN DEFAULT TRUE,
    comparison_fields TEXT[] DEFAULT '{}',
    content_tone TEXT DEFAULT 'Professional',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX idx_categories_parent ON public.categories(parent_id);

-- Products Table
CREATE TABLE public.products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    brand TEXT NOT NULL,
    category_slug TEXT NOT NULL REFERENCES public.categories(slug) ON DELETE CASCADE,
    price NUMERIC(10, 2) DEFAULT 0,
    currency TEXT DEFAULT 'USD',
    specs JSONB DEFAULT '{}'::jsonb,
    tags TEXT[] DEFAULT '{}',
    image_url TEXT,
    affiliate_link TEXT,
    has_content BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX idx_products_search ON public.products USING gin(to_tsvector('english', name || ' ' || brand));
CREATE INDEX idx_products_category ON public.products(category_slug);

-- ---------------------------------------------------------------------------
-- 📈 MODULE: TRENDS & HUNTER (NEW!)
-- ---------------------------------------------------------------------------

-- Trends Table (Stores rising keywords/products *before* they are added to DB)
CREATE TABLE public.trends (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_name TEXT NOT NULL,
    category_slug TEXT REFERENCES public.categories(slug) ON DELETE SET NULL,
    news_headline TEXT,
    reason TEXT, -- Why is it trending?
    launch_date TIMESTAMP WITH TIME ZONE,
    
    -- Status Workflow: NEW -> ENRICHING -> READY -> ADDED
    status TEXT DEFAULT 'NEW' CHECK (status IN ('NEW', 'ENRICHING', 'READY_TO_ADD', 'ADDED', 'IGNORED')),
    
    -- Enriched Data (Draft specs before moving to products table)
    suggested_specs JSONB DEFAULT '{}'::jsonb,
    suggested_price NUMERIC(10, 2),
    
    found_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX idx_trends_status ON public.trends(status);
CREATE INDEX idx_trends_category ON public.trends(category_slug);

-- ---------------------------------------------------------------------------
-- ⚖️ MODULE: COMPARISON ENGINE
-- ---------------------------------------------------------------------------

CREATE TABLE public.comparisons (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_a_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    product_b_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    language TEXT DEFAULT 'TH',
    
    title TEXT NOT NULL,
    intro TEXT,
    verdict TEXT,
    winner_id UUID REFERENCES public.products(id),
    
    score_a NUMERIC(3, 1) DEFAULT 0,
    score_b NUMERIC(3, 1) DEFAULT 0,
    pros_a TEXT[] DEFAULT '{}',
    cons_a TEXT[] DEFAULT '{}',
    pros_b TEXT[] DEFAULT '{}',
    cons_b TEXT[] DEFAULT '{}',
    
    spec_comparison JSONB DEFAULT '[]'::jsonb,
    faqs JSONB DEFAULT '[]'::jsonb,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE UNIQUE INDEX idx_unique_comparison ON public.comparisons (product_a_id, product_b_id, language);

-- ---------------------------------------------------------------------------
-- 👁️ MODULE: OBSERVABILITY
-- ---------------------------------------------------------------------------

CREATE TABLE public.system_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    level TEXT CHECK (level IN ('INFO', 'WARNING', 'ERROR', 'SUCCESS')),
    agent TEXT CHECK (agent IN ('HUNTER', 'CLERK', 'ANALYST', 'EDITOR', 'SYSTEM')),
    message TEXT NOT NULL,
    details JSONB
);

-- ---------------------------------------------------------------------------
-- 🔐 SECURITY (RLS)
-- ---------------------------------------------------------------------------

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comparisons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trends ENABLE ROW LEVEL SECURITY; -- NEW

CREATE POLICY "Public Read Categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Public Read Products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Public Read Comparisons" ON public.comparisons FOR SELECT USING (true);

-- Admin Policies
CREATE POLICY "Admin Write Categories" ON public.categories FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin Write Products" ON public.products FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin Write Comparisons" ON public.comparisons FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin Write Trends" ON public.trends FOR ALL USING (auth.role() = 'authenticated'); -- NEW
CREATE POLICY "System Write Logs" ON public.system_logs FOR INSERT WITH CHECK (true);

-- ---------------------------------------------------------------------------
-- 🌳 SEED DATA (SAME HIERARCHY AS BEFORE)
-- ---------------------------------------------------------------------------

DO $$
DECLARE
    -- Main Roots
    tech_id UUID;
    sport_id UUID;
    home_id UUID;
    fashion_id UUID;
    beauty_id UUID;
    food_id UUID;
BEGIN
    -- 1. ROOT: Technology 🖥️
    INSERT INTO public.categories (name, slug, description) 
    VALUES ('Technology', 'technology', 'Everything Tech & Gadgets') 
    RETURNING id INTO tech_id;

        INSERT INTO public.categories (parent_id, name, slug, comparison_fields) VALUES
        (tech_id, 'Mobile Phones', 'mobile-phones', '{"Screen", "Processor", "Camera", "Battery", "Price"}'),
        (tech_id, 'Laptops', 'laptops', '{"CPU", "RAM", "GPU", "Screen", "Weight"}'),
        (tech_id, 'PC Components', 'pc-components', '{"Performance", "Compatibility", "Power Draw", "Price"}'),
        (tech_id, 'Accessories', 'tech-accessories', '{"Compatibility", "Durability", "Features"}'),
        (tech_id, 'Gadgets', 'gadgets', '{"Innovation", "Utility", "Battery Life"}'),
        (tech_id, 'Cameras', 'cameras', '{"Sensor Size", "Resolution", "Video Specs", "Lens System"}'),
        (tech_id, 'Smart Home', 'smart-home', '{"Ecosystem", "Connectivity", "Power", "Features"}');

    -- 2. ROOT: Sport & Outdoors 🏃
    INSERT INTO public.categories (name, slug, description) 
    VALUES ('Sport & Outdoors', 'sport-outdoors', 'Fitness, Gear, and Activity') 
    RETURNING id INTO sport_id;

        INSERT INTO public.categories (parent_id, name, slug, comparison_fields) VALUES
        (sport_id, 'Running Shoes', 'running-shoes', '{"Cushioning", "Weight", "Drop", "Durability"}'),
        (sport_id, 'Fitness Equipment', 'fitness-equipment', '{"Dimensions", "Max Weight", "Features", "Warranty"}'),
        (sport_id, 'Bicycles', 'bicycles', '{"Frame Material", "Groupset", "Weight", "Type"}'),
        (sport_id, 'Camping Gear', 'camping-gear', '{"Weight", "Durability", "Waterproof Rating"}');

    -- 3. ROOT: Home & Living 🏠
    INSERT INTO public.categories (name, slug, description) 
    VALUES ('Home & Living', 'home-living', 'Appliances and Decor') 
    RETURNING id INTO home_id;

        INSERT INTO public.categories (parent_id, name, slug, comparison_fields) VALUES
        (home_id, 'Air Purifiers', 'air-purifiers', '{"CADR", "Filter Type", "Noise Level", "Room Size"}'),
        (home_id, 'Robot Vacuums', 'robot-vacuums', '{"Suction Power", "Battery", "Mapping Tech", "Mopping"}'),
        (home_id, 'Coffee Machines', 'coffee-machines', '{"Pressure", "Boiler Type", "Grinder", "Capacity"}'),
        (home_id, 'Furniture', 'furniture', '{"Material", "Dimensions", "Style", "Assembly"}');

    -- 4. ROOT: Fashion 👗
    INSERT INTO public.categories (name, slug, description) 
    VALUES ('Fashion', 'fashion', 'Apparel and Accessories') 
    RETURNING id INTO fashion_id;

        INSERT INTO public.categories (parent_id, name, slug, comparison_fields) VALUES
        (fashion_id, 'Sneakers', 'sneakers', '{"Material", "Comfort", "Style", "Collaborations"}'),
        (fashion_id, 'Watches', 'watches', '{"Movement", "Case Size", "Material", "Water Resistance"}'),
        (fashion_id, 'Bags', 'bags', '{"Material", "Capacity", "Compartments", "Durability"}');

    -- 5. ROOT: Beauty & Health 💄
    INSERT INTO public.categories (name, slug, description) 
    VALUES ('Beauty & Health', 'beauty-health', 'Skincare and Wellness') 
    RETURNING id INTO beauty_id;
    
        INSERT INTO public.categories (parent_id, name, slug, comparison_fields) VALUES
        (beauty_id, 'Skincare', 'skincare', '{"Ingredients", "Skin Type", "Volume", "Benefits"}'),
        (beauty_id, 'Supplements', 'supplements', '{"Ingredients", "Dosage", "Certifications", "Benefits"}');

    -- 6. ROOT: Food & Beverage 🍔
    INSERT INTO public.categories (name, slug, description) 
    VALUES ('Food & Beverage', 'food-beverage', 'Snacks and Drinks') 
    RETURNING id INTO food_id;
    
        INSERT INTO public.categories (parent_id, name, slug, comparison_fields) VALUES
        (food_id, 'Coffee Beans', 'coffee-beans', '{"Roast Level", "Origin", "Notes", "Process"}'),
        (food_id, 'Healthy Snacks', 'healthy-snacks', '{"Calories", "Protein", "Sugar", "Ingredients"}');

END $$;
