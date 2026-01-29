import { Type } from "@google/genai";
import { ai, MODEL_NAME, generateAffiliateLink } from "../core";
import { Product } from '../../types';

// 🤖 AGENT 2: The Clerk (Spec Management)

/**
 * 🧠 AI Architect: Generate Category Template
 * 
 * Analyzes a category name (e.g., "Drone") and decides:
 * 1. What specs matter most? (Flight time, Range, Camera)
 * 2. What tone should be used? (Adventurous, Technical)
 * 
 * @param categoryName - The user-input category
 */
export const generateSpecTemplate = async (categoryName: string): Promise<{fields: string[], tone: string}> => {
  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      fields: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "List of 5-6 technical specs critical for comparing products in this category."
      },
      tone: {
        type: Type.STRING,
        description: "The best writing tone for this audience (e.g. 'Professional', 'Fun', 'Empathic')"
      }
    }
  };

  const prompt = `
    Role: You are a Product Expert and Brand Strategist.
    Task: Define the "Comparison Spec Template" and "Brand Voice" for the product category: "${categoryName}".
    Output Format: JSON only.
  `;

  try {
    const result = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema
      }
    });

    const text = result.text;
    const fallback = { fields: ["Features", "Performance", "Value"], tone: "Professional and Objective" };
    if (!text) return fallback;
    const json = JSON.parse(text);
    return { fields: json.fields || fallback.fields, tone: json.tone || fallback.tone };
  } catch (error) {
    return { fields: ["Features", "Performance", "Value"], tone: "Professional and Objective" };
  }
};

/**
 * 🐍 [TIER B] Python Scraper Simulation
 * 
 * Mock function to simulate a backend worker (e.g., Beautiful Soup / Selenium).
 * In a real app, this would be an API call to a Python service on Railway.app.
 */
const callPythonScraperWorker = async (productName: string): Promise<Partial<Product> | null> => {
  console.log(`🐍 calling Python Worker for: ${productName}...`);
  await new Promise(r => setTimeout(r, 2000)); // Simulate Latency

  const isTechProduct = /iphone|samsung|xiaomi|pixel|sony|bose/i.test(productName);
  
  if (isTechProduct) {
    console.log("✅ [PYTHON WORKER] Scraped data successfully!");
    // Default to TH behavior for simulation unless context provided
    const affLink = await generateAffiliateLink(productName, 'TH');
    return {
      name: productName,
      price: 0, 
      currency: 'USD',
      brand: productName.split(' ')[0],
      specs: {
        'Scraped_Source': 'GSMArena/Official (Simulated)',
        'Display': 'Scraped Data: OLED 120Hz',
        'Processor': 'Scraped Data: Latest Gen Chip',
        'Battery': 'Scraped Data: 5000mAh',
        'Status': 'Auto-filled by Python BS4'
      },
      tags: ['#PythonScraper', '#TierB', '#FreeData'],
      imageUrl: `https://source.unsplash.com/random/300x300/?${encodeURIComponent(productName)}`,
      affiliateLink: affLink
    };
  }
  return null;
};

/**
 * 🔍 Main Enrichment Logic (The Clerk)
 * 
 * Strategy:
 * 1. Try to fetch data via Python Scraper (Cheap/Free).
 * 2. If Python fails, fallback to Gemini AI with Google Search (Cost money but accurate).
 * 3. Also generates the correct Affiliate Link based on Language.
 * 
 * @param productName - Product to search for
 * @param category - Product category
 * @param requiredFields - Specs to find
 * @param targetLanguage - 'TH' or 'EN'
 */
export const enrichProductSpecs = async (
  productName: string, 
  category: string, 
  requiredFields: string[],
  targetLanguage: 'TH' | 'EN' = 'TH' // 👈 NEW Parameter
): Promise<Partial<Product>> => {
  
  // 1. First Line of Defense: Python Scraper
  try {
    const scrapedData = await callPythonScraperWorker(productName);
    // If scraper worked, we might need to update link if language is EN
    if (scrapedData) {
       if (targetLanguage === 'EN') {
         scrapedData.affiliateLink = await generateAffiliateLink(productName, 'EN');
       }
       return { ...scrapedData, category };
    }
  } catch (e) {
    console.warn("Python worker failed, falling back to Gemini...");
  }

  // 2. Second Line of Defense: Gemini
  console.log("🤖 [AI FALLBACK] Agent 2 is researching web for:", productName);
  
  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      price: { type: Type.NUMBER, description: "Estimated price in USD" },
      brand: { type: Type.STRING, description: "Brand name" },
      specs: { type: Type.OBJECT, properties: {} },
      tags: { type: Type.ARRAY, items: { type: Type.STRING } }
    }
  };

  const prompt = `
    Role: You are a Data Entry Specialist.
    Task: Find technical specifications for: "${productName}" (Category: ${category}).
    Context: Search for OFFICIAL specs. Fields: ${requiredFields.join(', ')}.
    Output: JSON only.
  `;

  try {
    const result = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        tools: [{ googleSearch: {} }] 
      }
    });

    const text = result.text;
    if (!text) throw new Error("No enrichment data found");
    const json = JSON.parse(text);
    
    // ✨ Dynamic Link Generation based on Language
    const affLink = await generateAffiliateLink(productName, targetLanguage);

    return {
      name: productName,
      price: json.price || 0,
      currency: 'USD',
      brand: json.brand || 'Unknown',
      category: category,
      tags: json.tags || [],
      specs: json.specs || {},
      imageUrl: `https://source.unsplash.com/random/300x300/?${encodeURIComponent(productName)}`, 
      affiliateLink: affLink
    };

  } catch (error) {
    console.error("Enrichment Error:", error);
    return { name: productName, category: category, specs: {}, tags: ['New Arrival'], affiliateLink: '#' };
  }
};
