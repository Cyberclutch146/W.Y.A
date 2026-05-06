import { NextRequest, NextResponse } from 'next/server';
import { adminDb, initError } from '@/lib/firebase-admin';

export async function POST(req: NextRequest) {
  if (!adminDb) {
    console.error('[verify-otp] Firebase Admin not initialized:', initError);
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }
  try {
    const { email, otp } = await req.json();
    if (!email || !otp) {
      return NextResponse.json({ error: 'Email and OTP are required' }, { status: 400 });
    }

    const key = email.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const doc = await adminDb.collection('_otps').doc(key).get();

    if (!doc.exists) {
      return NextResponse.json({ error: 'No OTP found. Please request a new one.' }, { status: 400 });
    }

    const data = doc.data()!;

    if (Date.now() > data.expiresAt) {
      await adminDb.collection('_otps').doc(key).delete();
      return NextResponse.json({ error: 'OTP has expired. Please request a new one.' }, { status: 400 });
    }

    if (data.otp !== otp.trim()) {
      return NextResponse.json({ error: 'Incorrect code. Please try again.' }, { status: 400 });
    }

    // Valid — delete OTP so it can't be reused
    await adminDb.collection('_otps').doc(key).delete();

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[verify-otp]', err);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}
