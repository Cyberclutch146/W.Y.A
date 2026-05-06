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

    const { userId, data } = await req.json();

    if (!userId || !data || !data.title || !data.type) {
      return NextResponse.json(
        { error: "Missing required fields (userId, data.title, data.type)." },
        { status: 400 }
      );
    }

    const notifRef = adminDb.collection("users").doc(userId).collection("notifications");
    
    const docRef = await notifRef.add({
      ...data,
      read: false,
      createdAt: new Date(),
    });

    return NextResponse.json(
      { message: "Notification created successfully.", notificationId: docRef.id },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("API Error creating notification:", error);
    return NextResponse.json(
      { error: "Internal server error.", details: error.message },
      { status: 500 }
    );
  }
}
