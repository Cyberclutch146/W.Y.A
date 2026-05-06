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

    const { eventId, rsvpId, status } = await req.json();

    if (!eventId || !rsvpId || !status) {
      return NextResponse.json(
        { error: "Missing required fields (eventId, rsvpId, status)." },
        { status: 400 }
      );
    }

    const rsvpRef = adminDb
      .collection("events")
      .doc(eventId)
      .collection("rsvps")
      .doc(rsvpId);

    const rsvpSnap = await rsvpRef.get();
    if (!rsvpSnap.exists) {
      return NextResponse.json(
        { error: "RSVP record not found." },
        { status: 404 }
      );
    }

    await rsvpRef.update({
      status,
      updatedAt: new Date(),
    });

    return NextResponse.json({ success: true, message: "Attendance updated." });
  } catch (error: any) {
    console.error("API /events/scan Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update attendance" },
      { status: 500 }
    );
  }
}
