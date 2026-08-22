document.addEventListener('DOMContentLoaded', () => {
    const configForm = document.getElementById('config-form');
    const btnStart = document.getElementById('btn-start');
    const btnStop = document.getElementById('btn-stop');
    const terminalOutput = document.getElementById('terminal-output');
    const statusIndicator = document.getElementById('status-indicator');
    const statusText = document.getElementById('status-text');
    const logsBody = document.getElementById('logs-body');
    const alertContainer = document.getElementById('alert-container');
    const successModal = document.getElementById('success-modal');
    const btnCloseSuccess = document.getElementById('btn-close-success');
    const successDetails = document.getElementById('success-details');
    
    // Navigation elements
    const navConfig = document.getElementById('nav-config');
    const navJobs = document.getElementById('nav-jobs');
    const configSection = document.getElementById('config-section');
    const appliedJobsSection = document.getElementById('applied-jobs-section');
    const terminalCard = document.querySelector('.terminal-card');
    
    let botRunning = false;
    let eventSource = null;

    // Load initial config
    fetch('/api/config')
        .then(res => res.json())
        .then(data => {
            document.getElementById('name').value = data.name || '';
            document.getElementById('email').value = data.email || '';
            document.getElementById('password').value = data.password || '';
            document.getElementById('resumePath').value = data.resumePath || '';
            document.getElementById('location').value = data.location || '';
            document.getElementById('skills').value = data.skills || '';
            document.getElementById('role').value = data.role || '';
            document.getElementById('matchThreshold').value = data.matchThreshold || 70;
            document.getElementById('smtpHost').value = data.smtpHost || '';
            document.getElementById('smtpPort').value = data.smtpPort || 587;
            document.getElementById('smtpUser').value = data.smtpUser || '';
            document.getElementById('smtpPass').value = data.smtpPass || '';
        });

    // Function to load/refresh and display logs
    function loadLogs() {
        return fetch('/api/logs')
            .then(res => res.json())
            .then(logs => {
                if (logs.length > 0) {
                    logsBody.innerHTML = '';
                    logs.slice().reverse().forEach((log, index) => {
                        const tr = document.createElement('tr');
                        if (index === 0) tr.classList.add('new-row');
                        
                        let displayStatus = log.status;
                        let statusClass = "status-muted";
                        
                        if (log.status === 'success') {
                            displayStatus = "✅ Applied";
                            statusClass = "status-applied";
                        } else if (log.status === 'failed') {
                            displayStatus = "❌ Failed";
                            statusClass = "status-failed";
                        } else if (log.status === 'manual') {
                            displayStatus = "👋 Manual Needed";
                            statusClass = "status-manual";
                        } else if (log.status === 'external') {
                            displayStatus = "🌐 External Site";
                            statusClass = "status-low-match"; // Reusing low-match style for now or add new
                        } else if (log.status === 'assistant') {
                            displayStatus = "🤖 Assistant Applied";
                            statusClass = "status-success";
                        } else if (log.status.includes('skipped') || log.status.includes('low score')) {
                            displayStatus = "⚠️ Low Match";
                            statusClass = "status-low-match";
                        }

                        tr.innerHTML = `
                            <td>${new Date(log.date).toLocaleDateString()}</td>
                            <td>${log.title}</td>
                            <td>${log.company}</td>
                            <td>${log.matchScore}%</td>
                            <td><span class="${statusClass}">${displayStatus}</span></td>
                        `;
                        logsBody.appendChild(tr);
                    });
                    feather.replace();
                }
            });
    }

    // Initial load
    loadLogs();

    // Success Modal Close
    btnCloseSuccess.addEventListener('click', () => {
        successModal.style.display = 'none';
    });

    // Save config form
    configForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(configForm);
        const data = Object.fromEntries(formData.entries());
        data.matchThreshold = parseInt(data.matchThreshold);

        // --- Validation Logic ---
        const requiredFields = {
            'email': 'Indeed Email',
            'password': 'Indeed Password',
            'resumePath': 'Resume Path / Filename',
            'role': 'Target Job Role',
            'skills': 'Your Skills',
            'location': 'Job Location'
        };

        let missing = [];
        for (const [key, label] of Object.entries(requiredFields)) {
            if (!data[key] || data[key].trim() === '') {
                missing.push(label);
            }
        }

        if (missing.length > 0) {
            showAlert('error', `<b>Missing Information!</b> Please fill in: ${missing.join(', ')}`);
            appendLog('error', `Validation failed: Missing ${missing.join(', ')}`);
            return; // Stop submission
        }
        // -----------------------

        fetch('/api/config', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }).then(res => res.json()).then(resData => {
            if(resData.success) {
                appendLog('info', 'Configuration saved.');
                showAlert('success', 'Configuration saved successfully.');
            }
        });
    });

    // Alert helper
    function showAlert(type, message) {
        const div = document.createElement('div');
        div.className = `alert-banner alert-${type}`;
        
        const icon = type === 'success' ? 'check-circle' : 'alert-triangle';
        div.innerHTML = `<i data-feather="${icon}"></i> <span>${message}</span>`;
        
        alertContainer.prepend(div);
        feather.replace();

        // Auto remove success alerts, keep error/manual alerts
        if (type === 'success') {
            setTimeout(() => div.remove(), 5000);
        }
    }

    // Append log helper
    function appendLog(type, message) {
        const div = document.createElement('div');
        div.className = `log-entry ${type}`;
        div.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
        terminalOutput.appendChild(div);
        terminalOutput.scrollTop = terminalOutput.scrollHeight;

        // Peak into logs for special keywords
        if (typeof message === 'string') {
            if (message.includes('Manual Intervention Required')) {
                showAlert('error', '<b>Manual Intervention Needed!</b> The bot is stuck on a login or complex form. Please check the browser window.');
            }
        }
    }

    // Connect SSE for bot logs
    function startLogStream() {
        if(eventSource) eventSource.close();
        eventSource = new EventSource('/api/stream');
        
        eventSource.onmessage = (event) => {
            const data = JSON.parse(event.data);
            
            if (data.type === 'applied') {
                loadLogs(); // Refresh the table
                
                // Show Success Popup
                if (data.message && typeof data.message === 'object') {
                    successDetails.innerHTML = `Successfully applied to <b>${data.message.title}</b> at <b>${data.message.company}</b>`;
                    successModal.style.display = 'flex';
                    feather.replace();
                } else {
                    showAlert('success', 'Successfully processed a new job application!');
                }

            } else {
                appendLog(data.type, data.message || data.data);
            }
            
            if (data.type === 'info' && (typeof data.message === 'string' && data.message.includes('Bot finished'))) {
                setBotStatus(false);
            }
        };
    }

    // Toggle Status UI
    function setBotStatus(running) {
        botRunning = running;
        btnStart.disabled = running;
        btnStop.disabled = !running;
        
        if (running) {
            statusIndicator.className = 'status-indicator online';
            statusText.textContent = 'Bot Running';
            alertContainer.innerHTML = ''; // Clear old alerts
        } else {
            statusIndicator.className = 'status-indicator offline';
            statusText.textContent = 'Bot Offline';
        }
    }

    // Start Bot Action
    btnStart.addEventListener('click', () => {
        fetch('/api/start', { method: 'POST' })
            .then(res => res.json())
            .then(data => {
                if(data.success) {
                    setBotStatus(true);
                    startLogStream();
                    appendLog('info', 'Starting Indeed Job AutoPilot...');
                } else {
                    appendLog('error', 'Failed to start bot: ' + data.error);
                }
            })
            .catch(err => appendLog('error', 'Server error while starting bot.'));
    });

    // Stop Bot Action
    btnStop.addEventListener('click', () => {
        fetch('/api/stop', { method: 'POST' })
            .then(res => res.json())
            .then(data => {
                setBotStatus(false);
                appendLog('warn', 'Bot manually stopped.');
            });
    });

    // Sidebar Navigation Logic
    function showSection(section) {
        // Reset all
        configSection.style.display = 'none';
        appliedJobsSection.style.display = 'none';
        terminalCard.style.display = 'none';
        navConfig.classList.remove('active');
        navJobs.classList.remove('active');

        if (section === 'config') {
            configSection.style.display = 'grid';
            terminalCard.style.display = 'block';
            navConfig.classList.add('active');
        } else if (section === 'jobs') {
            appliedJobsSection.style.display = 'block';
            navJobs.classList.add('active');
            loadLogs(); // Refresh logs when viewing
        }
    }

    navConfig.addEventListener('click', (e) => {
        e.preventDefault();
        showSection('config');
    });

    navJobs.addEventListener('click', (e) => {
        e.preventDefault();
        showSection('jobs');
    });

    // Default view
    showSection('config');

    // Start logs stream
    startLogStream();
    setBotStatus(false);
});
