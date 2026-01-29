// ---------------------------------------------------------------------------
// J's Note: Core Data Structure
// ห้ามเปลี่ยน Structure นี้โดยพละการ เพราะจะกระทบทั้ง AI Generator และ Frontend Display
// ---------------------------------------------------------------------------

// 🏗️ CATEGORY ARCHITECTURE (Dynamic Silo Structure)
// เจเปลี่ยนจาก Enum ตายตัว มาเป็น Interface เพื่อให้ User เพิ่มหมวดหมู่ได้เอง
// แต่ยังเก็บ Default Values ไว้เป็น Seed Data เริ่มต้นครับ

export const DEFAULT_CATEGORIES = [
  'Smartphone',
  'Laptop',
  'Tablet',
  'Smartwatch',
  'Headphones',
  'Camera',
  'Gaming Console',
  'Smart Home'
];

export interface CategoryDefinition {
  id: string;
  name: string;
  slug: string; // for SEO URL structure (e.g., /smart-home)
  description?: string;
  // ✨ NEW: Dynamic Spec Template
  // เรากำหนดเลยว่าหมวดนี้ "ต้อง" เปรียบเทียบเรื่องอะไรบ้าง เพื่อให้ตารางเปรียบเทียบออกมาสวยและครบถ้วน
  comparisonFields: string[]; 
  // ✨ NEW: AI Persona/Tone
  // กำหนดน้ำเสียงการเขียนให้เหมาะกับกลุ่มเป้าหมาย (เช่น "Excited Gamer" vs "Professional Business")
  contentTone?: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  currency: string;
  brand: string;
  category: string; // 👈 เปลี่ยนเป็น String เพื่อรองรับหมวดหมู่ใหม่ๆ ในอนาคต
  tags: string[];   // 👈 AI สามารถเพิ่ม Tags ใหม่ๆ ลงในนี้ได้อิสระ
  specs: Record<string, string>; // Flexible specs (e.g., RAM, Screen, Battery)
  imageUrl: string;
  affiliateLink: string;
}

// โครงสร้างที่ AI จะ Return กลับมา (Structured Output)
export interface ComparisonResult {
  id: string;
  productAId: string;
  productBId: string;
  generatedAt: string; // ISO Date
  language: 'TH' | 'EN'; // 👈 NEW: Support Multi-language
  
  // AI Generated Content
  title: string;
  intro: string;
  winnerId: string;
  verdict: string; // The "User Opinion" part for SEO
  
  // Structured Comparison for Table
  specComparison: {
    feature: string;
    valueA: string;
    valueB: string;
    winner: 'A' | 'B' | 'Draw';
  }[];

  scoreA: number; // 0-10
  scoreB: number; // 0-10
  prosA: string[];
  consA: string[];
  prosB: string[];
  consB: string[];
  
  // 🤖 NEW: SEO & AI Optimization
  faqs: { question: string; answer: string }[]; // For Voice Search & Featured Snippets
}

export enum ComparisonStatus {
  PENDING = 'PENDING',
  GENERATING = 'GENERATING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

export interface GenerationTask {
  productA: Product;
  productB: Product;
  status: ComparisonStatus;
  targetLanguage: 'TH' | 'EN'; // 👈 NEW: Task-specific language
}

// 🦅 Agent -1: The Hunter Data Structure
export interface TrendItem {
  id: string;
  productName: string;
  category: string;
  newsHeadline: string;
  reason: string; // Why is this interesting today?
  launchDate?: string;
  // ✨ NEW: Agent 1.5 Integration
  // Hunter สามารถส่งข้อมูล Spec ดิบๆ ต่อให้ระบบ Product Manager ได้เลย
  suggestedSpecs?: Record<string, string>;
  suggestedPrice?: number;
  status: 'NEW' | 'ENRICHING' | 'READY_TO_ADD' | 'ADDED';
}
