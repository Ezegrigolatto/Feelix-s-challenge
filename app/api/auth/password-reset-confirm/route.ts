import { NextRequest, NextResponse } from 'next/server';

const validResetTokens = new Map<string, { userId: string; expiresAt: Date }>([
  ['valid-reset-token', { userId: '1', expiresAt: new Date(Date.now() + 3600000) }],
  ['test-reset-token', { userId: '2', expiresAt: new Date(Date.now() + 3600000) }],
]);

const usedTokens = new Set<string>();

const MIN_PASSWORD_LENGTH = 8;

function validatePassword(password: string): { valid: boolean; message?: string } {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return {
      valid: false,
      message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,
    };
  }

  if (!/[A-Z]/.test(password)) {
    return {
      valid: false,
      message: 'Password must contain at least one uppercase letter',
    };
  }

  if (!/[a-z]/.test(password)) {
    return {
      valid: false,
      message: 'Password must contain at least one lowercase letter',
    };
  }

  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' };
  }

  return { valid: true };
}

export async function POST(request: NextRequest) {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  try {
    const body = await request.json();
    const { token, password } = body;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Reset token is required' },
        { status: 400 }
      );
    }

    if (!password) {
      return NextResponse.json(
        { success: false, message: 'Password is required' },
        { status: 400 }
      );
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { success: false, message: passwordValidation.message },
        { status: 400 }
      );
    }

    if (usedTokens.has(token)) {
      return NextResponse.json(
        {
          success: false,
          message: 'This reset link has already been used. Please request a new one.',
        },
        { status: 400 }
      );
    }

    const tokenData = validResetTokens.get(token);

    if (!tokenData) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid or expired reset link. Please request a new one.',
        },
        { status: 400 }
      );
    }

    if (tokenData.expiresAt < new Date()) {
      return NextResponse.json(
        {
          success: false,
          message: 'This reset link has expired. Please request a new one.',
        },
        { status: 400 }
      );
    }

    usedTokens.add(token);

    // Production logic
    return NextResponse.json({
      success: true,
      message: 'Password has been reset successfully',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'An error occurred while resetting your password' },
      { status: 500 }
    );
  }
}
