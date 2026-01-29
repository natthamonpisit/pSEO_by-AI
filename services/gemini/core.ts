import { GoogleGenAI, Type } from "@google/genai";

// ---------------------------------------------------------------------------
// [J's Architecture Note]
// 🧠 CORE AI MODULE
// เก็บ Config กลางของ AI เพื่อไม่ให้ประกาศซ้ำซ้อน
// ---------------------------------------------------------------------------

export const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const MODEL_NAME = 'gemini-3-flash-preview'; 

/**
 * 💰 Hybrid Monetization Strategy Engine
 * 
 * Logic:
 * 1. THAI Market (🇹🇭):
 *    - Uses "Shopee Search Link" logic.
 *    - Why: High conversion rate, user finds stock easily even if one shop is OOS.
 * 
 * 2. GLOBAL Market (🌍):
 *    - Uses "Official Site Search" via Gemini Grounding.
 *    - Why: Skimlinks/VigLink Javascript on the frontend will auto-convert 
 *      these official domains (e.g., samsung.com) into affiliate links.
 * 
 * @param productName - Name of the product
 * @param targetLanguage - 'TH' or 'EN'
 * @returns An optimized URL string
 */
export const generateAffiliateLink = async (productName: string, targetLanguage: 'TH' | 'EN' = 'TH'): Promise<string> => {
  
  if (targetLanguage === 'TH') {
    // STRATEGY 1: Shopee Search (Safe & Simple for Thai Market)
    const affiliateID = "POOK_AFF_ID"; 
    const encodedName = encodeURIComponent(productName);
    return `https://shopee.co.th/search?keyword=${encodedName}&utm_source=${affiliateID}`;
  } else {
    // STRATEGY 2: Official Link Hunt (For Skimlinks Global)
    // ให้ AI หาเว็บ Official ให้เลย
    const prompt = `Find the official product page URL for: "${productName}". Return ONLY the URL string.`;
    
    try {
      const result = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }] 
        }
      });
      
      const url = result.candidates?.[0]?.groundingMetadata?.groundingChunks?.[0]?.web?.uri;
      return url || `https://www.google.com/search?q=${encodeURIComponent(productName)}`;
    } catch (e) {
      return `https://www.google.com/search?q=${encodeURIComponent(productName)}`;
    }
  }
};
