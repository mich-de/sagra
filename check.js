import { chromium } from 'playwright';
import dotenv from 'dotenv';

dotenv.config();

// Disable SSL certificate validation to bypass Zscaler intercept blocks
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const url = process.env.BOXOL_EVENT_URL || "https://www.boxol.it/next/it/go2/select-ticket/614173/biglietti-la-tavola-dei-300-terza-edizione-marina-di-puolo-massa-lubrense";
const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
const telegramChatId = process.env.TELEGRAM_CHAT_ID;

async function sendTelegramAlert(message) {
  if (!telegramToken || !telegramChatId) {
    console.log("Telegram configurations not set. Skipping push alert.");
    return;
  }
  const apiUrl = `https://api.telegram.org/bot${telegramToken}/sendMessage`;
  const body = JSON.stringify({
    chat_id: telegramChatId,
    text: message,
    parse_mode: "Markdown"
  });

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body
    });
    if (response.ok) {
      console.log("Telegram alert sent successfully.");
    } else {
      console.error("Failed to send Telegram alert:", await response.text());
    }
  } catch (err) {
    console.error("Error sending Telegram alert:", err);
  }
}

async function run() {
  console.log(`Starting availability check for event URL: ${url}`);
  const browser = await chromium.launch({ headless: true });
  
  try {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 1024 }
    });
    
    const page = await context.newPage();
    
    // Set a timeout of 30 seconds for loading the page
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    
    // Check if the page contains the sold-out text
    const textContent = await page.textContent('body');
    const isSoldOut = textContent.includes('Attualmente non disponibile');
    
    if (isSoldOut) {
      console.log("Status: Sold out (Attualmente non disponibile)");
      await browser.close();
      process.exit(0);
    } else {
      console.log("ALERT: Tickets might be available!");
      const message = `🚨 *Boxol Event Alert!* 🚨\nTickets for the event "La Tavola dei 300" might be available!\n\nLink: [Boxol Event](${url})`;
      await sendTelegramAlert(message);
      await browser.close();
      process.exit(1); // Exit with error code so GitHub Action fails and triggers email notification
    }
  } catch (err) {
    console.error("Error executing scraper check:", err);
    await browser.close();
    process.exit(1);
  }
}

run();
