#!/bin/bash

# Automated backup cron script
# Add this to your crontab to run daily at 2 AM:
# 0 2 * * * /path/to/wavelaunch-crm/scripts/backup-cron.sh

# Load environment variables if needed
cd "$(dirname "$0")/.." || exit 1

# Set the API endpoint
API_URL="${BACKUP_API_URL:-http://localhost:3000/api/backups/automated}"

# Get API key from environment or .env file
if [ -f .env.local ]; then
  export $(grep -v '^#' .env.local | xargs)
fi

# Run the backup
echo "$(date): Starting automated backup..."

if [ -n "$BACKUP_API_KEY" ]; then
  # With API key authentication
  response=$(curl -s -X POST "$API_URL" \
    -H "Authorization: Bearer $BACKUP_API_KEY" \
    -H "Content-Type: application/json")
else
  # Without API key (local development)
  response=$(curl -s -X POST "$API_URL" \
    -H "Content-Type: application/json")
fi

# Check if backup was successful
if echo "$response" | grep -q '"success":true'; then
  echo "$(date): Automated backup completed successfully"
  echo "$response"
else
  echo "$(date): Automated backup failed"
  echo "$response"
  exit 1
fi
