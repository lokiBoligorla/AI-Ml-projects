const fs = require('fs');
const path = require('path');
const { launchBrowser } = require('./browserManager');
const { scrapeJobLinks, waitForCloudflare } = require('./scraper');
const { applyToJob } = require('./applier');
const { hasApplied, logApplication } = require('./logger');
const { calculateMatchScore } = require('./skillMatcher');
const { sendConfirmationEmail } = require('./emailService');

// Load configurations
const configPath = path.join(__dirname, '../data', 'config.json');
const profilePath = path.join(__dirname, '../data', 'userProfile.json');

let config = {};
let profile = {};

try {
    config = JSON.parse(fs.readFileSync(configPath));
    profile = JSON.parse(fs.readFileSync(profilePath));
} catch (e) {
    console.error(`[SYSTEM ERROR] Could not load configs. Please check data/config.json and data/userProfile.json`);
    process.exit(1);
}

async function runBot() {
    console.log(`[SYSTEM] Starting ZipRecruiter Autopilot Bot...`);
    console.log(`[SYSTEM] Target Role: ${config.role} | Location: ${profile.location}`);
    
    if(!profile.skills || profile.skills.trim() === '') {
        console.error(`[SYSTEM ERROR] No skills provided in profile. Aborting.`);
        process.exit(1);
    }

    const sys = await launchBrowser();
    const page = sys.page;
    const browser = sys.browser;

    try {
        // Step 1: Scrape Job Links from Indeed
        const jobUrls = await scrapeJobLinks(page, config.role, profile.location);

        if (jobUrls.length === 0) {
            console.log(`[SYSTEM] No jobs found for the current query on Indeed.`);
        } else {
            console.log(`[SYSTEM] Starting application process for ${jobUrls.length} jobs.`);
            
            // Step 2: Process jobs iteratively
            for (let i = 0; i < jobUrls.length; i++) {
                const url = jobUrls[i];
                console.log(`\n[SYSTEM] --- Processing Job ${i+1}/${jobUrls.length} ---`);
                console.log(`[SYSTEM] URL: ${url}`);

                // Navigate to the job page
                try {
                    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
                } catch (e) {
                    console.error(`[SYSTEM ERROR] Failed to navigate to ${url}: ${e.message}`);
                    if (page.isClosed()) break;
                    continue;
                }
                await page.randomWait(2000, 4000);
                
                // Handle any Cloudflare challenge that may appear on job pages
                if (page.isClosed()) break;
                await waitForCloudflare(page, url);

                if (page.isClosed()) break;
                const result = await applyToJob(page, profile);
                
                if (result === true) {
                    console.log(`[SYSTEM] Successfully applied.`);
                    logApplication("Indeed Job", "Unknown", "Indeed", 100, 'success');
                } else if (result === 'external_site' || result === 'external_filled') {
                    console.log(`[SYSTEM] External site application attempt (Result: ${result}).`);
                } else if (result === 'manual_action') {
                    console.log(`[SYSTEM] Manual action required for this application.`);
                } else {
                    console.log(`[SYSTEM] Application failed.`);
                }

                // Add delay between jobs
                if (page.isClosed()) {
                    console.log("[SYSTEM] Page was closed. Ending loop.");
                    break;
                }
                await page.waitForTimeout(Math.floor(Math.random() * (config.delayMax - config.delayMin) + config.delayMin));
            }
        }

        console.log(`\n[SYSTEM] Finished processing all found jobs.`);

    } catch (e) {
        console.error(`[FATAL ERROR] Bot crash:`, e.stack);
    } finally {
        console.log(`[SYSTEM] Execution complete. Browser will stay open for 10 seconds for review.`);
        await new Promise(resolve => setTimeout(resolve, 10000));
        console.log(`[SYSTEM] Closing browser.`);
        await browser.close();
        process.exit(0);
    }
}

// Execute the Bot Workflow
runBot();
