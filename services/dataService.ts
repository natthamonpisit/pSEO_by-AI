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

/**
 * 🛠️ Helper: Get default comparison fields based on category name.
 * Used when the AI hasn't generated a template yet or as a fallback.
 * 
 * @param category - The name of the category (e.g., "Smartphone")
 * @returns Array of spec keys (e.g., ["Camera", "Battery"])
 */
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

/**
 * 🛠️ Helper: Initialize local storage with Seed Data.
 * Ensures the app has dummy data to show on the first load.
 */
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
  
  /**
   * 📖 Read: Get all active categories.
   */
  getCategories: (): CategoryDefinition[] => {
    const data = localStorage.getItem(STORAGE_KEY_CATEGORIES);
    return data ? JSON.parse(data) : [];
  },

  /**
   * 🔍 Search: Find a category definition by its name.
   */
  getCategoryByName: (name: string): CategoryDefinition | undefined => {
    const categories = dataService.getCategories();
    return categories.find(c => c.name === name);
  },

  /**
   * ✍️ Write: Create a new category with specific AI rules (fields & tone).
   * Prevents duplicates based on slug.
   * 
   * @param name - Category Name
   * @param customFields - (Optional) List of specs AI should focus on
   * @param tone - (Optional) The writing style for this category
   */
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

  /**
   * 🗑️ Delete: Remove a category by ID.
   */
  deleteCategory: (id: string) => {
    const categories = dataService.getCategories();
    const filtered = categories.filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(filtered));
  },

  // --- PRODUCTS ---

  /**
   * 📖 Read: Get all products.
   */
  getProducts: (): Product[] => {
    const data = localStorage.getItem(STORAGE_KEY_PRODUCTS);
    return data ? JSON.parse(data) : [];
  },

  /**
   * 🔍 Search: Find a product by ID.
   */
  getProductById: (id: string): Product | undefined => {
    const products = dataService.getProducts();
    return products.find(p => p.id === id);
  },

  /**
   * ✍️ Write: Save or Update a product.
   * If ID exists, update; otherwise, insert new.
   */
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

  /**
   * 📖 Read: Get all generated comparison pages.
   */
  getComparisons: (): ComparisonResult[] => {
    const data = localStorage.getItem(STORAGE_KEY_COMPARISONS);
    return data ? JSON.parse(data) : [];
  },

  /**
   * 🔍 Search: Find an existing comparison between two products.
   * Checks both directions (A vs B and B vs A).
   */
  getComparisonBySlug: (idA: string, idB: string): ComparisonResult | undefined => {
    const comparisons = dataService.getComparisons();
    return comparisons.find(c => 
      (c.productAId === idA && c.productBId === idB) || 
      (c.productAId === idB && c.productBId === idA)
    );
  },

  /**
   * ✍️ Write: Save a generated comparison to the database.
   * Overwrites if a comparison between these two IDs already exists.
   */
  saveComparison: (comparison: ComparisonResult) => {
    const comparisons = dataService.getComparisons();
    const filtered = comparisons.filter(c => 
      !((c.productAId === comparison.productAId && c.productBId === comparison.productBId) ||
        (c.productAId === comparison.productBId && c.productBId === comparison.productAId))
    );
    filtered.push(comparison);
    localStorage.setItem(STORAGE_KEY_COMPARISONS, JSON.stringify(filtered));
  },

  /**
   * 📊 Analytics: Calculate total possible pages (N * (N-1) / 2)
   * Groups calculation by Category to be accurate.
   */
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
