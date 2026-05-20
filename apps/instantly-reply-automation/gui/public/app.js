/**
 * Instantly Reply Automation GUI
 * Frontend JavaScript
 */

console.log('App.js loaded');

// WebSocket connection
let ws = null;
let isConnected = false;

// State
let config = {};
let emails = [];
let results = [];

// DOM Elements
const connectionStatus = document.getElementById('connectionStatus');
const statusDot = connectionStatus?.querySelector('.status-dot');
const statusText = connectionStatus?.querySelector('.status-text');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM Content Loaded');

  try {
    document.body.classList.remove('loading');
    addLog('info', 'Page loaded, initializing...');
    setupNavigation();
    setupForms();
    connectWebSocket();
    loadConfig();
  } catch (error) {
    console.error('Initialization error:', error);
    addLog('error', `Initialization error: ${error.message}`);
  }
});

// WebSocket Connection
function connectWebSocket() {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsUrl = `${protocol}//${window.location.host}`;

  addLog('info', `Connecting to WebSocket at ${wsUrl}`);
  console.log('WebSocket URL:', wsUrl);

  ws = new WebSocket(wsUrl);

  ws.onopen = () => {
    isConnected = true;
    statusDot?.classList.add('connected');
    statusText.textContent = 'Connected';
    addLog('info', 'Connected to server');
  };

  ws.onclose = () => {
    isConnected = false;
    statusDot?.classList.remove('connected');
    statusText.textContent = 'Disconnected';
    addLog('warn', 'Disconnected from server');
    // Reconnect after 3 seconds
    setTimeout(connectWebSocket, 3000);
  };

  ws.onerror = (error) => {
    addLog('error', 'WebSocket error');
    addLog('error', `Error details: ${error ? JSON.stringify(error) : 'No error object'}`);
    console.error('WebSocket error:', error);
  };

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);

      switch (data.type) {
        case 'connected':
          config = data.config;
          updateConfigForm();
          break;
        case 'configUpdated':
          config = data.config;
          break;
        case 'log':
          addLog(data.level, data.message, data.data);
          break;
        case 'result':
          handleResult(data.data);
          break;
      }
    } catch (e) {
      console.error('Error parsing WebSocket message:', e);
    }
  };
}

// Navigation
function setupNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  const tabs = document.querySelectorAll('.tab');

  navItems.forEach((item) => {
    item.addEventListener('click', () => {
      const tabName = item.dataset.tab;

      // Update nav
      navItems.forEach((nav) => nav.classList.remove('active'));
      item.classList.add('active');

      // Update tabs
      tabs.forEach((tab) => tab.classList.remove('active'));
      document.getElementById(`${tabName}-tab`)?.classList.add('active');
    });
  });
}

// Forms
function setupForms() {
  // Config form
  document.getElementById('saveConfigBtn')?.addEventListener('click', async () => {
    const form = document.getElementById('configForm');
    const formData = new FormData(form);

    const autoSendEnabled = document.getElementById('autoSendEnabled')?.checked;
    const autoSendConfidence = document.getElementById('autoSendConfidence')?.value;

    const configData = {
      instantlyApiKey: formData.get('instantlyApiKey') || undefined,
      zaiApiKey: formData.get('zaiApiKey') || undefined,
      aiBaseUrl: formData.get('aiBaseUrl'),
      campaignId: formData.get('campaignId'),
      eaccount: formData.get('eaccount'),
      autoSendEnabled,
      autoSendConfidence: parseFloat(autoSendConfidence),
    };

    try {
      const response = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(configData),
      });

      const result = await response.json();
      if (result.success) {
        addLog('info', 'Configuration saved');
      } else {
        addLog('error', result.error || 'Failed to save configuration');
      }
    } catch (error) {
      addLog('error', `Failed to save configuration: ${error.message}`);
    }
  });

  // Confidence slider
  const confidenceSlider = document.getElementById('autoSendConfidence');
  const confidenceValue = document.getElementById('confidenceValue');
  confidenceSlider?.addEventListener('input', () => {
    if (confidenceValue) {
      confidenceValue.textContent = confidenceSlider.value;
    }
  });

  // Refresh emails
  document.getElementById('refreshBtn')?.addEventListener('click', refreshEmails);

  // Run dry run
  document.getElementById('runDryRunBtn')?.addEventListener('click', () => {
    runAutomation(true);
  });

  // Run auto-send
  document.getElementById('runAutoSendBtn')?.addEventListener('click', () => {
    runAutomation(false);
  });

  // Clear logs
  document.getElementById('clearLogsBtn')?.addEventListener('click', () => {
    const logsContainer = document.getElementById('logsContainer');
    if (logsContainer) {
      logsContainer.innerHTML = '';
    }
  });

  // Test form
  document.getElementById('testForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    await testEmail();
  });
}

// Load initial config
async function loadConfig() {
  try {
    const response = await fetch('/api/config');
    const data = await response.json();
    config = data;
    updateConfigForm();
  } catch (error) {
    addLog('error', `Failed to load configuration: ${error.message}`);
  }
}

// Update config form with current values
function updateConfigForm() {
  const form = document.getElementById('configForm');
  if (!form) return;

  if (config.aiBaseUrl) {
    form.querySelector('[name="aiBaseUrl"]').value = config.aiBaseUrl;
  }
  if (config.campaignId) {
    form.querySelector('[name="campaignId"]').value = config.campaignId;
  }
  if (config.eaccount) {
    form.querySelector('[name="eaccount"]').value = config.eaccount;
  }

  const autoSendEnabled = document.getElementById('autoSendEnabled');
  if (autoSendEnabled) {
    autoSendEnabled.checked = config.autoSendEnabled;
  }

  const autoSendConfidence = document.getElementById('autoSendConfidence');
  const confidenceValue = document.getElementById('confidenceValue');
  if (autoSendConfidence && confidenceValue) {
    autoSendConfidence.value = config.autoSendConfidence || 0.85;
    confidenceValue.textContent = config.autoSendConfidence || 0.85;
  }
}

// Refresh emails
async function refreshEmails() {
  const btn = document.getElementById('refreshBtn');
  btn.disabled = true;
  btn.innerHTML = '<span class="loading"></span> Loading...';

  try {
    const response = await fetch('/api/emails');
    const data = await response.json();

    if (data.success) {
      emails = data.emails;
      renderEmails();
      addLog('info', `Loaded ${emails.length} email(s)`);
    } else {
      addLog('error', data.error || 'Failed to load emails');
    }
  } catch (error) {
    addLog('error', `Failed to load emails: ${error.message}`);
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<span>🔄</span> Refresh Emails';
  }
}

// Render emails
function renderEmails() {
  const container = document.getElementById('emailsContainer');
  if (!container) return;

  if (emails.length === 0) {
    container.innerHTML = '<p class="empty-state">No unread emails found</p>';
    return;
  }

  container.innerHTML = emails.map((email) => {
    const fromEmail = email.from_address_email || email.lead;
    const subject = email.subject || '(No subject)';
    const body = getBodyText(email);
    const contentPreview = body.slice(0, 100);

    return `
      <div class="email-item" data-id="${email.id}">
        <div class="email-header">
          <span class="email-from">${fromEmail}</span>
          <span class="email-subject">${subject}</span>
        </div>
        <div class="email-body">${contentPreview}${body.length > 100 ? '...' : ''}</div>
        <div class="email-meta">
          <span>${new Date(email.timestamp_email * 1000 || Date.now()).toLocaleDateString()}</span>
        </div>
      </div>
    `;
  }).join('');
}

// Get body text from email
function getBodyText(email) {
  if (!email.body) return '';

  if (typeof email.body === 'string') {
    return email.body;
  }

  if (email.body.text) {
    return email.body.text;
  }

  return '';
}

// Run automation
async function runAutomation(dryRun) {
  const btn = dryRun ? document.getElementById('runDryRunBtn') : document.getElementById('runAutoSendBtn');
  btn.disabled = true;
  btn.innerHTML = '<span class="loading"></span> Running...';

  try {
    const response = await fetch('/api/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dryRun }),
    });

    const result = await response.json();

    if (result.success) {
      addLog('info', `${dryRun ? 'Dry run' : 'Automation'} started`);
    } else {
      addLog('error', result.error || 'Failed to start automation');
    }
  } catch (error) {
    addLog('error', `Failed to start automation: ${error.message}`);
  } finally {
    setTimeout(() => {
      btn.disabled = false;
      btn.innerHTML = dryRun ? '<span>👀</span> Run (Dry Run)' : '<span>🚀</span> Run (Auto-Send)';
    }, 2000);
  }
}

// Handle result from automation
function handleResult(result) {
  results.unshift(result);
  renderResults();

  // Update email item status
  const emailItem = document.querySelector(`.email-item[data-id="${result.emailId}"]`);
  if (emailItem) {
    emailItem.classList.add('processed');
    if (result.sent) {
      emailItem.classList.add('sent');
      const emailMeta = emailItem.querySelector('.email-meta');
      if (emailMeta) {
        emailMeta.innerHTML += `
        <span class="email-badge sent">Sent</span>
        `;
      }
    }
  }
}

// Render results
function renderResults() {
  const container = document.getElementById('resultsContainer');
  if (!container) return;

  if (results.length === 0) {
    container.innerHTML = '<p class="empty-state">No results yet</p>';
    return;
  }

  container.innerHTML = results.slice(0, 10).map((result) => {
    const intent = result.analysis?.intent || 'OTHER';
    const confidence = result.analysis?.confidence || 0;
    const replyPreview = result.reply?.body?.slice(0, 150) || '';

    return `
      <div class="result-item">
        <div class="result-header">
          <span class="result-email">${result.fromEmail || 'Unknown'}</span>
          <span class="result-intent ${intent}">${intent}</span>
        </div>
        <div class="result-confidence">Confidence: ${(confidence * 100).toFixed(0)}%</div>
        ${result.reply ? `<div class="result-reply">${replyPreview}...</div>` : ''}
      </div>
    `;
  }).join('');
}

// Test email
async function testEmail() {
  const fromEmail = document.getElementById('testFromEmail')?.value;
  const subject = document.getElementById('testSubject')?.value;
  const firstName = document.getElementById('testFirstName')?.value;
  const body = document.getElementById('testBody')?.value;

  if (!fromEmail || !body) {
    alert('Please fill in at least the email address and body');
    return;
  }

  addLog('info', `Testing email from ${fromEmail}`);

  try {
    // Analyze
    const analyzeResponse = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fromEmail, subject, body, firstName }),
    });

    const analyzeData = await analyzeResponse.json();

    if (!analyzeData.success) {
      throw new Error(analyzeData.error || 'Analysis failed');
    }

    addLog('info', `Analysis result: ${analyzeData.analysis.intent}`);

    // Generate reply
    const generateResponse = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ analysis: analyzeData.analysis, originalSubject: subject }),
    });

    const generateData = await generateResponse.json();

    if (!generateData.success) {
      throw new Error(generateData.error || 'Generation failed');
    }

    addLog('info', 'Reply generated successfully');

    // Show result
    showTestResult(analyzeData.analysis, generateData.reply);

  } catch (error) {
    addLog('error', `Test failed: ${error.message}`);
  }
}

// Show test result
function showTestResult(analysis, reply) {
  const card = document.getElementById('testResultCard');
  const content = document.getElementById('testResultContent');

  if (!card || !content) return;

  card.style.display = 'block';

  content.innerHTML = `
    <div class="test-result-section">
      <h3>Analysis</h3>
      <div class="test-result-content">
        <strong>Intent:</strong> ${analysis.intent}<br>
        ${analysis.objectionType ? `<strong>Objection Type:</strong> ${analysis.objectionType}<br>` : ''}
        <strong>Confidence:</strong> ${(analysis.confidence * 100).toFixed(0)}%<br>
        ${analysis.firstName ? `<strong>First Name:</strong> ${analysis.firstName}<br>` : ''}
        ${analysis.keyPoints ? `<strong>Key Points:</strong> ${analysis.keyPoints.join(', ')}<br>` : ''}
      </div>
    </div>
    <div class="test-result-section">
      <h3>Generated Reply</h3>
      <div class="test-result-content">${reply.body || ''}</div>
    </div>
  `;

  // Scroll to result
  card.scrollIntoView({ behavior: 'smooth' });
}

// Add log entry
function addLog(level, message, data) {
  const container = document.getElementById('logsContainer');
  if (!container) return;

  const timestamp = new Date().toLocaleTimeString();
  const dataStr = data ? ` ${JSON.stringify(data)}` : '';

  const logEntry = document.createElement('div');
  logEntry.className = 'log-entry';
  logEntry.innerHTML = `
    <span class="log-time">${timestamp}</span>
    <span class="log-level ${level}">${level.toUpperCase()}</span>
    <span class="log-message">${message}${dataStr}</span>
  `;

  container.appendChild(logEntry);
  container.scrollTop = container.scrollHeight;
}
