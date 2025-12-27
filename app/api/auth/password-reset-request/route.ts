import { NextRequest, NextResponse } from 'next/server';

const users = new Map<string, { id: string; email: string }>([
  ['user@example.com', { id: '1', email: 'user@example.com' }],
  ['test@example.com', { id: '2', email: 'test@example.com' }],
]);

const resetAttempts = new Map<string, { count: number; lastAttempt: Date }>();
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

    const emailLower = email.toLowerCase();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailLower)) {
      return NextResponse.json(
        { success: false, message: 'Invalid email format' },
        { status: 400 }
      );
    }

    const attempts = resetAttempts.get(emailLower);
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
        resetAttempts.delete(emailLower);
      }
    }

    const currentAttempts = resetAttempts.get(emailLower) || { count: 0, lastAttempt: new Date() };
    resetAttempts.set(emailLower, {
      count: currentAttempts.count + 1,
      lastAttempt: new Date(),
    });

    const user = users.get(emailLower);

    if (user) {
      // Production logic
    }

    return NextResponse.json({
      success: true,
      message: 'If an account with this email exists, a password reset link has been sent.',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'An error occurred while processing your request' },
      { status: 500 }
    );
  }
}