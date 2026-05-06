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

    const { eventId, userId, userName, userEmail = "", ticketId = "", status = "going" } = await req.json();

    if (!eventId || !userId || !userName) {
      return NextResponse.json(
        { error: "Missing required fields (eventId, userId, userName)." },
        { status: 400 }
      );
    }

    // Ideally, we would also verify an auth token here to ensure the requester is `userId`.
    // Example: const token = req.headers.get("Authorization")?.split("Bearer ")[1];
    // await adminAuth.verifyIdToken(token);

    const eventRef = adminDb.collection("events").doc(eventId);
    const rsvpRef = eventRef.collection("rsvps").doc(userId); // Use userId as the doc ID for uniqueness
    const userRegistrationRef = adminDb.collection("users").doc(userId).collection("registrations").doc(eventId);

    // Execute atomic transaction for the attendee signup
    await adminDb.runTransaction(async (transaction) => {
      const eventSnap = await transaction.get(eventRef);
      
      if (!eventSnap.exists) {
        throw new Error("Event not found");
      }

      const eventData = eventSnap.data();
      const currentAttendees = eventData?.needs?.attendees?.current || 0;
      const attendeeGoal = eventData?.needs?.attendees?.goal;

      // Optional: Prevent signup if full
      if (attendeeGoal && currentAttendees >= attendeeGoal) {
        throw new Error("Event has reached its attendee capacity");
      }

      // 1. Update event document (only increment if it's a new signup, but since we are overriding, we might just increment naively. In a real app we'd check if doc exists)
      const rsvpSnap = await transaction.get(rsvpRef);
      if (!rsvpSnap.exists && status === 'going') {
         transaction.update(eventRef, {
           "needs.attendees.current": currentAttendees + 1,
           updatedAt: new Date()
         });
      }

      // 2. Add/update event's rsvps subcollection
      transaction.set(rsvpRef, {
        userId,
        userName,
        userEmail,
        ticketId,
        status,
        signedUpAt: new Date()
      }, { merge: true });

      // 3. Add/update user's registrations subcollection
      transaction.set(userRegistrationRef, {
        eventId,
        ticketId,
        signedUpAt: new Date(),
        status
      }, { merge: true });
    });

    return NextResponse.json({ success: true, message: "Successfully signed up for event" });
  } catch (error: any) {
    console.error("API /events/join Error:", error);
    const status = error.message === "Event not found" || error.message.includes("capacity") ? 400 : 500;
    return NextResponse.json(
      { error: error.message || "Failed to process RSVP" },
      { status }
    );
  }
}
