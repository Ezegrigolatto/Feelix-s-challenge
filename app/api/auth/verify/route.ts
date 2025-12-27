import { NextRequest, NextResponse } from 'next/server';

// Simulated token storage (in production, this would be a database)
const validTokens = new Map<string, { email: string; expiresAt: Date }>([
  ['valid-token-123', { email: 'user@example.com', expiresAt: new Date(Date.now() + 86400000) }],
  ['test-token', { email: 'test@example.com', expiresAt: new Date(Date.now() + 86400000) }],
]);

const expiredTokens = new Set(['expired-token-456']);
const usedTokens = new Set<string>();

export async function POST(request: NextRequest) {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Verification token is required' },
        { status: 400 }
      );
    }

    if (usedTokens.has(token)) {
      return NextResponse.json(
        { success: false, message: 'This verification link has already been used' },
        { status: 400 }
      );
    }

    if (expiredTokens.has(token)) {
      return NextResponse.json(
        { success: false, message: 'This verification link has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    const tokenData = validTokens.get(token);
    
    if (!tokenData) {
      return NextResponse.json(
        { success: false, message: 'Invalid verification token' },
        { status: 400 }
      );
    }

    if (tokenData.expiresAt < new Date()) {
      return NextResponse.json(
        { success: false, message: 'This verification link has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    usedTokens.add(token);


    return NextResponse.json({
      success: true,
      message: 'Email verified successfully',
      email: tokenData.email,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'An error occurred during verification' },
      { status: 500 }
    );
  }
}