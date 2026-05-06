import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  try {
    const { profile, events } = await req.json();

    if (!profile || !events || events.length === 0) {
      return NextResponse.json(
        { success: false, error: "Profile and events are required." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY_AI_CHAT_BOT || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ success: false, results: [] });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const eventSummaries = events
      .map(
        (e: any) =>
          `ID: ${e.id} | Title: "${e.title}" | Category: ${e.category} | Tags: ${e.tags?.join(", ")} | Description: ${e.description.slice(0, 100)}`
      )
      .join("\n");

    const profileSummary = `Bio: ${profile.bio || "None"} | Interests: ${profile.interests?.join(", ")} | Department: ${profile.department}`;

    const prompt = `You are an AI recommendation engine for a college campus event platform.
Given a student's profile and a list of upcoming events, return ONLY the IDs of the top 3 events that are a perfect "vibe match" for the student, based on semantic alignment between their bio, interests, and the event descriptions.

Student Profile:
${profileSummary}

Available Events:
${eventSummaries}

Respond with ONLY a JSON array of event IDs, most relevant first. If no events match well, respond with an empty array [].
Example response: ["id1", "id2", "id3"]`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    const jsonMatch = text.match(/\[[\s\S]*?\]/);
    if (jsonMatch) {
      const ids = JSON.parse(jsonMatch[0]) as string[];
      const validIds = ids.filter((id) => events.some((e: any) => e.id === id));
      return NextResponse.json({ success: true, results: validIds });
    }

    return NextResponse.json({ success: true, results: [] });
  } catch (error: any) {
    console.error("Vibe match API error:", error);
    return NextResponse.json(
      { success: false, error: "Vibe matching failed." },
      { status: 500 }
    );
  }
}
