import { GoogleGenAI } from "@google/genai";
import { Mark, Student } from "../types";

const initGemini = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("Gemini API Key is missing. Please set API_KEY in your .env file or Vercel environment variables.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const generateStudentSummary = async (
  student: Student,
  marks: (Mark & { subjectName: string })[],
  term: string
): Promise<string> => {
  const ai = initGemini();
  if (!ai) {
    return "AI Summary unavailable (Missing API Key).";
  }

  const performanceDescription = marks.map(
    m => `${m.subjectName}: ${m.score}`
  ).join(", ");

  const prompt = `
    You are a kind, encouraging nursery school teacher.
    Write a short (2-3 sentences), warm, and personalized term summary for a report card.
    Student Name: ${student.name}
    Term: ${term}
    Performance Data: ${performanceDescription}

    Highlight their strengths based on the high scores.
    If scores are low, suggest improvement in a very gentle, supportive way.
    Do not list the scores in the text, just synthesize the feedback.
    Tone: Professional yet affectionate, suitable for parents of a 4-5 year old.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "No summary generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Could not generate summary at this time.";
  }
};