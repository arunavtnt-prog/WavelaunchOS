# GUI for Instantly Reply Automation

A web-based interface to run and test the Instantly Reply Automation tool.

## Features

- **Dashboard**: View unread emails, run automation, see results
- **Configuration**: Set up API keys and auto-send settings
- **Test Email**: Analyze and generate replies for test emails
- **Live Logs**: Real-time logging of automation progress

## Starting the GUI

```bash
# From the instantly-reply-automation directory
npm run gui
```

The GUI will be available at http://localhost:3011

## GUI Screens

### Dashboard
- **Refresh Emails**: Fetch unread emails from Instantly
- **Run (Dry Run)**: Analyze and generate replies without sending
- **Run (Auto-Send)**: Full automation including sending replies
- **Unread Emails**: List of emails to process
- **Recent Results**: Summary of processed emails

### Configuration
- **API Keys**: Instantly and z.ai API keys
- **AI Settings**: Base URL for AI API
- **Filters**: Campaign ID and email account filters
- **Auto-Send**: Enable/disable and confidence threshold

### Test Email
- Enter a test email to analyze
- See the intent classification
- View the generated reply

### Logs
- Real-time logs from the automation
- Filter by log level (info, warn, error)
- Clear logs button

## API Keys

API keys are stored in memory only when the GUI is running. They are NOT persisted. To save keys permanently, edit `.env` file.

## WebSocket

The GUI uses WebSocket for real-time updates. If you disconnect, it will automatically reconnect.
