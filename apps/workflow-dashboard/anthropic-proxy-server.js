/**
 * Simple Anthropic Proxy Server
 * Proxies requests to Anthropic Claude API
 */

const express = require('express');

const app = express();
app.use(express.json());

// Configuration
const PORT = 3003;
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

// Get API key from environment variable
const API_KEY = process.env.ANTHROPIC_API_KEY;

if (!API_KEY) {
  console.error('❌ ERROR: ANTHROPIC_API_KEY environment variable is required');
  console.error('Get your key from: https://console.anthropic.com/');
  process.exit(1);
}

app.post('/generate', async (req, res) => {
  try {
    const { messages, max_tokens = 8192, temperature = 0.7, model = 'claude-sonnet-4-20250514' } = req.body;

    console.log(`🔄 Generating with ${model}...`);

    // Call Anthropic API
    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens,
        temperature,
        messages,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Anthropic API Error:', response.status, errorText);
      return res.status(response.status).json({
        error: `Anthropic API error: ${response.status}`,
        details: errorText,
      });
    }

    const data = await response.json();

    // Extract the response content
    const content = data.content[0]?.text || '';

    console.log(`✅ Generated ${content.length} characters`);

    // Return in expected format
    res.json({
      content: data.content,
      model: data.model,
      usage: {
        input_tokens: data.usage?.input_tokens || 0,
        output_tokens: data.usage?.output_tokens || 0,
      },
    });

  } catch (error) {
    console.error('❌ Server Error:', error.message);
    res.status(500).json({
      error: 'Internal server error',
      details: error.message,
    });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', model: 'Claude via Anthropic' });
});

app.listen(PORT, () => {
  console.log('');
  console.log('🚀 Anthropic Proxy Server Running!');
  console.log(`📍 Local: http://localhost:${PORT}`);
  console.log(`🤖 Model: Claude Sonnet 4`);
  console.log(`🔑 API Key: ${API_KEY.substring(0, 20)}...`);
  console.log('');
  console.log('Usage:');
  console.log(`  POST http://localhost:${PORT}/generate`);
  console.log('  Body: { "messages": [{"role": "user", "content": "Hello"}] }');
  console.log('');
});
