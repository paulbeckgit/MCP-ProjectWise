import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const LOGIN_URL = process.env.PW_LOGIN_URL || 'https://projectwise365.bentley.com/';
const SESSION_KEY = process.env.PW_OIDC_STORAGE_KEY || 'oidc.user:https://imsoidc.bentley.com/:projectwise-365';
const TIMEOUT_SECONDS = Number(process.env.PW_LOGIN_TIMEOUT || 120);
const POLL_INTERVAL_MS = 2000;

function saveToken(token) {
  const outPath = resolve(__dirname, 'token.json');
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, JSON.stringify(token, null, 2));
  console.log(`✅ Token saved to ${outPath}`);
}

async function pollForToken(page) {
  const attempts = Math.ceil((TIMEOUT_SECONDS * 1000) / POLL_INTERVAL_MS);
  for (let i = 0; i < attempts; i++) {
    let token;
    try {
      token = await page.evaluate((key) => {
        const raw = sessionStorage.getItem(key);
        if (!raw) return null;
        try {
          const parsed = JSON.parse(raw);
          if (!parsed.access_token) return null;
          return {
            access_token: parsed.access_token,
            token_type: parsed.token_type || 'Bearer',
            expires_at: parsed.expires_at || null,
            fetched_at: Math.floor(Date.now() / 1000),
            source_key: key,
          };
        } catch (err) {
          console.error('Failed to parse token JSON', err);
          return null;
        }
      }, SESSION_KEY);
    } catch (err) {
      // Can occur during redirects when the execution context is destroyed; just retry.
      await page.waitForTimeout(500);
    }

    if (token?.access_token) return token;
    await page.waitForTimeout(POLL_INTERVAL_MS);
  }
  return null;
}

async function main() {
  console.log('Opening browser for ProjectWise login...');
  console.log(`Login URL: ${LOGIN_URL}`);
  console.log(`Waiting up to ${TIMEOUT_SECONDS}s for sessionStorage key: ${SESSION_KEY}`);

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto(LOGIN_URL, { waitUntil: 'load' });
  console.log('Please complete login in the opened browser window. Leave this window open.');

  const token = await pollForToken(page);
  if (!token) {
    console.error('❌ No token detected before timeout. Make sure you are fully signed in and the sessionStorage key exists.');
    await browser.close();
    process.exit(1);
  }

  saveToken(token);
  await browser.close();
}

main().catch((err) => {
  console.error('❌ Token fetch failed:', err);
  process.exit(1);
});
