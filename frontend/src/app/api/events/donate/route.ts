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

    const { eventId, amount } = await req.json();

    if (!eventId || typeof amount !== "number") {
      return NextResponse.json(
        { error: "Missing required fields (eventId, amount)." },
        { status: 400 }
      );
    }

    const eventRef = adminDb.collection("events").doc(eventId);

    await adminDb.runTransaction(async (transaction) => {
      const eventSnap = await transaction.get(eventRef);
      if (!eventSnap.exists) {
        throw new Error('Event not found');
      }

      const data = eventSnap.data();
      const currentFunds = data?.needs?.funds?.current || 0;

      transaction.update(eventRef, {
        'needs.funds.current': currentFunds + amount,
        updatedAt: new Date()
      });
    });

    return NextResponse.json(
      { message: "Donation updated successfully." },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("API Error updating donation:", error);
    return NextResponse.json(
      { error: "Internal server error.", details: error.message },
      { status: 500 }
    );
  }
}
