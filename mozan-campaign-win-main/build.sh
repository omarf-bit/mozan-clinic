#!/bin/bash

# Mozan Campaign Build & Deploy Script
# This script builds your project and prepares it for deployment

set -e  # Exit on error

echo "🚀 Starting Mozan Campaign Build Process..."
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo "✅ Dependencies installed"
    echo ""
fi

# Run linting (optional)
echo "🔍 Linting code..."
npm run lint || echo "⚠️  Linting warnings found (continuing...)"
echo ""

# Build the project
echo "🏗️  Building project..."
npm run build

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Build completed successfully!"
    echo ""
    echo "📂 Build output is in the 'dist' folder"
    echo ""
    echo "Next steps:"
    echo "1. Test the build locally: npm run preview"
    echo "2. Deploy the 'dist' folder to your server"
    echo ""
    echo "📖 See DEPLOYMENT.md for detailed deployment instructions"
else
    echo ""
    echo "❌ Build failed. Please check the errors above."
    exit 1
fi
