import { NextRequest, NextResponse } from 'next/server';
import { adminDb, initError } from '@/lib/firebase-admin';
import nodemailer from 'nodemailer';

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS,
  },
});

export async function POST(req: NextRequest) {
  if (!adminDb) {
    console.error('[send-otp] Firebase Admin not initialized:', initError);
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }
  try {
    const { email } = await req.json();
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const otp = generateOtp();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store OTP in Firestore (keyed by sanitized email)
    const key = email.toLowerCase().replace(/[^a-z0-9]/g, '_');
    await adminDb.collection('_otps').doc(key).set({ otp, expiresAt, email });

    // Send email
    await transporter.sendMail({
      from: `"W.Y.A Campus" <${process.env.EMAIL}>`,
      to: email,
      subject: 'Your W.Y.A Verification Code',
      html: `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px; background: #0d0d0d; border-radius: 16px; color: #fff;">
          <div style="font-size: 11px; font-weight: 700; letter-spacing: 0.3em; text-transform: uppercase; color: #888; margin-bottom: 24px;">W.Y.A — Where You At</div>
          <h1 style="font-size: 36px; font-weight: 900; margin: 0 0 8px; letter-spacing: -1px;">Your code</h1>
          <p style="color: #aaa; font-size: 14px; margin: 0 0 32px;">Use this one-time code to verify your identity. It expires in 10 minutes.</p>
          <div style="background: #1a1a1a; border: 1px solid #333; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 32px;">
            <span style="font-size: 48px; font-weight: 900; letter-spacing: 12px; color: #fff; font-family: monospace;">${otp}</span>
          </div>
          <p style="color: #555; font-size: 12px;">If you didn't request this, you can safely ignore this email. Do not share this code with anyone.</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[send-otp]', err);
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 });
  }
}
