import { Type } from "@google/genai";
import { ai, MODEL_NAME } from "../core";
import { TrendItem } from '../../types';

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
