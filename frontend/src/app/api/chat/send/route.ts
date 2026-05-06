import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
  try {
    if (!adminDb) {
      const { initError } = require("@/lib/firebase-admin");
      return NextResponse.json(
        { 
          error: "Server configuration error: Firebase Admin not initialized.",
          details: initError || "Unknown initialization failure."
        },
        { status: 500 }
      );
    }

    const { eventId, userId, userName, text } = await req.json();

    if (!eventId || !userId || !text) {
      return NextResponse.json(
        { error: "Missing required fields (eventId, userId, text)." },
        { status: 400 }
      );
    }

    // Ideally, we would verify an auth token here
    // const token = req.headers.get("Authorization")?.split("Bearer ")[1];
    // await adminAuth.verifyIdToken(token);

    const messageData = {
      eventId,
      userId,
      userName: userName || "Anonymous",
      text,
      createdAt: new Date(),
    };

    await adminDb.collection("events").doc(eventId).collection("messages").add(messageData);

    return NextResponse.json(
      { message: "Message sent successfully." },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("API Error sending message:", error);
    return NextResponse.json(
      { error: "Internal server error.", details: error.message },
      { status: 500 }
    );
  }
}
