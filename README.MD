# Boxol Ticket Checker & Booking Automation

Automated ticket availability checker and booking script for Boxol Next events. Optimized to run locally or inside GitHub Actions.

## Setup & Installation

### Requirements
- **Node.js** (v20+ recommended)
- **NPM**

### Installation
1. Install dependencies:
   ```bash
   npm install
   ```
2. Install Playwright browser engines:
   ```bash
   npx playwright install chromium
   ```

### Configuration
Create a `.env` file in the project root:
```env
# Target Boxol Event URL (Default: La Tavola dei 300)
BOXOL_EVENT_URL="https://www.boxol.it/next/it/go2/select-ticket/614173/biglietti-la-tavola-dei-300-terza-edizione-marina-di-puolo-massa-lubrense"

# Booking credentials (for book.js)
BOXOL_EMAIL="your-email@example.com"
BOXOL_PASSWORD="your-secure-password"

# Number of tickets to book (for book.js)
TICKET_COUNT="2"

# Notification settings (Optional)
TELEGRAM_BOT_TOKEN="your-bot-token"
TELEGRAM_CHAT_ID="your-chat-id"
```

## How to Use

### Check Availability
To check if tickets are currently available:
```bash
npm run check
```
- If tickets are **not available** (sold out), it logs the status and exits with code `0`.
- If tickets are **available**, it logs the status, triggers any configured Telegram alerts, and exits with a non-zero code `1`. (This causes the scheduled GitHub Action to fail and alert you immediately).

### Auto Booking
To automatically purchase tickets (navigates, selects quantity, logs in, and goes to the checkout payment page):
```bash
npm run book
```

## Scheduled GitHub Action
The checker runs every hour via GitHub Actions. If tickets become available, the Action will fail (sending you a GitHub email alert) and send a Telegram alert if configured.
Configure the following secrets in your GitHub repository:
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`
