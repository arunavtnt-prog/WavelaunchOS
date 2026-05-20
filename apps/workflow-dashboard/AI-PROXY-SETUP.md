# AI Proxy Server Setup

## What This Does

This is a simple local server that connects your Blueprint Generator to GLM (Zhipu AI) - the same AI that powers this conversation!

## Quick Setup (3 Steps)

### Step 1: Get Your API Key

1. Go to https://open.bigmodel.cn/
2. Sign up / Login
3. Get your API key (looks like: `xxx.xxx.xxx`)

### Step 2: Install Dependencies

```bash
cd workflow-dashboard
npm install express node-fetch dotenv
```

### Step 3: Run the Server

```bash
# Option A: Run with API key inline
GLM_API_KEY=your-key-here node ai-proxy-server.js

# Option B: Create .env file
echo "GLM_API_KEY=your-key-here" > .env
node ai-proxy-server.js
```

You should see:
```
🚀 AI Proxy Server Running!
📍 Local: http://localhost:3003
🤖 Model: GLM (Zhipu AI)
```

## Then Use Your Blueprint Generator

1. Keep the proxy server running (leave terminal open)
2. Go to your Blueprint page: http://localhost:3002/blueprints
3. Click "Process Batch" - it will use GLM through your local server!

## Architecture

```
Blueprint Generator → Local Proxy (localhost:3003) → GLM API → Response
```

The proxy server handles:
- ✅ API key management (only in one place)
- ✅ Request formatting
- ✅ Error handling
- ✅ Simple logging

## Troubleshooting

**Error: "GLM_API_KEY or ZHIPU_API_KEY environment variable is required"**
→ You forgot to set the API key. Use: `GLM_API_KEY=your-key node ai-proxy-server.js`

**Error: "EADDRINUSE: address already in use"**
→ Port 3003 is already in use. Either close the other program or change PORT in ai-proxy-server.js

**Blueprint generation fails**
→ Check the proxy server terminal for errors. Make sure your GLM API key is valid.
