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
    const { bulletinId, pinned, requesterEmail } = data;

    if (!bulletinId || pinned === undefined || !requesterEmail) {
      return NextResponse.json(
        { error: 'Missing required fields: bulletinId, pinned, or requesterEmail.' },
        { status: 400 }
      );
    }

    // ── Admin Authorization ──────────────────────────────
    const ADMIN_EMAILS = [
      'blazingswagata@gmail.com',
      'debadree.official.2003@gmail.com',
      'prithwirajsaha63@gmail.com',
      'arijit.ghosh.63@gmail.com'
    ];

    if (!ADMIN_EMAILS.includes(requesterEmail)) {
      return NextResponse.json(
        { error: 'Unauthorized: Only admins can pin notices.' },
        { status: 403 }
      );
    }

    // ── Update document ──────────────────────────────────
    const docRef = adminDb.collection('bulletins').doc(bulletinId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json({ error: 'Notice not found.' }, { status: 404 });
    }

    await docRef.update({
      pinned: pinned,
      updatedAt: new Date().toISOString()
    });

    return NextResponse.json(
      { message: `Notice ${pinned ? 'pinned' : 'unpinned'} successfully.` },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('API Error pinning bulletin:', error);
    return NextResponse.json(
      { error: 'Internal server error.', details: error.message },
      { status: 500 }
    );
  }
}
