1️⃣ Environment Configuration

When using nextjs apps, you need to prefix your environment variables with NEXT_PUBLIC_ to make them accessible on the client side.

You must never store or expose sensitive information such as secrets, database credentials or JWT secret keys in environment variables that are prefixed with "NEXT_PUBLIC_", because these variables are compiled into the javaScript bundle and can be accessed by anyone inspecting the source code of your application from the browser.

For sensitive information, use environment variables without the "NEXT_PUBLIC_" prefix. These variables will only be available on the server side and will not be exposed to the client.

dev, staging and production environment variables should be stored in separate files named .env.development, .env.staging and .env.production respectively.
Their difference is that .env.development or .env.local are recommended to be used when running the app in development mode (next dev), .env.staging is used when deploying to a pre-production stage like "staging" or "QA" environment, and .env.production is used when deploying to production.

