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

    const { action, userId, data } = await req.json();

    if (!userId || !action) {
      return NextResponse.json(
        { error: "Missing required fields (userId, action)." },
        { status: 400 }
      );
    }

    const userDocRef = adminDb.collection("users").doc(userId);

    if (action === "create") {
      const impactScore = (data.eventHours || 0) * 10 + (data.totalDonated || 0) + (data.interests?.length || 0) * 5;
      await userDocRef.set({
        ...data,
        impactScore,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      return NextResponse.json({ success: true, message: "Profile created." });
    }

    if (action === "update") {
      // For accurate impactScore, we merge with existing data
      const existingDoc = await userDocRef.get();
      const existingData = existingDoc.exists ? existingDoc.data() : {};
      const merged = { ...existingData, ...data };
      const impactScore = (merged.eventHours || 0) * 10 + (merged.totalDonated || 0) + (merged.interests?.length || 0) * 5;

      await userDocRef.update({
        ...data,
        impactScore,
        updatedAt: new Date(),
      });

      // Update global stats (placeholder for high-concurrency atomic counter)
      if (data.eventHours || data.totalDonated) {
        const statsRef = adminDb.collection("meta").doc("platformStats");
        await adminDb.runTransaction(async (t) => {
          const s = await t.get(statsRef);
          const current = s.exists ? s.data() : { totalAttendees: 0, totalHours: 0, totalDonated: 0 };
          t.set(statsRef, {
            totalAttendees: current.totalAttendees + (data.eventHours ? 1 : 0), // naive
            totalHours: (current.totalHours || 0) + (data.eventHours || 0),
            totalDonated: (current.totalDonated || 0) + (data.totalDonated || 0),
          }, { merge: true });
        });
      }

      return NextResponse.json({ success: true, message: "Profile updated." });
    }

    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  } catch (error: any) {
    console.error("API /user/profile Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to manage user profile" },
      { status: 500 }
    );
  }
}
