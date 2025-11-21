import { GoogleGenAI } from "@google/genai";

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API_KEY is missing from environment variables.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const generateDashboardAnalysis = async (stats: any, role: string): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "AI Analysis unavailable (Missing API Key).";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are an intelligent logistics assistant for the eParcel system. 
      Analyze the following JSON statistics for a ${role} user and provide a brief, professional executive summary (max 50 words) highlighting key performance indicators or action items.
      
      Stats: ${JSON.stringify(stats)}`,
    });
    return response.text || "Analysis could not be generated.";
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "Error generating analysis.";
  }
};

export const simulateChatResponse = async (
  lastMessage: string, 
  senderRole: string,
  context: string
): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "Auto-reply: System currently offline.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are acting as a helpful support agent in the eParcel logistics system.
      The user who sent the message is a ${senderRole}.
      Context: ${context}
      User Message: "${lastMessage}"
      
      Reply naturally as if you are the staff member or client on the other end. Keep it short and helpful.`,
    });
    return response.text || "I received your message.";
  } catch (error) {
    return "I received your message, but I cannot reply right now.";
  }
};
