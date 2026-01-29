import { Product } from './types';

// J's Note: Mock Data ชุดนี้ใช้แทน Table 'products' ใน Supabase
// อัปเดตข้อมูลให้ตรงกับ Schema ใหม่ (Category Enum + Tags)
export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'iPhone 16 Pro',
    price: 999,
    currency: 'USD',
    brand: 'Apple',
    category: 'Smartphone',
    tags: ['Flagship', 'iOS', 'Professional Camera', 'Titanium'],
    specs: {
      'Screen': '6.1" OLED 120Hz',
      'Processor': 'A18 Pro',
      'Camera': '48MP Main + 12MP Ultra',
      'Battery': '3274 mAh'
    },
    imageUrl: 'https://picsum.photos/seed/iphone16/300/300',
    affiliateLink: 'https://apple.com'
  },
  {
    id: 'p2',
    name: 'Samsung Galaxy S24',
    price: 799,
    currency: 'USD',
    brand: 'Samsung',
    category: 'Smartphone',
    tags: ['Flagship', 'Android', 'AI Phone', 'Compact'],
    specs: {
      'Screen': '6.2" AMOLED 120Hz',
      'Processor': 'Snapdragon 8 Gen 3',
      'Camera': '50MP Main + 10MP Tele',
      'Battery': '4000 mAh'
    },
    imageUrl: 'https://picsum.photos/seed/s24/300/300',
    affiliateLink: 'https://samsung.com'
  },
  {
    id: 'p3',
    name: 'Google Pixel 9',
    price: 699,
    currency: 'USD',
    brand: 'Google',
    category: 'Smartphone',
    tags: ['High-End', 'Android', 'Best Camera Software', 'Clean UI'],
    specs: {
      'Screen': '6.3" OLED 90Hz',
      'Processor': 'Google Tensor G4',
      'Camera': '50MP Main',
      'Battery': '4575 mAh'
    },
    imageUrl: 'https://picsum.photos/seed/pixel9/300/300',
    affiliateLink: 'https://store.google.com'
  },
  {
    id: 'p4',
    name: 'Xiaomi 14',
    price: 650,
    currency: 'USD',
    brand: 'Xiaomi',
    category: 'Smartphone',
    tags: ['Flagship Killer', 'Android', 'Leica Lens'],
    specs: {
      'Screen': '6.36" LTPO OLED',
      'Processor': 'Snapdragon 8 Gen 3',
      'Camera': 'Leica Lens 50MP',
      'Battery': '4610 mAh'
    },
    imageUrl: 'https://picsum.photos/seed/xiaomi14/300/300',
    affiliateLink: 'https://mi.com'
  },
  {
    id: 'p5',
    name: 'Sony WH-1000XM5',
    price: 348,
    currency: 'USD',
    brand: 'Sony',
    category: 'Headphones',
    tags: ['Noise Cancelling', 'Audiophile', 'Over-Ear'],
    specs: {
      'Type': 'Over-Ear',
      'Battery Life': '30 Hours',
      'Driver': '30mm',
      'Weight': '250g'
    },
    imageUrl: 'https://picsum.photos/seed/sonyxm5/300/300',
    affiliateLink: 'https://sony.com'
  },
  {
    id: 'p6',
    name: 'Bose QuietComfort Ultra',
    price: 429,
    currency: 'USD',
    brand: 'Bose',
    category: 'Headphones',
    tags: ['Noise Cancelling', 'Comfort', 'Premium'],
    specs: {
      'Type': 'Over-Ear',
      'Battery Life': '24 Hours',
      'Driver': 'Custom',
      'Weight': '254g'
    },
    imageUrl: 'https://picsum.photos/seed/boseqc/300/300',
    affiliateLink: 'https://bose.com'
  }
];