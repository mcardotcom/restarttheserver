Security Policy for RESTART_ The Server
The team behind RESTART_ The Server takes security seriously. We are committed to protecting our users and our infrastructure. We welcome the community's help in identifying and reporting vulnerabilities.

1. Supported Versions
Security updates are applied only to the most recent version of the application available on the main branch of our repository. We encourage all users to run the latest version.

Version

Supported

1.x.x

:white_check_mark:

< 1.0

:x:

2. Reporting a Vulnerability
Please do not report security vulnerabilities through public GitHub issues.

To ensure the confidentiality of the report, please send an email directly to hello@restarttheserver.com with the subject line "SECURITY VULNERABILITY REPORT".

Please include the following details in your report:

A clear description of the vulnerability.

The steps required to reproduce the issue.

Any proof-of-concept code, screenshots, or logs that demonstrate the vulnerability.

Your name or alias for credit, if you wish to be publicly acknowledged after the vulnerability is resolved.

We will strive to acknowledge your report within 48 hours and will keep you informed of our progress in resolving the issue. We will make a public announcement once the vulnerability has been patched.

3. Security Measures & Best Practices
We have implemented several security measures to protect the application and its users.

3.1. Secrets and Environment Variables
All sensitive information, including API keys (SUPABASE_SERVICE_ROLE_KEY, OPENAI_API_KEY) and database connection details, is managed exclusively through environment variables. These secrets are not hardcoded in the application and should never be committed to the repository. The .env.example file serves as a template, and the actual secrets must be configured securely in the deployment environment (e.g., Vercel Environment Variables).

3.2. Database Security
We leverage Supabase's built-in security features to protect our data.

Row Level Security (RLS): While the MVP primarily involves server-side queries using the service_role_key, RLS policies will be implemented as soon as user authentication is introduced. The default policy is "deny all," ensuring no data is accessible unless explicitly allowed.

SSL Enforcement: All connections to the Supabase database are encrypted using SSL.

3.3. Admin Panel Access (MVP Limitation)
For the initial MVP launch, the /admin route is not protected by user authentication. This is a known and accepted risk for the initial phase to simplify deployment.

Future State (Post-Launch): A top priority in the post-launch roadmap is to secure the admin panel using Supabase Auth. This will ensure that only authenticated and authorized editors can access the content management features.

3.4. API Endpoint Security
Server-Side Logic: Our API routes (e.g., /api/generateMeta) are designed with server-side logic that prevents exposure of sensitive keys to the client.

Rate Limiting: Vercel provides protection against DDoS attacks. As the application scales, we will implement explicit rate limiting on our API routes to prevent abuse.

3.5. Cross-Site Scripting (XSS) Prevention
By using React with Next.js, content rendered in the DOM is automatically escaped, providing a strong defense against common XSS attacks. We avoid using dangerous properties like dangerouslySetInnerHTML.

3.6. HTTP Security Headers
Our deployment configuration on Vercel (vercel.json) includes important security headers to protect against common web vulnerabilities:

X-Frame-Options: DENY helps prevent clickjacking attacks.

X-Content-Type-Options: nosniff prevents browsers from MIME-sniffing a response away from the declared content type.

3.7. Dependency Management
We use npm to manage our dependencies. We regularly check for known vulnerabilities in our dependencies using npm audit and update them as part of our maintenance schedule.