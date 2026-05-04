import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

const geocodeLocation = async (address: string): Promise<{lat: number, lng: number} | null> => {
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`, {
      headers: {
        'User-Agent': 'CommunityManagementApp/1.0 (Server)'
      }
    });
    const data = await response.json();
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon) // Nominatim returns 'lon' instead of 'lng'
      };
    }
  } catch (error) {
    console.error('Geocoding error:', error);
  }
  return null;
};

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
    const { eventId, updates } = data;

    if (!eventId || !updates) {
      return NextResponse.json(
        { error: "Missing required fields (eventId, updates)." },
        { status: 400 }
      );
    }

    // Ideally, we would verify an auth token here to ensure the user is the organizer

    let coords = (updates.lat !== undefined && updates.lng !== undefined) 
      ? { lat: updates.lat, lng: updates.lng } 
      : null;

    if (!coords && updates.location) {
      coords = await geocodeLocation(updates.location);
    }

    const now = new Date();
    
    const updateData = {
      ...updates,
      ...(coords ? { lat: coords.lat, lng: coords.lng } : {}),
      updatedAt: now,
    };

    await adminDb.collection("events").doc(eventId).update(updateData);

    return NextResponse.json(
      { message: "Event updated successfully." },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("API Error updating event:", error);
    return NextResponse.json(
      { error: "Internal server error.", details: error.message },
      { status: 500 }
    );
  }
}
