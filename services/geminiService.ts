import { GoogleGenAI } from "@google/genai";
import { Language } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getHealthConsultation = async (symptoms: string, lang: Language = 'bn'): Promise<string> => {
  try {
    const langInstruction = lang === 'en' 
      ? "Keep the answer short, friendly, and in English." 
      : "Keep the answer short, friendly, and in Bengali (Bangla).";

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `User symptoms: "${symptoms}".
      
      Act as a helpful medical assistant for a Lab Test booking app in Bangladesh. 
      Analyze the symptoms and suggest which common lab tests might be relevant. 
      ${langInstruction}
      Disclaimer: Always advise seeing a doctor.
      Format the response with bullet points for tests.`,
      config: {
        temperature: 0.7,
      }
    });

    return response.text || (lang === 'en' ? "Sorry, I cannot answer right now." : "দুঃখিত, আমি এখন উত্তর দিতে পারছি না। পরে আবার চেষ্টা করুন।");
  } catch (error) {
    console.error("Gemini API Error:", error);
    return lang === 'en' 
      ? "Sorry, an error occurred. Please check your internet connection." 
      : "দুঃখিত, একটি ত্রুটি হয়েছে। দয়া করে আপনার ইন্টারনেট সংযোগ পরীক্ষা করুন।";
  }
};