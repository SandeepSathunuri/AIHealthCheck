#!/bin/bash

# 🚀 Medical AI Frontend - Vercel Deployment Script

echo "🏥 Medical AI Frontend - Vercel Deployment"
echo "=========================================="

# Check if we're in the frontend directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the frontend directory"
    exit 1
fi

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist
rm -rf node_modules/.vite

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the project
echo "🏗️ Building project..."
npm run build

# Check if build was successful
if [ ! -d "dist" ]; then
    echo "❌ Build failed! Please check for errors."
    exit 1
fi

echo "✅ Build successful!"

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

echo ""
echo "🎉 Deployment complete!"
echo "📱 Your medical AI app is now live on Vercel!"
echo ""
echo "🔍 Next steps:"
echo "1. Check your deployment URL"
echo "2. Verify all features work correctly"
echo "3. Test authentication and API connectivity"
echo "4. Configure custom domain (optional)"
echo ""
echo "🏥 Professional Medical AI - Ready for Production! ✨"