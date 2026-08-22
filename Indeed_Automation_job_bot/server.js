const express = require('express');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Ensure data directories exist
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);
const logsFile = path.join(dataDir, 'appliedLogs.json');
const profileFile = path.join(dataDir, 'userProfile.json');
const configFile = path.join(dataDir, 'config.json');

// Initialize missing files with empty/default objects
if (!fs.existsSync(logsFile)) fs.writeFileSync(logsFile, JSON.stringify([]));
if (!fs.existsSync(profileFile)) fs.writeFileSync(profileFile, JSON.stringify({ name: "", email: "", password: "", resumePath: "", location: "", skills: "" }));
if (!fs.existsSync(configFile)) fs.writeFileSync(configFile, JSON.stringify({ role: "", matchThreshold: 70, delayMin: 3000, delayMax: 8000, smtpHost: "", smtpPort: 587, smtpUser: "", smtpPass: "" }));

let botProcess = null;
let clients = [];

// API to get current configuration
app.get('/api/config', (req, res) => {
    const profile = JSON.parse(fs.readFileSync(profileFile));
    const config = JSON.parse(fs.readFileSync(configFile));
    res.json({ ...profile, ...config });
});

// API to save configuration
app.post('/api/config', (req, res) => {
    const { name, email, password, resumePath, location, skills, role, matchThreshold, smtpHost, smtpPort, smtpUser, smtpPass } = req.body;
    fs.writeFileSync(profileFile, JSON.stringify({ name, email, password, resumePath, location, skills }, null, 2));
    // Load config, update specific and save
    const config = JSON.parse(fs.readFileSync(configFile));
    config.role = role || "";
    config.matchThreshold = matchThreshold || 70;
    config.smtpHost = smtpHost || "";
    config.smtpPort = smtpPort || 587;
    config.smtpUser = smtpUser || "";
    config.smtpPass = smtpPass || "";
    fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
    res.json({ success: true });
});

// Real-time Event Stream (SSE) for bot logs
app.get('/api/stream', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Send initial connection success message
    res.write(`data: ${JSON.stringify({ type: 'info', message: 'Connected to server logs' })}\n\n`);

    clients.push(res);
    req.on('close', () => {
        clients = clients.filter(c => c !== res);
    });
});

function broadcastEvent(type, message, data = null) {
    const eventString = `data: ${JSON.stringify({ type, message, data })}\n\n`;
    clients.forEach(client => client.write(eventString));
}

// Start Bot
app.post('/api/start', (req, res) => {
    if (botProcess) {
        return res.status(400).json({ error: 'Bot is already running' });
    }

    broadcastEvent('info', '>> Bot initialization started...');

    // Path to the bot script
    const botScript = path.join(__dirname, 'src', 'index.js');
    if (!fs.existsSync(botScript)) {
        broadcastEvent('error', `Bot script not found at ${botScript}. Please check implementation.`);
        return res.status(500).json({ error: 'Bot script not found' });
    }

    botProcess = spawn('node', [botScript]);

    botProcess.stdout.on('data', (data) => {
        const text = data.toString().trim();
        broadcastEvent('log', text);

        // Specifically detect if a job was just logged/applied to trigger UI refresh
        if (text.includes('[LOG] Saved application')) {
            // Extract title and company for the popup (Regex search for "application: Title at Company")
            const match = text.match(/application: (.*?) at (.*?) \(/);
            const detail = match ? { title: match[1], company: match[2] } : 'New application recorded';
            broadcastEvent('applied', detail);
        }

        console.log(`[BOT OUT] ${text}`);
    });

    botProcess.stderr.on('data', (data) => {
        const text = data.toString().trim();
        broadcastEvent('error', text);
        console.error(`[BOT ERR] ${text}`);
    });

    botProcess.on('close', (code) => {
        botProcess = null;
        broadcastEvent('info', `>> Bot finished with code ${code}`);
    });

    res.json({ success: true, message: 'Bot started' });
});

// Stop Bot
app.post('/api/stop', (req, res) => {
    if (botProcess) {
        botProcess.kill();
        botProcess = null;
        broadcastEvent('info', '>> Bot forcefully stopped by user');
        return res.json({ success: true, message: 'Bot stopped' });
    }
    res.status(400).json({ error: 'Bot is not running' });
});

// Basic endpoint to get historically applied jobs (for dashboard charts / lists)
app.get('/api/logs', (req, res) => {
    const logs = JSON.parse(fs.readFileSync(logsFile));
    res.json(logs);
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
