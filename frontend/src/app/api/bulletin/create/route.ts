import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

const RATE_LIMIT_MAX = 5; // max notices per user per hour

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

    // ── Validate required fields ─────────────────────────
    if (!data.title?.trim() || !data.description?.trim() || !data.type || !data.authorId) {
      return NextResponse.json(
        { error: 'Missing required fields: title, description, type, authorId.' },
        { status: 400 }
      );
    }

    if (data.title.trim().length < 5) {
      return NextResponse.json(
        { error: 'Title must be at least 5 characters.' },
        { status: 400 }
      );
    }

    if (data.description.trim().length < 10) {
      return NextResponse.json(
        { error: 'Description must be at least 10 characters.' },
        { status: 400 }
      );
    }

    // ── Rate limiting ────────────────────────────────────
    // Fetch all notices by this author and filter client-side
    // (avoids needing a composite Firestore index)
    const windowStart = Date.now() - 60 * 60 * 1000; // 1 hour ago (ms)
    const recentSnap = await adminDb
      .collection('bulletins')
      .where('authorId', '==', data.authorId)
      .get();

    const recentCount = recentSnap.docs.filter((doc) => {
      const ts = doc.data().timestamp;
      // timestamp is an ISO string — compare numerically
      return ts && new Date(ts).getTime() > windowStart;
    }).length;

    if (recentCount >= RATE_LIMIT_MAX) {
      return NextResponse.json(
        {
          error: `You can only post ${RATE_LIMIT_MAX} notices per hour. Please try again later.`,
        },
        { status: 429 }
      );
    }

    // ── Build document ───────────────────────────────────
    const now = new Date().toISOString();

    const bulletinData = {
      title:        data.title.trim(),
      description:  data.description.trim(),
      type:         data.type,
      severity:     data.severity   || 'Minor',
      source:       data.source     || 'Anonymous',
      locationName: data.locationName?.trim() || 'Campus',
      contactInfo:  data.contactInfo?.trim()  || null,
      authorId:     data.authorId,
      authorAvatar: data.authorAvatar || null,
      pinned:       false,
      timestamp:    now,
      expiresAt:    data.expiresAt   || null,
    };

    const docRef = await adminDb.collection('bulletins').add(bulletinData);

    return NextResponse.json(
      { message: 'Notice posted successfully.', bulletinId: docRef.id },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('API Error creating bulletin:', error);
    return NextResponse.json(
      { error: 'Internal server error.', details: error.message },
      { status: 500 }
    );
  }
}
