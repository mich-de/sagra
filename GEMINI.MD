# Persistent memory log

## 2026-06-15 - Setup and Initialization
- Completed initial research using browser subagent on ticket selection and checkout pages.
- Identified that Boxol is a React SPA running reCAPTCHA Enterprise and client-side page rendering.
- Discovered that direct API calls under `/next/it/go2/api/latest/` return authorization login gates when session cookies are not present.
- Discovered that the ticket selection page contains the string `"Attualmente non disponibile"` when sold out, and has buttons with class `"primary bk-secondary"` (plus/minus) when available.
- Confirmed that Boxol has no guest checkout option; a user account registration or login is required to complete the checkout path.
- Initialized Node.js project directory in `d:\sagra` with configuration and basic documentation.
