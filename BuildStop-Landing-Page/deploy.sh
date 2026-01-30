#!/bin/bash

# BuildStop Landing Page Deployment Script
# This script deploys the landing page to Vercel

set -e

echo "🚀 BuildStop Landing Page Deployment"
echo "====================================="
echo ""

# Change to landing page directory
cd "$(dirname "$0")"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Are you in the BuildStop-Landing-Page directory?"
    exit 1
fi

echo "📦 Step 1: Installing dependencies..."
npm install

echo ""
echo "🔨 Step 2: Building landing page..."
npm run build

echo ""
echo "✅ Build complete! Files in dist/:"
ls -lh dist/

echo ""
echo "🚀 Step 3: Deploying to Vercel..."
vercel --prod

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🌐 Live URL: https://buildstock-landing.vercel.app"
echo ""
echo "To verify deployment:"
echo "  curl -I https://buildstock-landing.vercel.app"
echo "  curl -s https://buildstock-landing.vercel.app | grep cart-icon-btn"
