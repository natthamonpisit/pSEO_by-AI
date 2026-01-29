import { GoogleGenAI, Type } from "@google/genai";
import { Product, ComparisonResult, TrendItem } from '../types';

// ---------------------------------------------------------------------------
// [J's Architecture Note]
// 📌 PYTHON WORKER BRIDGE
//
// นี่คือส่วนที่เชื่อมต่อกับ Python Backend บน Railway (Tier B Strategy)
// ---------------------------------------------------------------------------

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const MODEL_NAME = 'gemini-3-flash-preview'; 

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
    return {
      fields: json.fields || fallback.fields,
      tone: json.tone || fallback.tone
    };

  } catch (error) {
    console.error("Spec Template Generation Error:", error);
    return { fields: ["Features", "Performance", "Value"], tone: "Professional and Objective" };
  }
};

// 🐍 [TIER B] Python Scraper Simulation
// Part of Agent 2's workflow
const callPythonScraperWorker = async (productName: string): Promise<Partial<Product> | null> => {
  console.log(`🐍 calling Python Worker for: ${productName}...`);
  
  // Simulate Network Latency (Scraping takes 2-3 seconds)
  await new Promise(r => setTimeout(r, 2000));

  const isTechProduct = /iphone|samsung|xiaomi|pixel|sony|bose/i.test(productName);
  
  if (isTechProduct) {
    console.log("✅ [PYTHON WORKER] Scraped data successfully!");
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
      affiliateLink: `https://www.google.com/search?q=buy+${encodeURIComponent(productName)}`
    };
  }
  
  console.warn("⚠️ [PYTHON WORKER] Could not find spec table. Falling back to Gemini.");
  return null;
};

// 🤖 AGENT 2: The Clerk (Spec Extractor)
// Logic: Try Python Scraper (Free) -> If Fail -> Try Gemini Search (Paid)
export const enrichProductSpecs = async (productName: string, category: string, requiredFields: string[]): Promise<Partial<Product>> => {
  
  // 1. First Line of Defense: Python Scraper (Free - Tier B)
  try {
    const scrapedData = await callPythonScraperWorker(productName);
    if (scrapedData) {
      return {
        ...scrapedData,
        category // Ensure category is consistent
      };
    }
  } catch (e) {
    console.warn("Python worker failed, falling back to Gemini...");
  }

  // 2. Second Line of Defense: Gemini Search Agent (Costlier but reliable)
  console.log("🤖 [AI FALLBACK] Agent 2 is researching web for:", productName);
  
  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      price: { type: Type.NUMBER, description: "Estimated price in USD" },
      brand: { type: Type.STRING, description: "Brand name" },
      specs: { 
        type: Type.OBJECT, 
        description: "Key-value pairs of specs found",
        properties: {}, // Allow dynamic properties
      },
      tags: { type: Type.ARRAY, items: { type: Type.STRING } }
    }
  };

  const prompt = `
    Role: You are a Data Entry Specialist.
    Task: Find technical specifications for: "${productName}" (Category: ${category}).
    
    Context:
    - Search the web for the OFFICIAL specs.
    - Specifically look for these fields: ${requiredFields.join(', ')}.
    - Extract the estimated launch price (USD).
    - Generate 3-4 SEO tags.
    
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

    return {
      name: productName,
      price: json.price || 0,
      currency: 'USD',
      brand: json.brand || 'Unknown',
      category: category,
      tags: json.tags || [],
      specs: json.specs || {},
      imageUrl: `https://source.unsplash.com/random/300x300/?${encodeURIComponent(productName)}`, 
      affiliateLink: `https://www.google.com/search?q=buy+${encodeURIComponent(productName)}` 
    };

  } catch (error) {
    console.error("Enrichment Error:", error);
    return {
      name: productName,
      category: category,
      specs: {},
      tags: ['New Arrival']
    };
  }
};

// 🦅 AGENT 1: The Hunter (Daily Trends)
export const getDailyTrends = async (category: string): Promise<TrendItem[]> => {
  const prompt = `
    Role: You are a Tech Trend Hunter.
    Task: Find the hottest, newly released, or trending product in the category: "${category}" TODAY or THIS WEEK.
    Output Format: JSON array only.
  `;

  try {
    const result = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }] 
      }
    });

    let text = result.text || "[]";
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const json = JSON.parse(text);
    
    return json.map((item: any, idx: number) => ({
      id: `trend-${category}-${idx}-${Date.now()}`,
      category: category,
      productName: item.productName,
      newsHeadline: item.newsHeadline,
      reason: item.reason,
      launchDate: item.launchDate,
      status: 'NEW'
    }));

  } catch (error) {
    console.error(`Hunter Agent failed for ${category}:`, error);
    return [];
  }
};

// 🦅 AGENT 1: The Hunter (Competitor Spotter Variant)
export const discoverCompetitors = async (productName: string): Promise<{name: string, reason: string}[]> => {
  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      competitors: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: "Full product name of the competitor" },
            reason: { type: Type.STRING, description: "Why is this a direct competitor? (Price tier/Specs)" }
          }
        }
      }
    }
  };

  const prompt = `
    Task: Identify the top 3 direct market competitors for: "${productName}".
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
    if (!text) return [];
    const json = JSON.parse(text);
    return json.competitors || [];

  } catch (error) {
    return [];
  }
};

// 🧠 AGENT 3 & 4: The Analyst & The Editor
// This function combines logic (Agent 3) and writing (Agent 4)
export const generateComparisonContent = async (
  p1: Product, 
  p2: Product,
  focusFields: string[],
  tone: string = "Professional"
): Promise<ComparisonResult> => {

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: "SEO Optimized Title (H1)" },
      intro: { type: Type.STRING, description: "Hook reader in 2-3 sentences" },
      verdict: { type: Type.STRING, description: "Final Conclusion & Buying Advice" },
      winnerId: { type: Type.STRING, description: "ID of the overall winner" },
      scoreA: { type: Type.NUMBER, description: "Score 0-10" },
      scoreB: { type: Type.NUMBER, description: "Score 0-10" },
      prosA: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Top 3 Pros" },
      consA: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Top 3 Cons" },
      prosB: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Top 3 Pros" },
      consB: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Top 3 Cons" },
      specComparison: {
        type: Type.ARRAY,
        description: "Comparison Table",
        items: {
          type: Type.OBJECT,
          properties: {
            feature: { type: Type.STRING, description: "Feature Name" },
            valueA: { type: Type.STRING },
            valueB: { type: Type.STRING },
            winner: { type: Type.STRING, description: "'A', 'B', or 'Draw'" }
          }
        }
      }
    }
  };

  const comparisonInstruction = focusFields.length > 0 
    ? `Compare specifically on these features: ${focusFields.join(', ')}.`
    : `Compare specs line-by-line.`;

  const prompt = `
    Role: You are a Tech Editorial Team.
    Tone: ${tone}.
    Task: Compare ${p1.name} vs ${p2.name}.

    Input Data:
    [Product A] ${p1.name}: ${JSON.stringify(p1.specs)}
    [Product B] ${p2.name}: ${JSON.stringify(p2.specs)}

    Process:
    1. [Agent 3 - Analyst]: ${comparisonInstruction} Identify winner per feature.
    2. [Agent 4 - Editor]: Write content in '${tone}' voice. 
    
    Constraint: Return STRICT JSON.
  `;

  try {
    const result = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        thinkingConfig: { thinkingBudget: 0 } 
      }
    });

    const text = result.text;
    if (!text) throw new Error("No content generated");

    const json = JSON.parse(text);

    return {
      id: `${p1.id}-vs-${p2.id}`,
      productAId: p1.id,
      productBId: p2.id,
      generatedAt: new Date().toISOString(),
      ...json
    };

  } catch (error) {
    console.error("Gemini Generation Error:", error);
    return {
      id: `${p1.id}-vs-${p2.id}`,
      productAId: p1.id,
      productBId: p2.id,
      generatedAt: new Date().toISOString(),
      title: `[Error] ${p1.name} vs ${p2.name}`,
      intro: `Generation failed.`,
      winnerId: p1.id,
      verdict: "Error.",
      scoreA: 0,
      scoreB: 0,
      prosA: [],
      consA: [],
      prosB: [],
      consB: [],
      specComparison: []
    };
  }
};
