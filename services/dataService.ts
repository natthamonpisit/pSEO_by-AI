
import { Product, ComparisonResult, CategoryDefinition, DEFAULT_CATEGORIES, SystemLog } from '../types';
import { MOCK_PRODUCTS } from '../constants';

// ---------------------------------------------------------------------------
// [J's Architecture Refactor - Clean Architecture]
// 
// เราเปลี่ยนจาก Direct LocalStorage Access มาใช้ "Repository Pattern"
// เพื่อให้ Business Logic ไม่ยึดติดกับ Infrastructure (LocalStorage)
// วันหน้าถ้าจะเปลี่ยนไปใช้ Supabase ก็แค่สร้าง Class ใหม่มาเสียบแทน (Liskov Substitution Principle)
// ---------------------------------------------------------------------------

const STORAGE_KEYS = {
  PRODUCTS: 'pseo_products',
  COMPARISONS: 'pseo_comparisons',
  CATEGORIES: 'pseo_categories',
  LOGS: 'pseo_system_logs'
};

// 1. Define the Contract (Interface) - นี่คือ "Port" ใน Hexagonal Architecture
interface IDataRepository {
  // Categories
  getCategories(): CategoryDefinition[];
  saveCategory(category: CategoryDefinition): void;
  deleteCategory(id: string): void;

  // Products
  getProducts(): Product[];
  getProductById(id: string): Product | undefined;
  saveProduct(product: Product): void;

  // Comparisons
  getComparisons(): ComparisonResult[];
  saveComparison(comparison: ComparisonResult): void;
  
  // Observability
  log(level: SystemLog['level'], agent: SystemLog['agent'], message: string, details?: string): void;
  getLogs(): SystemLog[];
}

// 2. The Implementation (Adapter) - อันนี้คือ "Adapter" สำหรับ LocalStorage
class LocalStorageRepository implements IDataRepository {
  
  constructor() {
    this.initSeedData();
  }

  private initSeedData() {
    if (typeof window === 'undefined') return;

    if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(MOCK_PRODUCTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.COMPARISONS)) {
      localStorage.setItem(STORAGE_KEYS.COMPARISONS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
      const initialCategories: CategoryDefinition[] = DEFAULT_CATEGORIES.map(name => ({
        id: name.toLowerCase().replace(/\s+/g, '-'),
        name: name,
        slug: name.toLowerCase().replace(/\s+/g, '-'),
        comparisonFields: this.getDefaultSpecs(name),
        contentTone: 'Professional'
      }));
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(initialCategories));
    }
    if (!localStorage.getItem(STORAGE_KEYS.LOGS)) {
        localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify([]));
    }
  }

  private getDefaultSpecs(category: string): string[] {
    const map: Record<string, string[]> = {
        'Smartphone': ['Display', 'Processor', 'Camera', 'Battery', 'Charging'],
        'Laptop': ['CPU', 'GPU', 'RAM', 'Storage', 'Display', 'Weight'],
        'Headphones': ['Sound Quality', 'Noise Cancellation', 'Battery Life', 'Comfort', 'Connectivity'],
        'Camera': ['Sensor Size', 'Resolution', 'Video Capabilities', 'Autofocus', 'ISO Range'],
        'Smartwatch': ['Battery Life', 'Health Sensors', 'Display', 'Water Resistance', 'Compatibility']
      };
    return map[category] || ['Price', 'Features', 'Build Quality', 'Performance'];
  }

  // --- Implementation Methods ---

  getCategories(): CategoryDefinition[] {
    const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    return data ? JSON.parse(data) : [];
  }

  saveCategory(category: CategoryDefinition): void {
    const categories = this.getCategories();
    // Update if exists, else push
    const index = categories.findIndex(c => c.id === category.id);
    if (index >= 0) categories[index] = category;
    else categories.push(category);
    
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  }

  deleteCategory(id: string): void {
    const categories = this.getCategories();
    const filtered = categories.filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(filtered));
  }

  getProducts(): Product[] {
    const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    return data ? JSON.parse(data) : [];
  }

  getProductById(id: string): Product | undefined {
    return this.getProducts().find(p => p.id === id);
  }

  saveProduct(product: Product): void {
    const products = this.getProducts();
    const index = products.findIndex(p => p.id === product.id);
    if (index >= 0) products[index] = product;
    else products.push(product);
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }

  getComparisons(): ComparisonResult[] {
    const data = localStorage.getItem(STORAGE_KEYS.COMPARISONS);
    return data ? JSON.parse(data) : [];
  }

  saveComparison(comparison: ComparisonResult): void {
    const comparisons = this.getComparisons();
    // Prevent duplicates logic
    const filtered = comparisons.filter(c => 
      !((c.productAId === comparison.productAId && c.productBId === comparison.productBId) ||
        (c.productAId === comparison.productBId && c.productBId === comparison.productAId))
    );
    filtered.push(comparison);
    localStorage.setItem(STORAGE_KEYS.COMPARISONS, JSON.stringify(filtered));
  }

  log(level: SystemLog['level'], agent: SystemLog['agent'], message: string, details?: string): void {
    const logs = this.getLogs();
    const newLog: SystemLog = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        level,
        agent,
        message,
        details
    };
    // Keep only last 100 logs to prevent LocalStorage bloat (Scalability concern)
    const updatedLogs = [newLog, ...logs].slice(0, 100);
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(updatedLogs));
  }

  getLogs(): SystemLog[] {
    const data = localStorage.getItem(STORAGE_KEYS.LOGS);
    return data ? JSON.parse(data) : [];
  }
}

// 3. The Service Layer (Facade)
// ตัว App จะเรียกใช้ object นี้ โดยไม่สนว่าไส้ในเป็น LocalStorageRepository
const repository = new LocalStorageRepository();

export const dataService = {
  // Pass-through methods
  getCategories: () => repository.getCategories(),
  getCategoryByName: (name: string) => repository.getCategories().find(c => c.name === name),
  
  addCategory: (name: string, customFields?: string[], tone?: string) => {
    const slug = name.trim().toLowerCase().replace(/\s+/g, '-');
    const categories = repository.getCategories();
    if (categories.some(c => c.slug === slug)) return; 

    const newCat: CategoryDefinition = {
      id: slug,
      name: name.trim(),
      slug: slug,
      description: `All about ${name}`,
      comparisonFields: customFields || ['Price', 'Features', 'Performance', 'Value'],
      contentTone: tone || 'Professional'
    };
    repository.saveCategory(newCat);
    repository.log('INFO', 'SYSTEM', `Category created: ${name}`);
  },

  deleteCategory: (id: string) => {
    repository.deleteCategory(id);
    repository.log('WARNING', 'SYSTEM', `Category deleted: ${id}`);
  },

  getProducts: () => repository.getProducts(),
  getProductById: (id: string) => repository.getProductById(id),
  saveProduct: (product: Product) => {
      repository.saveProduct(product);
      repository.log('SUCCESS', 'SYSTEM', `Product saved: ${product.name}`);
  },

  getComparisons: () => repository.getComparisons(),
  getComparisonBySlug: (idA: string, idB: string) => {
    const comparisons = repository.getComparisons();
    return comparisons.find(c => 
      (c.productAId === idA && c.productBId === idB) || 
      (c.productAId === idB && c.productBId === idA)
    );
  },
  saveComparison: (comparison: ComparisonResult) => {
      repository.saveComparison(comparison);
      repository.log('SUCCESS', 'ANALYST', `Comparison generated: ${comparison.title}`);
  },

  getPotentialCombinationsCount: (): number => {
    const products = repository.getProducts();
    const categories = repository.getCategories();
    let totalPairs = 0;
    categories.forEach(cat => {
      const pInCat = products.filter(p => p.category === cat.name).length;
      totalPairs += (pInCat * (pInCat - 1)) / 2;
    });
    return totalPairs;
  },

  // Observability
  log: (level: SystemLog['level'], agent: SystemLog['agent'], message: string, details?: string) => {
      repository.log(level, agent, message, details);
  },
  getLogs: () => repository.getLogs()
};
