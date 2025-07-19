#!/bin/bash

# 🚀 Medical AI Platform - Quick Deployment Script
# This script helps prepare your project for deployment

echo "🚀 Medical AI Platform - Deployment Preparation"
echo "=============================================="

# Check if we're in the right directory
if [ ! -f "package.json" ] && [ ! -d "frontend" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

echo "📦 Installing dependencies..."

# Install frontend dependencies
if [ -d "frontend" ]; then
    echo "📱 Installing frontend dependencies..."
    cd frontend
    npm install
    echo "✅ Frontend dependencies installed"
    cd ..
else
    echo "📱 Installing dependencies..."
    npm install
    echo "✅ Dependencies installed"
fi

# Install backend dependencies
if [ -d "backend" ]; then
    echo "🖥️  Installing backend dependencies..."
    cd backend
    if command -v pip &> /dev/null; then
        pip install -r requirements.txt
        echo "✅ Backend dependencies installed"
    else
        echo "⚠️  pip not found. Please install Python dependencies manually:"
        echo "   cd backend && pip install -r requirements.txt"
    fi
    cd ..
fi

echo ""
echo "🔧 Building frontend for production..."

# Build frontend
if [ -d "frontend" ]; then
    cd frontend
    npm run build
    echo "✅ Frontend built successfully"
    cd ..
else
    npm run build
    echo "✅ Frontend built successfully"
fi

echo ""
echo "✅ Deployment preparation complete!"
echo ""
echo "🌐 Next steps:"
echo "1. Push your code to GitHub:"
echo "   git add ."
echo "   git commit -m 'Ready for deployment'"
echo "   git push origin main"
echo ""
echo "2. Deploy frontend on Vercel:"
echo "   - Go to vercel.com"
echo "   - Import your GitHub repository"
echo "   - Set root directory to 'frontend'"
echo "   - Add environment variable: REACT_APP_API_URL"
echo ""
echo "3. Deploy backend on Railway:"
echo "   - Go to railway.app"
echo "   - Import your GitHub repository"
echo "   - Set root directory to 'backend'"
echo "   - Add your environment variables"
echo ""
echo "📖 For detailed instructions, see STEP_BY_STEP_DEPLOYMENT.md"
echo ""
echo "🎉 Your FAANG-level Medical AI Platform is ready for deployment!"