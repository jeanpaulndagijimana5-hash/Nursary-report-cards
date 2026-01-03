
import { GoogleGenAI } from "@google/genai";
import { Mark, Student } from "../types";

// Using process.env.API_KEY directly as per guidelines
const initGemini = () => {
  if (!process.env.API_KEY) {
    console.warn("Gemini API Key is missing.");
    return null;
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const generateStudentSummary = async (
  student: Student,
  marks: (Mark & { subjectName: string })[],
  term: string
): Promise<string> => {
  const ai = initGemini();
  if (!ai) return "AI Summary unavailable.";

  const performanceDescription = marks.map(m => `${m.subjectName} (${m.term}): ${m.score}`).join(", ");
  // Using gemini-3-flash-preview for basic text summarization task
  const prompt = `Write a short, warm nursery school term summary for ${student.name} for ${term}. Performance: ${performanceDescription}. Tone: Encouraging and professional.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    // Accessing .text as a property as per guidelines
    return response.text || "No summary generated.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Could not generate summary.";
  }
};
