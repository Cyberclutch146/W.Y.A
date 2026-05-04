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

    const data = await req.json();
    const { eventId } = data;

    if (!eventId) {
      return NextResponse.json(
        { error: "Missing required fields (eventId)." },
        { status: 400 }
      );
    }

    // Ideally, we would verify an auth token here to ensure the user is the organizer

    await adminDb.collection("events").doc(eventId).delete();

    // Note: This doesn't delete subcollections. 
    // In a production environment, you might want to use a Cloud Function for recursive deletion.

    return NextResponse.json(
      { message: "Event deleted successfully." },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("API Error deleting event:", error);
    return NextResponse.json(
      { error: "Internal server error.", details: error.message },
      { status: 500 }
    );
  }
}
