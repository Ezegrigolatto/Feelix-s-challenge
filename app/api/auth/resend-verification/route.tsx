import { NextRequest, NextResponse } from 'next/server';

const users = new Map<string, { verified: boolean }>([
  ['user@example.com', { verified: false }],
  ['test@example.com', { verified: false }],
  ['verified@example.com', { verified: true }],
]);

const resendAttempts = new Map<string, { count: number; lastAttempt: Date }>();
const MAX_ATTEMPTS = 3;
const COOLDOWN_MINUTES = 15;

export async function POST(request: NextRequest) {
  await new Promise((resolve) => setTimeout(resolve, 800));

  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Invalid email format' },
        { status: 400 }
      );
    }

    const attempts = resendAttempts.get(email);
    if (attempts) {
      const cooldownEnd = new Date(attempts.lastAttempt.getTime() + COOLDOWN_MINUTES * 60000);
      
      if (attempts.count >= MAX_ATTEMPTS && new Date() < cooldownEnd) {
        const minutesLeft = Math.ceil((cooldownEnd.getTime() - Date.now()) / 60000);
        return NextResponse.json(
          { 
            success: false, 
            message: `Too many attempts. Please try again in ${minutesLeft} minute${minutesLeft !== 1 ? 's' : ''}.` 
          },
          { status: 429 }
        );
      }

      if (new Date() >= cooldownEnd) {
        resendAttempts.delete(email);
      }
    }

    const user = users.get(email.toLowerCase());

    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'If an account with this email exists, a verification email has been sent.',
      });
    }

    if (user.verified) {
      return NextResponse.json(
        { success: false, message: 'This email is already verified. Please log in.' },
        { status: 400 }
      );
    }

    const currentAttempts = resendAttempts.get(email) || { count: 0, lastAttempt: new Date() };
    resendAttempts.set(email, {
      count: currentAttempts.count + 1,
      lastAttempt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: 'If an account with this email exists, a verification email has been sent.',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'An error occurred while processing your request' },
      { status: 500 }
    );
  }
}