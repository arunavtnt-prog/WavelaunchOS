# Instantly Reply Automation

A standalone tool for automatically replying to Instantly cold email campaign leads. This tool analyzes incoming replies, classifies the lead's intent, and generates personalized responses to guide leads toward filling out the Wavelaunch Vision Form.

## Features

- **Web GUI**: Browser-based interface for easy configuration and testing
- **Automatic Reply Classification**: Classifies responses as INTERESTED, QUESTIONS, OBJECTION, NOT_INTERESTED, UNSUBSCRIBE, OUT_OF_OFFICE, or OTHER
- **Objection Handling**: Detects specific objection types (PRICING, TIMELINE, CONTROL, TRUST, RELEVANCE, ALREADY_DOING_IT, TOO_BUSY, NOT_READY)
- **Personalized Replies**: Uses AI to generate contextually relevant responses
- **Template System**: Pre-built templates for common scenarios
- **Auto-Send**: Optional auto-send based on confidence thresholds
- **Dry Run Mode**: Test without sending actual emails
- **Real-time Logs**: Live logging in GUI for monitoring progress

## Setup

### 1. Install Dependencies

```bash
cd instantly-reply-automation
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Edit `.env`:

```env
# Instantly API Configuration
INSTANTLY_API_KEY=your_instantly_api_key_here

# AI Configuration (z.ai / GLM-4.7)
AI_PROVIDER=zai
ZAI_API_KEY=your_zai_api_key_here
AI_BASE_URL=https://api.z.ai/v1

# Optional: Campaign filter (only process replies from this campaign)
# CAMPAIGN_ID=

# Optional: Email account filter (only process replies to this mailbox)
# EACCOUNT=

# Optional: Confidence threshold for auto-send (0-1)
AUTO_SEND_CONFIDENCE=0.85

# Optional: Enable auto-send (true/false)
AUTO_SEND_ENABLED=false

# Logging
LOG_LEVEL=info
```

## Usage

### Using the GUI (Recommended)

The easiest way to use this tool is through the web GUI:

```bash
npm run gui
```

Then open http://localhost:3011 in your browser.

The GUI provides:
- **Dashboard**: View emails, run automation, see results
- **Configuration**: Set API keys and auto-send settings
- **Test Email**: Analyze and generate test replies
- **Live Logs**: Real-time monitoring

See `gui/README.md` for full GUI documentation.

### Command Line Options

#### Run in Dry Run Mode (Recommended First)

This will analyze emails without sending any replies:

```bash
npm start -- --dry-run
```

### Run in Analyze-Only Mode

Similar to dry run but shows more details:

```bash
npm run analyze-only
```

### Run with Auto-Send

Enable auto-send in `.env` (`AUTO_SEND_ENABLED=true`) and run:

```bash
npm start
```

### Run with Verbose Logging

See detailed information for debugging:

```bash
npm start -- --verbose
```

### Test Single Email

Test reply generation with a sample email:

```bash
npm run single
```

You can modify the test email in `src/single-reply.ts`.

## Reply Intents

The tool classifies replies into these categories:

| Intent | Description | Auto-Reply? |
|--------|-------------|-------------|
| **INTERESTED** | Creator expresses interest | Yes |
| **QUESTIONS** | Creator asks general questions | Yes |
| **OBJECTION** | Creator raises concerns | Yes (type-specific) |
| **NOT_INTERESTED** | Creator declines | No |
| **UNSUBSCRIBE** | Creator asks to unsubscribe | No |
| **OUT_OF_OFFICE** | Auto-reply / OOO message | No |
| **OTHER** | Doesn't fit other categories | Yes |

## Objection Types

When intent is OBJECTION, the tool further classifies:

- **PRICING**: Concerns about $5K fee, revenue share, or equity
- **TIMELINE**: Concerns about time commitment or duration
- **CONTROL**: Concerns about losing control or creative freedom
- **TRUST**: Concerns about legitimacy, track record, or who we are
- **RELEVANCE**: Doesn't see fit for their situation
- **ALREADY_DOING_IT**: Already has a brand or doing something similar
- **TOO_BUSY**: Doesn't have time or bandwidth
- **NOT_READY**: Timing isn't right or not ready yet

## Auto-Send Configuration

By default, replies are generated but not sent automatically. To enable auto-send:

1. Set `AUTO_SEND_ENABLED=true` in `.env`
2. Set `AUTO_SEND_CONFIDENCE` to your desired threshold (0-1)

Replies will only be auto-sent if:
- Intent is INTERESTED, QUESTIONS, or OBJECTION
- Confidence score meets or exceeds your threshold

## Customization

### Modify Templates

Edit `src/templates.ts` to customize email templates for each intent/objection type.

### Modify Classification Logic

Edit `src/analyzer.ts` to adjust how replies are classified.

### Modify Reply Generation

Edit `src/generator.ts` to adjust how replies are generated.

## Project Structure

```
instantly-reply-automation/
├── src/
│   ├── ai-client.ts       # AI client (z.ai/GLM-4.7)
│   ├── analyzer.ts        # Reply analysis and classification
│   ├── generator.ts       # Reply generation
│   ├── instantly-client.ts # Instantly API wrapper
│   ├── index.ts           # Main entry point
│   ├── logger.ts          # Logging utility
│   ├── single-reply.ts    # Single email test
│   ├── templates.ts       # Email templates
│   └── types.ts           # TypeScript types
├── gui/
│   ├── server.ts          # Web GUI server
│   └── public/
│       ├── index.html     # GUI HTML
│       ├── styles.css     # GUI styles
│       └── app.js        # GUI JavaScript
├── .env.example           # Environment variables template
├── package.json           # Dependencies and scripts
└── README.md              # This file
```

## Getting Instantly API Key

1. Log in to Instantly
2. Go to Settings → API Keys
3. Generate a new API key
4. Copy to your `.env` file

## Getting z.ai API Key

1. Sign up at z.ai
2. Navigate to API settings
3. Generate an API key
4. Copy to your `.env` file

## Troubleshooting

### No unread emails found

- Check your Instantly campaign settings
- Ensure there are actually unread replies
- Verify `CAMPAIGN_ID` filter if set

### AI errors

- Verify `ZAI_API_KEY` is correct
- Check `AI_BASE_URL` is accessible
- Review log output for specific errors

### Replies not sending

- Check `AUTO_SEND_ENABLED` is `true`
- Verify `AUTO_SEND_CONFIDENCE` threshold
- Ensure `EACCOUNT` is set if needed
- Check Instantly API rate limits

## License

Proprietary - Wavelaunch Studio
