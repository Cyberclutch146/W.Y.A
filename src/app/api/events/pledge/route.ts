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

    const { eventId, userId, userName, items, otherItems } = await req.json();

    if (!eventId || !userId || !items) {
      return NextResponse.json(
        { error: "Missing required fields (eventId, userId, items)." },
        { status: 400 }
      );
    }

    const pledgeData = {
      userId,
      userName: userName || "Anonymous",
      items,
      otherItems: otherItems || "",
      pledgedAt: new Date(),
    };

    // GoodsPledges is a subcollection of event
    // The path in the client is: `${EVENTS_COLLECTION}/${eventId}/goodsPledges`, userId
    await adminDb.collection("events").doc(eventId).collection("goodsPledges").doc(userId).set(pledgeData);

    // Notifications will be handled by the client or we can move them here. 
    // It's already in the client side as best-effort. We will leave notification logic to the client for now or migrate it.

    return NextResponse.json(
      { message: "Pledge created successfully." },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("API Error creating pledge:", error);
    return NextResponse.json(
      { error: "Internal server error.", details: error.message },
      { status: 500 }
    );
  }
}
