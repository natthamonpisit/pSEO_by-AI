import { Type } from "@google/genai";
import { ai, MODEL_NAME } from "../core";
import { Product, ComparisonResult } from '../../types';

// 🧠 AGENT 3 & 4: The Analyst & The Editor
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
      }
    }
  };

  const comparisonInstruction = focusFields.length > 0 
    ? `Compare specifically on these features: ${focusFields.join(', ')}.`
    : `Compare specs line-by-line.`;

  // 📝 UPDATED PROMPT: "Balanced Premium" Tone
  // Reduced "Hard Sell", Increased "Advisory/Curator" vibe.
  const prompt = `
    Role: You are a Trusted Tech Curator (Sophisticated, Insightful, Grounded).
    Task: Compare ${p1.name} vs ${p2.name}.

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
         - Example: "The iPhone 16 Pro isn't just faster; it smooths out the friction in your daily workflow. But does the S24 offer a smarter alternative for less?"
       
       - **VERDICT**:
         - Act as a consultant, not a salesperson.
         - Guide the user: "If you prioritize X, choose A. But for pure value, B is the smart choice."
         - Make it feel like a wise recommendation from a friend who knows tech.

       - **TRANSLATE SPECS**: 
         - Instead of "48MP Camera", say "Capture details that make your memories look professional."
         - Instead of "A18 Chip", say "Handles heavy tasks without breaking a sweat."

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
