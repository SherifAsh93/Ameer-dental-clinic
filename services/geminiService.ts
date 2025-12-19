
import { GoogleGenAI, Type } from "@google/genai";
import { DiagnosisResult } from "../types";

// FIX: Implemented GeminiService using the @google/genai SDK to provide AI diagnostics
class GeminiService {
  /**
   * Analyzes dental symptoms and returns structured diagnostic suggestions.
   * Uses the gemini-3-pro-preview model for high-quality complex reasoning.
   */
  async analyzeSymptoms(query: string): Promise<DiagnosisResult> {
    // FIX: Always use a named parameter for apiKey and obtain it from process.env.API_KEY
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // FIX: Selected gemini-3-pro-preview for complex text analysis tasks as per coding guidelines
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Perform a clinical analysis on the following dental case: ${query}`,
      config: {
        systemInstruction: "You are 'Ameer AI', an advanced dental consultant. Provide professional clinical analysis, risk assessment, and recommended steps. Your output must be in valid JSON format.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            riskLevel: {
              type: Type.STRING,
              enum: ['High', 'Medium', 'Low'],
              description: 'The estimated urgency level of the case.'
            },
            analysis: {
              type: Type.STRING,
              description: 'A detailed dental clinical analysis of the symptoms.'
            },
            suggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Recommended diagnostic or treatment steps.'
            }
          },
          required: ['riskLevel', 'analysis', 'suggestions'],
          propertyOrdering: ["riskLevel", "analysis", "suggestions"]
        }
      }
    });

    // FIX: Access the text property directly on the GenerateContentResponse object
    const text = response.text;
    if (!text) {
      throw new Error("The AI model returned an empty response.");
    }

    try {
      return JSON.parse(text) as DiagnosisResult;
    } catch (error) {
      console.error("AI Response parsing error:", text);
      throw new Error("Failed to parse diagnostic result from AI.");
    }
  }
}

// FIX: Exported service instance to resolve module import issues in AIConsultant.tsx
export const geminiService = new GeminiService();
