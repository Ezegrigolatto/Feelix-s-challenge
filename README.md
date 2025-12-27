TECHNICAL DOCUMENTATION

Feelix's Challenge - Next.js Dashboard & Auth Flows
This project is a Next.js application that includes a dashboard page with data visualization and filtering capabilities, as well as email verification and password reset flows. The application uses mock APIs to simulate backend functionality.

Challenge Steps: 
1️⃣ Environment Configuration

When using Next.js apps, you need to prefix your environment variables with `NEXT_PUBLIC_` to make them accessible on the client side.

You must never store or expose sensitive information such as secrets, database credentials, or JWT secret keys in environment variables that are prefixed with `NEXT_PUBLIC_`, because these variables are compiled into the JavaScript bundle and can be accessed by anyone inspecting your application's source code in the browser.

For sensitive information, use environment variables without the `NEXT_PUBLIC_` prefix. These variables will only be available on the server side and will not be exposed to the client.

Development, staging, and production environment variables should be stored in separate files named `.env.development`, `.env.staging`, and `.env.production` respectively.
The difference is that `.env.development` or `.env.local` are recommended for running the app in development mode (`next dev`), `.env.staging` is used when deploying to a pre-production stage like a "staging" or "QA" environment, and `.env.production` is used when deploying to production.

2️⃣ Dashboard API Integration (Sandbox)
The dashboard uses a mock API to simulate fetching user data. The mock API is located in `app/api/analytics/route.ts`. You can modify this file to change the mock data or simulate different scenarios.

/page.tsx - Dashboard page (home):

☑ Fetches data from the mock API endpoint (`/api/analytics`)
☑ Displays total users, active users, revenue and conversions
☑ Filters data by date range (last 7 days, last 30 days, last 90 days), category and user status
☑ Displays charts using recharts library
☑ Displays data table for data breakdown by category

3️⃣ State & Error Handling
The dashboard page:

☑ Handles loading, empty, and error states
☑ Simulates network delay for realism
☑ Simulates error scenario with a 1/10 chance

4️⃣ Email / Phone Verification Flow

verify/page.tsx - Verification page:

☑ Extracts the token from the query params (`/verify?token=xxxx`)
☑ Auto-submits on page load with `useEffect`
☑ Loading state with animated spinner
☑ Success message with green icon
☑ Auto-redirects to `/login` after 3 seconds with visible countdown
☑ Error message with red icon
☑ "Resend Verification" button with email field
☑ States for resend (loading, success, error)

api/auth/verify/route.ts - Verification endpoint:

Validates presence of the token
Handles already used, expired, and invalid tokens
Simulates valid tokens for testing (`valid-token-123`, `test-token`)

api/auth/resend-verification/route.ts - Resend endpoint:

Email format validation
Rate limiting (3 attempts every 15 minutes)
Prevents email enumeration (always returns generic success)
Detects if the email is already verified (use verified@example.com for testing)

Test URLs:

- `/verify?token=valid-token-123` → Success
- `/verify?token=expired-token-456` → Error (expired)
- `/verify?token=invalid` → Error (invalid)
- `/verify` → Error (no token)


5️⃣ Password Reset Flow
    5.1 Forgot Password (/forgot-password)
    forgot-password/page.tsx:

    ☑ email input with validation
    ☑ Loading state with spinner
    ☑ Success message: "Please check your email to reset your password"
    ☑ Option to try another email
    ☑ API error handling
    ☑ Link back to login
    api/auth/password-reset-request/route.ts:

    Rate limiting (3 attempts every 15 minutes)
    Prevention of email enumeration
    Email format validation

    5.2 Reset Password (/reset-password?token=xxxx)
    reset-password/page.tsx:

    ☑ Extracts token from query params
    ☑ Form with New Password and Confirm Password
    ☑ Toggle to show/hide password
    ☑ Password strength indicator (Weak/Medium/Strong/Very Strong)
    ☑ Frontend validation: match, minimum length, uppercase, lowercase, number
    ☑ Visual confirmation when passwords match
    ☑ Loading and error states
    ☑ Auto-redirect to login after 3 seconds with countdown
    api/auth/password-reset-confirm/route.ts:

    Token validation (valid, expired, used)
    Backend password validation
    test tokens: valid-reset-token, test-reset-token

Test URLs:

/forgot-password → Request reset
/reset-password?token=valid-reset-token → Successful reset
/reset-password?token=invalid → Token error
/reset-password → Error (no token)

NOTE: A login page has been included for completeness, but the authentication logic is not implemented as it is outside the scope of this challenge. It simply provides navigation to avoid dead ends.


