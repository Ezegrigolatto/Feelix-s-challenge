# Feelix's Challenge - Next.js Dashboard & Auth Flows

A Next.js application featuring a dashboard with data visualization and filtering capabilities, along with complete email verification and password reset flows. The application uses mock APIs to simulate backend functionality.

---

## 📋 Table of Contents

- [Challenge Steps](#challenge-steps)
  - [1. Environment Configuration](#1️⃣-environment-configuration)
  - [2. Dashboard API Integration](#2️⃣-dashboard-api-integration)
  - [3. State & Error Handling](#3️⃣-state--error-handling)
  - [4. Email Verification Flow](#4️⃣-email--phone-verification-flow)
  - [5. Password Reset Flow](#5️⃣-password-reset-flow)
- [Getting Started](#🚀-getting-started)

---

## Challenge Steps

### 1️⃣ Environment Configuration

When using Next.js apps, you need to prefix your environment variables with `NEXT_PUBLIC_` to make them accessible on the client side.

 Never store or expose sensitive information such as secrets, database credentials, or JWT secret keys in environment variables prefixed with `NEXT_PUBLIC_`. These variables are compiled into the JavaScript bundle and can be accessed by anyone inspecting your application's source code in the browser.

For sensitive information, use environment variables **without** the `NEXT_PUBLIC_` prefix. These variables will only be available on the server side.

#### Environment Files

| File | Purpose |
|------|---------|
| `.env.development` / `.env.local` | Development mode (`next dev`) |
| `.env.staging` | Pre-production / QA environments |
| `.env.production` | Production deployments |

---

### 2️⃣ Dashboard API Integration

The dashboard uses a mock API to simulate fetching user data. The mock API is located in `app/api/analytics/route.ts`.

**File:** `page.tsx` - Dashboard page (home)

- ✅ Fetches data from the mock API endpoint (`/api/analytics`)
- ✅ Displays total users, active users, revenue and conversions
- ✅ Filters data by date range (last 7 days, last 30 days, last 90 days), category and user status
- ✅ Displays charts using recharts library
- ✅ Displays data table for data breakdown by category

---

### 3️⃣ State & Error Handling

The dashboard page:

- ✅ Handles loading, empty, and error states
- ✅ Simulates network delay for realism
- ✅ Simulates error scenario with a 1/10 chance

---

### 4️⃣ Email / Phone Verification Flow

**File:** `verify/page.tsx` - Verification page

- ✅ Extracts the token from the query params (`/verify?token=xxxx`)
- ✅ Auto-submits on page load with `useEffect`
- ✅ Loading state with animated spinner
- ✅ Success message with green icon
- ✅ Auto-redirects to `/login` after 3 seconds with visible countdown
- ✅ Error message with red icon
- ✅ "Resend Verification" button with email field
- ✅ States for resend (loading, success, error)

**File:** `api/auth/verify/route.ts` - Verification endpoint

- Validates presence of the token
- Handles already used, expired, and invalid tokens
- Simulates valid tokens for testing (`valid-token-123`, `test-token`)

**File:** `api/auth/resend-verification/route.ts` - Resend endpoint

- Email format validation
- Rate limiting (3 attempts every 15 minutes)
- Prevents email enumeration (always returns generic success)
- Detects if the email is already verified (use `verified@example.com` for testing)

#### Test URLs

| URL | Result |
|-----|--------|
| `/verify?token=valid-token-123` | ✅ Success |
| `/verify?token=expired-token-456` | ❌ Error (expired) |
| `/verify?token=invalid` | ❌ Error (invalid) |
| `/verify` | ❌ Error (no token) |

---

### 5️⃣ Password Reset Flow

#### 5.1 Forgot Password (`/forgot-password`)

**File:** `forgot-password/page.tsx`

- ✅ Email input with validation
- ✅ Loading state with spinner
- ✅ Success message: "Please check your email to reset your password"
- ✅ Option to try another email
- ✅ API error handling
- ✅ Link back to login

**File:** `api/auth/password-reset-request/route.ts`

- Rate limiting (3 attempts every 15 minutes)
- Prevention of email enumeration
- Email format validation

#### 5.2 Reset Password (`/reset-password?token=xxxx`)

**File:** `reset-password/page.tsx`

- ✅ Extracts token from query params
- ✅ Form with New Password and Confirm Password
- ✅ Toggle to show/hide password
- ✅ Password strength indicator (Weak/Medium/Strong/Very Strong)
- ✅ Frontend validation: match, minimum length, uppercase, lowercase, number
- ✅ Visual confirmation when passwords match
- ✅ Loading and error states
- ✅ Auto-redirect to login after 3 seconds with countdown

**File:** `api/auth/password-reset-confirm/route.ts`

- Token validation (valid, expired, used)
- Backend password validation
- Test tokens: `valid-reset-token`, `test-reset-token`

#### Test URLs

| URL | Result |
|-----|--------|
| `/forgot-password` | Request reset |
| `/reset-password?token=valid-reset-token` | ✅ Successful reset |
| `/reset-password?token=invalid` | ❌ Token error |
| `/reset-password` | ❌ Error (no token) |

---

> **Note:** A login page has been included for completeness, but the authentication logic is not implemented as it is outside the scope of this challenge. It simply provides navigation to avoid dead ends.

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd <project-directory>

# Install dependencies
npm install
# or
pnpm install
```

### .env Setup
Create a `.env.local` file in the root directory and add the necessary environment variables. Check the `.env` file content sent by email.

### Development

```bash
# Run the development server
npm run dev
# or
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

---

## 📁 Project Structure

```
├── app/
│   ├── api/
│   │   ├── analytics/
│   │   │   └── route.ts
│   │   └── auth/
│   │       ├── verify/
│   │       │   └── route.ts
│   │       ├── resend-verification/
│   │       │   └── route.ts
│   │       ├── password-reset-request/
│   │       │   └── route.ts
│   │       └── password-reset-confirm/
│   │           └── route.ts
│   ├── login/
│   │   └── page.tsx
│   ├── verify/
│   │   └── page.tsx
│   ├── forgot-password/
│   │   └── page.tsx
│   └── reset-password/
│   │   └── page.tsx
│   └── page.tsx
│   └── layout.tsx
├── lib/
│   └── api.ts
├── components/
│   ├── empty-state
│   │   └── index.tsx
│   ├── error-state
│   │   └── index.tsx
│   └── loading-state
│       └── index.tsx
└── .env.local
```

---

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Charts:** Recharts
- **HTTP Client:** Custom API client (`lib/api.ts`)