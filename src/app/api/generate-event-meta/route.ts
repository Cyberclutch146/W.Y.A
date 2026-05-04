import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  try {
    const { title } = await req.json();

    if (!title || title.trim().length < 3) {
      return NextResponse.json({ error: "Title must be at least 3 characters" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY_AI_CHAT_BOT || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "AI API key is missing" }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const modelsToTry = ["gemini-2.5-flash", "gemini-2.0-flash-lite", "gemini-flash-latest"];

    const prompt = `You are a campus event assistant. Given this event title, suggest metadata.

Event title: "${title}"

Respond ONLY with valid JSON (no markdown, no code blocks):
{
  "suggestedCategory": "one of: 🎓 Academic, 🎉 Social, 🏆 Sports & Fitness, 💻 Tech, 🎨 Arts & Culture, 🤝 Volunteering, 🍕 Food & Hangouts, 💼 Career",
  "suggestedUrgency": "normal or high",
  "suggestedTags": ["array", "of", "3-4", "relevant tags"],
  "draftDescription": "A short, engaging 2-3 sentence description for this campus event. Motivate students to participate."
}`;

    let text = "";
    for (const modelName of modelsToTry) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        text = response.text();
        if (text) break;
      } catch (err: any) {
        console.warn(`Model ${modelName} failed:`, err.message);
      }
    }

    if (!text) {
      throw new Error("All AI models are currently busy. Please try again.");
    }

    // Parse the JSON response, stripping markdown fences if present
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleaned);

    return NextResponse.json(parsed);
  } catch (error: any) {
    console.error("AI Event Meta Error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to generate event metadata" },
      { status: 500 }
    );
  }
}
