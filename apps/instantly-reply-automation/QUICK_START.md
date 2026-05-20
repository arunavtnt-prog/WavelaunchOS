# Quick Start Guide - Instantly Reply Automation

## 1. Setup (One-time)

```bash
cd instantly-reply-automation

# Edit .env with your API keys
# - INSTANTLY_API_KEY=your_instantly_api_key
# - ZAI_API_KEY=your_zai_api_key

# Install dependencies
npm install
```

## 2. Run GUI (Recommended)

```bash
npm run gui
```

Then open http://localhost:3011 in your browser.

The GUI provides:
- Visual dashboard for emails and results
- Configuration panel for API keys
- Test email functionality
- Real-time logs

## 3. Command Line (Optional)

### Test First (Dry Run)

```bash
# Analyze replies without sending
npm start -- --dry-run

# Or with more details
npm run analyze-only
```

### Enable Auto-Send (Optional)

Edit `.env`:
```env
AUTO_SEND_ENABLED=true
AUTO_SEND_CONFIDENCE=0.85
```

Then run:
```bash
npm start
```

### Test Single Email

```bash
# Edit src/single-reply.ts with your test email
npm run single
```

## Key Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `INSTANTLY_API_KEY` | Your Instantly API key | Required |
| `ZAI_API_KEY` | Your z.ai API key | Required |
| `AI_BASE_URL` | AI API base URL | `https://api.z.ai/v1` |
| `CAMPAIGN_ID` | Filter by campaign ID | (all campaigns) |
| `EACCOUNT` | Filter by email account | (all accounts) |
| `AUTO_SEND_ENABLED` | Enable auto-send | `false` |
| `AUTO_SEND_CONFIDENCE` | Min confidence to send | `0.85` |
| `LOG_LEVEL` | Logging verbosity | `info` |

## Commands

| Command | Description |
|---------|-------------|
| `npm start` | Run with current settings |
| `npm start -- --dry-run` | Analyze without sending |
| `npm start -- --verbose` | Show detailed logs |
| `npm run analyze-only` | Show analysis details |
| `npm run single` | Test single email |

## Flow

```
Fetch unread emails
    ↓
Analyze intent (INTERESTED, QUESTIONS, OBJECTION, etc.)
    ↓
Generate personalized reply
    ↓
Send if confidence >= threshold AND auto-send enabled
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "No unread emails" | Check Instantly for actual replies |
| "API error" | Verify API keys in `.env` |
| "Failed to parse JSON" | Try running with `--verbose` |
| "Missing replyToUuid" | Check email format in Instantly |
