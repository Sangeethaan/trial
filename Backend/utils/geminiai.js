// utils/geminiai.js
import 'dotenv/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const getGeminiApiResponse = async (prompt) => {
  if (!prompt) {
    throw new Error("Prompt is required");
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (err) {
    console.error("Error generating content:", err);
    throw err; // let the route handler handle the error
  }
};

export default getGeminiApiResponse;
