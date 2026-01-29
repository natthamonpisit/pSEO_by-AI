import { Product, ComparisonResult, CategoryDefinition, DEFAULT_CATEGORIES } from '../types';
import { MOCK_PRODUCTS } from '../constants';

// ---------------------------------------------------------------------------
// [J's Architecture Note]
// ไฟล์นี้คือ "สะพาน" เชื่อมต่อกับ Database
//
// 📌 SUPABASE ROLE:
// ใน Production เราจะเปลี่ยนโค้ดทั้งหมดในไฟล์นี้ให้ใช้ 'supabase-js' client
// แทนการใช้ localStorage
// ---------------------------------------------------------------------------

const STORAGE_KEY_PRODUCTS = 'pseo_products';
const STORAGE_KEY_COMPARISONS = 'pseo_comparisons';
const STORAGE_KEY_CATEGORIES = 'pseo_categories';

// Helper: Define default specs for initial categories
const GET_DEFAULT_SPECS = (category: string): string[] => {
  const map: Record<string, string[]> = {
    'Smartphone': ['Display', 'Processor', 'Camera', 'Battery', 'Charging'],
    'Laptop': ['CPU', 'GPU', 'RAM', 'Storage', 'Display', 'Weight'],
    'Headphones': ['Sound Quality', 'Noise Cancellation', 'Battery Life', 'Comfort', 'Connectivity'],
    'Camera': ['Sensor Size', 'Resolution', 'Video Capabilities', 'Autofocus', 'ISO Range'],
    'Smartwatch': ['Battery Life', 'Health Sensors', 'Display', 'Water Resistance', 'Compatibility']
  };
  return map[category] || ['Price', 'Features', 'Build Quality', 'Performance']; // Fallback
};

// Helper to initialize data
const initData = () => {
  if (!localStorage.getItem(STORAGE_KEY_PRODUCTS)) {
    localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(MOCK_PRODUCTS));
  }
  if (!localStorage.getItem(STORAGE_KEY_COMPARISONS)) {
    localStorage.setItem(STORAGE_KEY_COMPARISONS, JSON.stringify([]));
  }
  
  // Initialize Categories from Default List if empty
  if (!localStorage.getItem(STORAGE_KEY_CATEGORIES)) {
    const initialCategories: CategoryDefinition[] = DEFAULT_CATEGORIES.map(name => ({
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name: name,
      slug: name.toLowerCase().replace(/\s+/g, '-'),
      comparisonFields: GET_DEFAULT_SPECS(name),
      contentTone: 'Professional'
    }));
    localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(initialCategories));
  }
};

initData();

export const dataService = {
  // --- CATEGORIES (Dynamic Architecture) ---
  getCategories: (): CategoryDefinition[] => {
    const data = localStorage.getItem(STORAGE_KEY_CATEGORIES);
    return data ? JSON.parse(data) : [];
  },

  getCategoryByName: (name: string): CategoryDefinition | undefined => {
    const categories = dataService.getCategories();
    return categories.find(c => c.name === name);
  },

  // ✨ UPDATED: Full Schema Support
  addCategory: (name: string, customFields?: string[], tone?: string) => {
    const categories = dataService.getCategories();
    const slug = name.trim().toLowerCase().replace(/\s+/g, '-');
    
    if (categories.some(c => c.slug === slug)) return; // Prevent duplicates

    const newCat: CategoryDefinition = {
      id: slug,
      name: name.trim(),
      slug: slug,
      description: `All about ${name}`,
      comparisonFields: customFields || ['Price', 'Features', 'Performance', 'Value'],
      contentTone: tone || 'Professional' // Save AI Tone
    };
    
    categories.push(newCat);
    localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(categories));
  },

  deleteCategory: (id: string) => {
    const categories = dataService.getCategories();
    const filtered = categories.filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(filtered));
  },

  // --- PRODUCTS ---
  getProducts: (): Product[] => {
    const data = localStorage.getItem(STORAGE_KEY_PRODUCTS);
    return data ? JSON.parse(data) : [];
  },

  getProductById: (id: string): Product | undefined => {
    const products = dataService.getProducts();
    return products.find(p => p.id === id);
  },

  saveProduct: (product: Product) => {
    const products = dataService.getProducts();
    const index = products.findIndex(p => p.id === product.id);
    if (index >= 0) {
      products[index] = product;
    } else {
      products.push(product);
    }
    localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(products));
  },

  // --- COMPARISONS ---
  getComparisons: (): ComparisonResult[] => {
    const data = localStorage.getItem(STORAGE_KEY_COMPARISONS);
    return data ? JSON.parse(data) : [];
  },

  getComparisonBySlug: (idA: string, idB: string): ComparisonResult | undefined => {
    const comparisons = dataService.getComparisons();
    return comparisons.find(c => 
      (c.productAId === idA && c.productBId === idB) || 
      (c.productAId === idB && c.productBId === idA)
    );
  },

  saveComparison: (comparison: ComparisonResult) => {
    const comparisons = dataService.getComparisons();
    const filtered = comparisons.filter(c => 
      !((c.productAId === comparison.productAId && c.productBId === comparison.productBId) ||
        (c.productAId === comparison.productBId && c.productBId === comparison.productAId))
    );
    filtered.push(comparison);
    localStorage.setItem(STORAGE_KEY_COMPARISONS, JSON.stringify(filtered));
  },

  getPotentialCombinationsCount: (): number => {
    // Logic: Calculate pairings PER category to be more accurate
    const products = dataService.getProducts();
    const categories = dataService.getCategories();
    let totalPairs = 0;

    categories.forEach(cat => {
      const pInCat = products.filter(p => p.category === cat.name).length;
      totalPairs += (pInCat * (pInCat - 1)) / 2;
    });

    return totalPairs;
  }
};
