'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

type VerificationStatus = 'idle' | 'loading' | 'success' | 'error';

const REDIRECT_DELAY_MS = 3000;

export default function VerifyPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<VerificationStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [countdown, setCountdown] = useState(REDIRECT_DELAY_MS / 1000);
  const [resendEmail, setResendEmail] = useState('');
  const [resendStatus, setResendStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const verifyToken = useCallback(async (verificationToken: string) => {
    setStatus('loading');
    setErrorMessage('');

    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: verificationToken }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Verification failed');
      }

      setStatus('success');
    } catch (err) {
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'An unexpected error occurred');
    }
  }, []);

  useEffect(() => {
    if (token) {
      verifyToken(token);
    } else {
      setStatus('error');
      setErrorMessage('No verification token provided');
    }
  }, [token, verifyToken]);

  useEffect(() => {
    if (status !== 'success') return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          router.push('/login');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [status, router]);

  const handleResendVerification = async () => {
    if (!resendEmail.trim()) return;

    setResendStatus('loading');

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resendEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to resend verification email');
      }

      setResendStatus('success');
    } catch (err) {
      setResendStatus('error');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="rounded-lg bg-white p-8 shadow-lg">
          <h1 className="mb-6 text-center text-2xl font-bold text-gray-900">
            Email Verification
          </h1>

          {status === 'loading' && (
            <div className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
              <p className="text-gray-600">Verifying your email...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="mb-2 text-lg font-semibold text-green-600">Email Verified!</h2>
              <p className="mb-4 text-gray-600">Your email has been successfully verified.</p>
              <p className="text-sm text-gray-500">
                Redirecting to login in {countdown} second{countdown !== 1 ? 's' : ''}...
              </p>
              <Link
                href="/login"
                className="mt-4 inline-block text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                Go to login now
              </Link>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="mb-2 text-lg font-semibold text-red-600">Verification Failed</h2>
              <p className="mb-6 text-gray-600">{errorMessage}</p>

              <div className="border-t pt-6">
                <p className="mb-4 text-sm text-gray-600">
                  Need a new verification link? Enter your email below:
                </p>

                {resendStatus === 'success' ? (
                  <div className="rounded-md bg-green-50 p-4">
                    <p className="text-sm text-green-700">
                      A new verification email has been sent. Please check your inbox.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <input
                      type="email"
                      value={resendEmail}
                      onChange={(e) => setResendEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <button
                      onClick={handleResendVerification}
                      disabled={resendStatus === 'loading' || !resendEmail.trim()}
                      className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {resendStatus === 'loading' ? 'Sending...' : 'Resend Verification Email'}
                    </button>
                    {resendStatus === 'error' && (
                      <p className="text-sm text-red-600">
                        Failed to send email. Please try again.
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-6">
                <Link
                  href="/login"
                  className="text-sm font-medium text-blue-600 hover:text-blue-500"
                >
                  Back to login
                </Link>
              </div>
            </div>
          )}

          {status === 'idle' && !token && (
            <div className="text-center">
              <p className="text-gray-600">Preparing verification...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}