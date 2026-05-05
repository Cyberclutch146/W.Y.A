import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

/**
 * GET /api/bulletin
 * Returns the latest bulletin notices for the navbar notification bell.
 * Expected response shape: { alerts: BulletinAlert[] }
 */
export async function GET() {
  try {
    if (!adminDb) {
      // Return empty alerts gracefully — navbar handles 404 already
      return NextResponse.json({ alerts: [] }, { status: 200 });
    }

    const snapshot = await adminDb
      .collection('bulletins')
      .orderBy('timestamp', 'desc')
      .limit(10)
      .get();

    const now = new Date().toISOString();

    const alerts = snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      // Filter out expired notices
      .filter((n: any) => !n.expiresAt || n.expiresAt > now);

    return NextResponse.json({ alerts }, { status: 200 });
  } catch (error: any) {
    console.error('API Error fetching bulletins:', error);
    // Return empty gracefully so the navbar doesn't break
    return NextResponse.json({ alerts: [] }, { status: 200 });
  }
}
