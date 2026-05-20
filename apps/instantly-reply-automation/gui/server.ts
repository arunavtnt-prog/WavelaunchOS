#!/usr/bin/env node

/**
 * GUI Server for Instantly Reply Automation
 * Simple Express server with WebSocket support for real-time logs
 */

import express from 'express';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

import { InstantlyClient } from '../src/instantly-client.js';
import { AIClient } from '../src/ai-client.js';
import { ReplyAnalyzer } from '../src/analyzer.js';
import { ReplyGenerator } from '../src/generator.js';
import type { ProcessResult } from '../src/types.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.GUI_PORT || 3011;

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Store configuration in memory (can be improved with .env sync)
let config = {
  instantlyApiKey: process.env.INSTANTLY_API_KEY || '',
  zaiApiKey: process.env.ZAI_API_KEY || '',
  aiBaseUrl: process.env.AI_BASE_URL || 'https://api.z.ai/v1',
  campaignId: process.env.CAMPAIGN_ID || '',
  eaccount: process.env.EACCOUNT || '',
  autoSendEnabled: process.env.AUTO_SEND_ENABLED === 'true',
  autoSendConfidence: parseFloat(process.env.AUTO_SEND_CONFIDENCE || '0.85'),
  logLevel: process.env.LOG_LEVEL || 'info',
};

// WebSocket connections
let wsClients: any[] = [];

wss.on('connection', (ws) => {
  wsClients.push(ws);
  ws.send(JSON.stringify({ type: 'connected', config }));
  broadcastLog('info', 'GUI connected');

  ws.on('close', () => {
    wsClients = wsClients.filter((c) => c !== ws);
  });

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      if (data.type === 'updateConfig') {
        config = { ...config, ...data.config };
        // Broadcast to all clients
        wsClients.forEach((client) => {
          if (client.readyState === 1) {
            client.send(JSON.stringify({ type: 'configUpdated', config }));
          }
        });
      }
    } catch (e) {
      console.error('WebSocket message error:', e);
    }
  });
});

// Broadcast log to all WebSocket clients
function broadcastLog(level: string, message: string, data?: any) {
  const logEntry = {
    type: 'log',
    level,
    message,
    data,
    timestamp: new Date().toISOString(),
  };
  wsClients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(JSON.stringify(logEntry));
    }
  });
}

// Console.log interceptor for capturing logs
const originalConsoleLog = console.log;
console.log = (...args) => {
  originalConsoleLog.apply(console, args);
  const message = args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ');
  broadcastLog('info', message);
};

// API Routes

app.get('/api/config', (req, res) => {
  // Don't send API keys to frontend (mask them)
  const safeConfig = {
    ...config,
    instantlyApiKey: config.instantlyApiKey ? '***' : '',
    zaiApiKey: config.zaiApiKey ? '***' : '',
  };
  res.json(safeConfig);
});

app.post('/api/config', (req, res) => {
  const { instantlyApiKey, zaiApiKey, ...updates } = req.body;

  // Only update API keys if provided
  if (instantlyApiKey) config.instantlyApiKey = instantlyApiKey;
  if (zaiApiKey) config.zaiApiKey = zaiApiKey;

  config = { ...config, ...updates };

  // Broadcast config update
  wsClients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(JSON.stringify({ type: 'configUpdated', config }));
    }
  });

  res.json({ success: true });
});

app.get('/api/emails', async (req, res) => {
  try {
    if (!config.instantlyApiKey) {
      return res.status(400).json({ error: 'Instantly API key not configured' });
    }

    const instantlyClient = new InstantlyClient(config.instantlyApiKey);

    const options: any = {};
    if (config.campaignId) options.campaignId = config.campaignId;
    if (config.eaccount) options.eaccount = config.eaccount;

    const { emails } = await instantlyClient.getAllUnreceivedEmails(options);

    res.json({ success: true, emails });
  } catch (error) {
    res.status(500).json({ success: false, error: String(error) });
  }
});

app.post('/api/analyze', async (req, res) => {
  try {
    const { fromEmail, subject, body, firstName } = req.body;

    if (!config.zaiApiKey) {
      return res.status(400).json({ error: 'AI API key not configured' });
    }

    const aiClient = new AIClient({
      apiKey: config.zaiApiKey,
      baseUrl: config.aiBaseUrl,
    });

    const analyzer = new ReplyAnalyzer(aiClient);

    const analysis = await analyzer.analyze(fromEmail, subject, body, firstName);

    res.json({ success: true, analysis });
  } catch (error) {
    res.status(500).json({ success: false, error: String(error) });
  }
});

app.post('/api/generate', async (req, res) => {
  try {
    const { analysis, originalSubject } = req.body;

    if (!config.zaiApiKey) {
      return res.status(400).json({ error: 'AI API key not configured' });
    }

    const aiClient = new AIClient({
      apiKey: config.zaiApiKey,
      baseUrl: config.aiBaseUrl,
    });

    const generator = new ReplyGenerator(aiClient);

    const reply = await generator.generateReply(analysis, originalSubject);

    res.json({ success: true, reply });
  } catch (error) {
    res.status(500).json({ success: false, error: String(error) });
  }
});

app.post('/api/run', async (req, res) => {
  try {
    const { dryRun = false } = req.body;

    if (!config.instantlyApiKey) {
      return res.status(400).json({ error: 'Instantly API key not configured' });
    }

    if (!config.zaiApiKey) {
      return res.status(400).json({ error: 'AI API key not configured' });
    }

    // Start processing in background
    runAutomation(dryRun).catch((error) => {
      broadcastLog('error', 'Automation error', { error: String(error) });
    });

    res.json({ success: true, message: 'Automation started' });
  } catch (error) {
    res.status(500).json({ success: false, error: String(error) });
  }
});

// Run automation
async function runAutomation(dryRun = false) {
  const instantlyClient = new InstantlyClient(config.instantlyApiKey);
  const aiClient = new AIClient({
    apiKey: config.zaiApiKey,
    baseUrl: config.aiBaseUrl,
  });
  const analyzer = new ReplyAnalyzer(aiClient);
  const generator = new ReplyGenerator(aiClient);

  broadcastLog('info', 'Starting automation...', { dryRun });

  try {
    const options: any = {};
    if (config.campaignId) options.campaignId = config.campaignId;
    if (config.eaccount) options.eaccount = config.eaccount;

    const { emails } = await instantlyClient.getAllUnreceivedEmails(options);

    broadcastLog('info', `Found ${emails.length} unread email(s)`);

    const results: ProcessResult[] = [];

    for (const email of emails) {
      const fromEmail = instantlyClient.getFromEmail(email);
      const bodyText = instantlyClient.getBodyText(email);
      const firstName = instantlyClient.getFirstName(email);
      const subject = email.subject || '';

      broadcastLog('info', `Processing: ${fromEmail}`, { subject });

      try {
        const analysis = await analyzer.analyze(fromEmail || '', subject, bodyText, firstName);
        broadcastLog('info', `Intent: ${analysis.intent}`, { confidence: analysis.confidence });

        const reply = await generator.generateReply(analysis, subject);
        broadcastLog('info', `Reply generated`);

        const result: ProcessResult = {
          emailId: email.id,
          fromEmail,
          analysis,
          reply,
          sent: false,
          processedAt: new Date(),
        };

        if (!dryRun && !['OUT_OF_OFFICE', 'UNSUBSCRIBE', 'NOT_INTERESTED'].includes(analysis.intent)) {
          if (config.autoSendEnabled && reply.confidence >= config.autoSendConfidence) {
            const replyToUuid = email.id || email.message_id || email.thread_id;
            const eaccount = email.eaccount || config.eaccount;

            if (replyToUuid && eaccount) {
              const sendResult = await instantlyClient.sendReply({
                replyToUuid,
                eaccount,
                subject: reply.subject,
                body: reply.body,
                isHtml: reply.isHtml,
              });

              result.sent = sendResult.success;
              result.sentMessageId = sendResult.messageId;
              broadcastLog('info', `Reply ${sendResult.success ? 'sent' : 'failed'}`, { messageId: sendResult.messageId });
            } else {
              broadcastLog('warn', 'Cannot send: missing replyToUuid or eaccount');
            }
          }
        }

        results.push(result);

        broadcastLog('result', 'Email processed', result);
      } catch (error) {
        broadcastLog('error', `Error processing email: ${fromEmail}`, { error: String(error) });
      }

      // Small delay
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    broadcastLog('info', `Complete! Processed ${results.length} email(s)`);
  } catch (error) {
    broadcastLog('error', 'Automation failed', { error: String(error) });
  }
}

// Start server
server.listen(PORT, () => {
  console.log(`\n==========================================`);
  console.log(`Instantly Reply Automation GUI`);
  console.log(`==========================================`);
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`\nPress Ctrl+C to stop\n`);
});
