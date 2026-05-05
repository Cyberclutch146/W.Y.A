import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function POST(req: NextRequest) {
  try {
    if (!adminDb) {
      const { initError } = require('@/lib/firebase-admin');
      return NextResponse.json(
        {
          error: 'Server configuration error: Firebase Admin not initialized.',
          details: initError || 'Unknown initialization failure.',
        },
        { status: 500 }
      );
    }

    const data = await req.json();
    const { bulletinId, requesterId, requesterEmail } = data;

    if (!bulletinId || !requesterId) {
      return NextResponse.json(
        { error: 'Missing required fields: bulletinId or requesterId.' },
        { status: 400 }
      );
    }

    // ── Get document to check permissions ────────────────
    const docRef = adminDb.collection('bulletins').doc(bulletinId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json({ error: 'Notice not found.' }, { status: 404 });
    }

    const bulletin = doc.data();
    
    // Authorization: Must be author or admin
    // This matches the ADMIN_EMAILS check used in eventService.ts
    const ADMIN_EMAILS = [
      'blazingswagata@gmail.com',
      'debadree.official.2003@gmail.com',
      'prithwirajsaha63@gmail.com',
      'arijit.ghosh.63@gmail.com'
    ];

    const isAuthor = bulletin?.authorId === requesterId;
    const isAdmin = requesterEmail && ADMIN_EMAILS.includes(requesterEmail);

    if (!isAuthor && !isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized: You do not have permission to delete this notice.' },
        { status: 403 }
      );
    }

    // ── Perform deletion ────────────────────────────────
    await docRef.delete();

    return NextResponse.json(
      { message: 'Notice deleted successfully.' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('API Error deleting bulletin:', error);
    return NextResponse.json(
      { error: 'Internal server error.', details: error.message },
      { status: 500 }
    );
  }
}
