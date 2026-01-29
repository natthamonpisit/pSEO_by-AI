import { GoogleGenAI } from "@google/genai";

// ---------------------------------------------------------------------------
// [J's Architecture Note]
// 🧠 CORE AI MODULE
// เก็บ Config กลางของ AI เพื่อไม่ให้ประกาศซ้ำซ้อน
// ---------------------------------------------------------------------------

export const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const MODEL_NAME = 'gemini-3-flash-preview'; 

// Helper สำหรับ Monetization (ใช้ร่วมกันหลาย Agent)
export const generateAffiliateLink = async (productName: string): Promise<string> => {
  // STRATEGY 1: Search Link (Safe & Simple)
  const affiliateID = "POOK_AFF_ID"; 
  const encodedName = encodeURIComponent(productName);
  return `https://shopee.co.th/search?keyword=${encodedName}&utm_source=${affiliateID}`;
};
