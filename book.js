import { chromium } from 'playwright';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const url = process.env.BOXOL_EVENT_URL || "https://www.boxol.it/next/it/go2/select-ticket/614173/biglietti-la-tavola-dei-300-terza-edizione-marina-di-puolo-massa-lubrense";
const email = process.env.BOXOL_EMAIL;
const password = process.env.BOXOL_PASSWORD;
const ticketCount = parseInt(process.env.TICKET_COUNT || "2", 10);
const ticketName = process.env.TICKET_NAME; // Optional filter

async function run() {
  if (!email || !password) {
    console.error("Error: BOXOL_EMAIL and BOXOL_PASSWORD environment variables are required for auto-booking.");
    process.exit(1);
  }

  console.log(`Starting automated booking for event: ${url}`);
  console.log(`Configured for ${ticketCount} tickets using user: ${email}`);

  const browser = await chromium.launch({ headless: false }); // Launch in headful mode so we can see what's happening
  const context = await browser.newContext({
    viewport: { width: 1280, height: 1024 }
  });

  const page = await context.newPage();

  try {
    // 1. Navigate to target URL
    console.log("Navigating to event page...");
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    await page.screenshot({ path: 'step1_event_page.png' });

    // 2. Accept cookies if banner is present
    console.log("Checking for cookie consent banner...");
    try {
      const cookieButton = page.locator('button:has-text("Consenti tutti"), button:has-text("Accetta tutti"), button:has-text("Accept all")');
      if (await cookieButton.count() > 0) {
        await cookieButton.first().click({ timeout: 5000 });
        console.log("Accepted cookie consent.");
      }
    } catch (e) {
      console.log("No cookie banner detected or error accepting cookies (non-blocking).");
    }

    // 3. Find and select ticket
    console.log("Locating ticket ticket options...");
    let ticketContainer;
    if (ticketName) {
      ticketContainer = page.locator('ol > li, div').filter({ hasText: ticketName }).first();
    } else {
      // Default to first ticket container list option
      ticketContainer = page.locator('ol > li, div.ticket-type-container').first();
    }

    if (await ticketContainer.count() === 0) {
      // Fallback: search anywhere on the page
      ticketContainer = page.locator('body');
    }

    const plusButton = ticketContainer.locator('button.primary.bk-secondary:has-text("+"), button:has-text("+")').first();
    if (await plusButton.count() === 0) {
      throw new Error("Could not find ticket increment (+) button. Event may be sold out.");
    }

    console.log(`Selecting ${ticketCount} tickets...`);
    for (let i = 0; i < ticketCount; i++) {
      await plusButton.click();
      console.log(`Clicked '+' button (${i + 1}/${ticketCount})`);
      await page.waitForTimeout(500); // Allow animation delay
    }
    await page.screenshot({ path: 'step2_tickets_selected.png' });

    // 4. Click 'Aggiungi' (Add to cart) button
    console.log("Clicking 'Aggiungi' (Add to cart) button...");
    const buyButton = page.locator('button.primary.bk-primary:has-text("Aggiungi"), button:has-text("Aggiungi")').first();
    if (await buyButton.count() === 0) {
      throw new Error("Could not find 'Aggiungi' button.");
    }
    await buyButton.click();
    console.log("Added tickets to cart. Waiting for page update...");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'step3_added_to_cart.png' });

    // 5. Click 'Conferma' (Confirm selection) button
    console.log("Clicking 'Conferma' button to proceed to checkout...");
    const confirmButton = page.locator('button.primary.bk-primary:has-text("Conferma"), button:has-text("Conferma")').first();
    if (await confirmButton.count() === 0) {
      console.log("No explicit 'Conferma' button found, checking if already redirected to login...");
    } else {
      await confirmButton.click();
      await page.waitForTimeout(2000);
    }
    await page.screenshot({ path: 'step4_login_page.png' });

    // 6. Fill in Login form
    console.log("Filling in authentication credentials...");
    
    // Select email input
    const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="Email"]').first();
    if (await emailInput.count() > 0) {
      await emailInput.fill(email);
    } else {
      // Fallback: first input element on the login page
      await page.locator('input').first().fill(email);
    }

    // Select password input
    const passwordInput = page.locator('input[type="password"], input[name="password"], input[placeholder*="Password"]').first();
    if (await passwordInput.count() > 0) {
      await passwordInput.fill(password);
    } else {
      // Fallback: second input element
      await page.locator('input').nth(1).fill(password);
    }

    await page.screenshot({ path: 'step5_credentials_filled.png' });

    // Click 'Accedi' (Sign in) button
    console.log("Submitting login form...");
    const loginSubmit = page.locator('button.primary.bk-primary:has-text("Accedi"), button:has-text("Accedi")').first();
    if (await loginSubmit.count() === 0) {
      throw new Error("Could not find login submit button.");
    }
    await loginSubmit.click();
    
    console.log("Waiting for redirection to payment selection page...");
    await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 15000 }).catch(() => {
      console.log("Navigation timeout or client-side redirect complete.");
    });
    
    await page.screenshot({ path: 'step6_checkout_ready.png' });
    console.log("Successfully reached the checkout checkout gate!");
    console.log("Booking automation is complete. Please complete the payment details manually in the browser window.");

  } catch (err) {
    console.error("Booking automation failed with error:", err);
    await page.screenshot({ path: 'error_state.png' });
  } finally {
    // Keep browser open for 3 minutes for human completion if headful, otherwise exit
    console.log("Keeping browser open for 2 minutes to allow manual payment completion...");
    await page.waitForTimeout(120000);
    await browser.close();
  }
}

run();
