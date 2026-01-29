import { Type } from "@google/genai";
import { ai, MODEL_NAME } from "../core";
import { Product, ComparisonResult } from '../../types';

// 🧠 AGENT 3 & 4: The Analyst & The Editor
export const generateComparisonContent = async (
  p1: Product, 
  p2: Product,
  focusFields: string[],
  tone: string = "Professional",
  language: 'TH' | 'EN' = 'TH' // 👈 NEW Parameter
): Promise<ComparisonResult> => {

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: "SEO Optimized Title (H1)" },
      intro: { 
        type: Type.STRING, 
        description: "The 'Hook'. A punchy, insightful paragraph (approx 50-70 words)." 
      },
      verdict: { 
        type: Type.STRING, 
        description: "The 'Advisory Verdict' (approx 150 words). Value-based recommendation." 
      },
      winnerId: { type: Type.STRING, description: "ID of the overall winner." },
      scoreA: { type: Type.NUMBER, description: "Score 0-10" },
      scoreB: { type: Type.NUMBER, description: "Score 0-10" },
      prosA: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Top 3 Pros." },
      consA: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Top 3 Cons" },
      prosB: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Top 3 Pros." },
      consB: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Top 3 Cons" },
      specComparison: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            feature: { type: Type.STRING },
            valueA: { type: Type.STRING },
            valueB: { type: Type.STRING },
            winner: { type: Type.STRING }
          }
        }
      },
      faqs: {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                question: { type: Type.STRING, description: "A common user question (e.g., Which camera is better?)" },
                answer: { type: Type.STRING, description: "A direct, concise answer (max 2 sentences)." }
            }
        },
        description: "3-4 Frequently Asked Questions for Voice Search Optimization."
      }
    }
  };

  const comparisonInstruction = focusFields.length > 0 
    ? `Compare specifically on these features: ${focusFields.join(', ')}.`
    : `Compare specs line-by-line.`;

  // 📝 UPDATED PROMPT: Multi-Language Logic
  const languageInstruction = language === 'TH'
    ? `Language: THAI (ภาษาไทย). Use modern, natural Thai. Use "Baht" or "฿" for currency context.`
    : `Language: ENGLISH. Use Global/US Standard English. Use "USD" or "$" for currency context.`;

  const prompt = `
    Role: You are a Trusted Tech Curator and SEO Specialist.
    Task: Compare ${p1.name} vs ${p2.name}.
    ${languageInstruction}

    Input Data:
    [Product A] ${p1.name}: ${JSON.stringify(p1.specs)} (Price: ${p1.price} ${p1.currency})
    [Product B] ${p2.name}: ${JSON.stringify(p2.specs)} (Price: ${p2.price} ${p2.currency})

    Process & Rules:
    1. [Agent 3 - Analyst]: ${comparisonInstruction}
       - **CRITICAL RULE**: Prioritize PRICE-TO-PERFORMANCE. The most expensive item is NOT always the winner.
    
    2. [Agent 4 - Editor]: Write content using the "Elevated Reviewer" style.
       - **TONE**: Mimic Apple's *clarity* and *brevity*, but remove the "Sales Hype".
       - **DO NOT** use words like: "Magic", "Impossible", "Buy this now", "Unbelievable".
       - **DO** use words like: "Effortless", "Refined", "Capable", "Worthwhile", "Significant upgrade".
       
       - **THE HOOK (Intro)**: 
         - Write a short, elegant opening.
         - Focus on the *User Experience* and *Lifestyle*.
         - Example: "The iPhone 16 Pro isn't just faster; it smooths out the friction in your daily workflow."
       
       - **VERDICT**:
         - Act as a consultant, not a salesperson.
         - Guide the user: "If you prioritize X, choose A. But for pure value, B is the smart choice."
         - Make it feel like a wise recommendation from a friend who knows tech.
         
       - **FAQ Section (SEO Goldmine)**:
         - Generate 3-4 questions that users ask on Google (e.g., "Is A worth the upgrade from B?", "Does A have better battery life?").
         - Provide answers that are *direct* and *definitive*. AI Search engines love direct answers.

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
      language: language,
      ...json,
      faqs: json.faqs || []
    };

  } catch (error) {
    console.error("Gemini Generation Error:", error);
    return {
      id: `${p1.id}-vs-${p2.id}`,
      productAId: p1.id,
      productBId: p2.id,
      generatedAt: new Date().toISOString(),
      language: language,
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
      specComparison: [],
      faqs: []
    };
  }
};
