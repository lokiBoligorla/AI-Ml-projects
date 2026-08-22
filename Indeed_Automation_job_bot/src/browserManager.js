const { chromium } = require('playwright-extra');
const stealth = require('puppeteer-extra-plugin-stealth')();
chromium.use(stealth);

/**
 * Initializes and returns a hidden, bot-evading Playwright Browser context.
 */
async function launchBrowser() {
    console.log("Launching stealth browser instance...");
    
    // We launch non-headless so the user can see what's happening initially. 
    // In production/CLI, could be set to true.
    const browser = await chromium.launch({ 
        headless: false,
        args: [
            '--disable-blink-features=AutomationControlled',
            '--start-maximized'
        ]
    });

    const context = await browser.newContext({
        viewport: null, // use window size
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36"
    });

    const page = await context.newPage();
    
    // Helper function for random delays to mimic human behavior
    page.randomWait = async (min = 2000, max = 5000) => {
        const ms = Math.floor(Math.random() * (max - min + 1)) + min;
        console.log(`Waiting for ${ms} ms...`);
        await page.waitForTimeout(ms);
    };

    return { browser, context, page };
}

module.exports = { launchBrowser };
