import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Initialize the API with a fallback or empty key if not provided,
// handling it gracefully if the user hasn't set GEMINI_API_KEY.
const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

export async function POST(req: Request) {
  try {
    if (!apiKey) {
      return NextResponse.json({
        reply: "System notice: GEMINI_API_KEY is missing. I'm currently running in offline simulation mode. But hi! I'm Nanda's AI clone. He's an awesome Full-Stack & iOS Developer. Connect with him on LinkedIn!",
      });
    }

    const { message } = await req.json();

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `You are an AI clone of Nanda, a software engineer based in Bandung, Indonesia. 
You build full-stack web apps, native iOS experiences, and AI-powered tools. 
Your core skills include Go, Node.js, Swift, SwiftUI, Python, React, and Next.js.
Your tone is professional, friendly, and slightly tech-savvy. Keep your responses concise (1-3 sentences maximum) and suitable for a terminal interface.
Respond to this message from a portfolio visitor: "${message}"`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ reply: text });
  } catch (error) {
    console.error("Gemini API Error:", error);
    return NextResponse.json({
      reply: "System notice: My neural link is currently unstable. Please reach out via email or LinkedIn instead!",
    });
  }
}
