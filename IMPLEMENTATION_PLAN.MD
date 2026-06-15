# Boxol Ticket Checker & Booking Automation

This project monitors the Boxol ticket availability for "La Tavola dei 300 - Terza Edizione" at Marina di Puolo, Massa Lubrense, and automates the booking flow when tickets are available.

## Architecture

1. **Availability Checker (`check.js`)**:
   - Uses Playwright to load the Boxol event page.
   - Inspects the DOM for the text `"Attualmente non disponibile"`.
   - If tickets are available, logs the state and exits with a non-zero exit code to alert the GitHub Actions runner, and optionally sends an alert via Telegram.

2. **Booking Automation (`book.js`)**:
   - Uses Playwright to load the page.
   - Increments ticket quantity.
   - Adds tickets to the cart.
   - Redirects to the login gate and fills in credentials.
   - Confirms login and advances to the payment page.

3. **Scheduled Checker (`.github/workflows/check-tickets.yml`)**:
   - Cron-scheduled GitHub Actions workflow running every hour.
   - Triggers `check.js` inside a headless environment.

## Verification Plan

### Automated Checks
- `npm run check`: Runs availability checker.
- `npm run book`: Runs booking automation up to login gate/payment.
