#!/bin/bash

# Setup script for Instantly Reply Automation

echo "=========================================="
echo "Instantly Reply Automation Setup"
echo "=========================================="
echo ""

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "Creating .env file from .env.example..."
    cp .env.example .env
    echo ""
    echo "⚠️  Please edit .env file with your API keys:"
    echo "   - INSTANTLY_API_KEY"
    echo "   - ZAI_API_KEY"
    echo ""
else
    echo ".env file already exists."
fi

# Install dependencies
echo "Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Setup complete!"
    echo ""
    echo "Next steps:"
    echo "1. Edit .env with your API keys"
    echo "2. Run: npm start -- --dry-run"
    echo ""
else
    echo ""
    echo "❌ Setup failed. Please check the error messages above."
    exit 1
fi
