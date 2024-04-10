import { Browser, BrowserContext, Page, chromium } from "playwright";

let browser: Browser | null = null;
let context: BrowserContext | null = null;
let page: Page | null = null;

export const playwrightAction = {
  postInstagram: async () =>  {
    if (page?.isClosed() === false) return page;
    try {
      console.log("browser")
      browser = await chromium.launch({ headless: false });
      context = await browser.newContext({ locale: 'ja-JP' });
      page = await context.newPage();

      await page.goto('https://www.instagram.com/');
      await browser.close();
    } catch (e) {
    }
  }
}