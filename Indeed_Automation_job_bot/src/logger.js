const fs = require('fs');
const path = require('path');

const logsFile = path.join(__dirname, '../data', 'appliedLogs.json');

/**
 * Ensures the log file exists and returns the parsed array.
 */
function getLogs() {
    if (!fs.existsSync(logsFile)) {
        fs.writeFileSync(logsFile, JSON.stringify([]));
    }
    const data = fs.readFileSync(logsFile);
    return JSON.parse(data);
}

function hasApplied(jobUrl) {
    // Strip tracking parameters from indeed urls for accurate matching
    const cleanUrl = jobUrl.split('?')[0];
    const logs = getLogs();
    // Only skip if the previous attempt was a success
    return logs.some(log => log.link.includes(cleanUrl) && log.status === 'success');
}

/**
 * Save a new job application log.
 */
function logApplication(title, company, link, matchScore, status = 'success') {
    const logs = getLogs();
    logs.push({
        title,
        company,
        link,
        matchScore,
        status,
        date: new Date().toISOString()
    });
    fs.writeFileSync(logsFile, JSON.stringify(logs, null, 2));
    console.log(`[LOG] Saved application: ${title} at ${company} (${status})`);
}

module.exports = { hasApplied, logApplication, getLogs };
