/**
 * Simple AI Proxy Server for GLM (Zhipu AI via z.ai)
 * For z.ai coding API ($3/month subscription)
 */

const express = require('express');

const app = express();
app.use(express.json());

// Allow local browser apps (e.g., workflow-dashboard) to call this proxy directly
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  next();
});

// Configuration
const PORT = 3003;
// z.ai coding endpoint
const GLM_API_URL = 'https://api.z.ai/api/coding/paas/v4/chat/completions';

// Get API key from environment variable
const API_KEY = process.env.GLM_API_KEY || process.env.ZHIPU_API_KEY;

if (!API_KEY) {
  console.error('❌ ERROR: GLM_API_KEY or ZHIPU_API_KEY environment variable is required');
  console.error('Get your key from: https://z.ai/');
  process.exit(1);
}

app.post('/generate', async (req, res) => {
  try {
    const { messages, max_tokens = 8192, temperature = 0.7, model = 'glm-4.7' } = req.body;

    console.log(`🔄 Generating with ${model}...`);

    // Call z.ai GLM API with direct API key (no JWT for z.ai)
    const response = await fetch(GLM_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens,
        temperature,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ GLM API Error:', response.status, errorText);
      return res.status(response.status).json({
        error: `GLM API error: ${response.status}`,
        details: errorText,
      });
    }

    const data = await response.json();

    // Extract the response content
    const content = data.choices[0]?.message?.content || '';

    console.log(`✅ Generated ${content.length} characters`);

    // Return in Anthropic-compatible format for easy integration
    res.json({
      content: [
        {
          type: 'text',
          text: content,
        },
      ],
      model: data.model,
      usage: {
        input_tokens: data.usage?.prompt_tokens || 0,
        output_tokens: data.usage?.completion_tokens || 0,
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
  res.json({ status: 'ok', model: 'GLM via z.ai' });
});

app.listen(PORT, () => {
  console.log('');
  console.log('🚀 AI Proxy Server Running!');
  console.log(`📍 Local: http://localhost:${PORT}`);
  console.log(`🤖 Model: GLM-4.7 via z.ai`);
  console.log(`🔑 API Key: ${API_KEY.substring(0, 20)}...`);
  console.log('');
  console.log('Usage:');
  console.log(`  POST http://localhost:${PORT}/generate`);
  console.log('  Body: { "messages": [{"role": "user", "content": "Hello"}] }');
  console.log('');
});
