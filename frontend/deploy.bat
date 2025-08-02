@echo off
echo 🏥 Medical AI Frontend - Vercel Deployment
echo ==========================================

REM Check if we're in the frontend directory
if not exist "package.json" (
    echo ❌ Error: Please run this script from the frontend directory
    pause
    exit /b 1
)

REM Check if Vercel CLI is installed
vercel --version >nul 2>&1
if errorlevel 1 (
    echo 📦 Installing Vercel CLI...
    npm install -g vercel
)

REM Clean previous builds
echo 🧹 Cleaning previous builds...
if exist "dist" rmdir /s /q "dist"
if exist "node_modules\.vite" rmdir /s /q "node_modules\.vite"

REM Install dependencies
echo 📦 Installing dependencies...
npm install

REM Build the project
echo 🏗️ Building project...
npm run build

REM Check if build was successful
if not exist "dist" (
    echo ❌ Build failed! Please check for errors.
    pause
    exit /b 1
)

echo ✅ Build successful!

REM Deploy to Vercel
echo 🚀 Deploying to Vercel...
vercel --prod

echo.
echo 🎉 Deployment complete!
echo 📱 Your medical AI app is now live on Vercel!
echo.
echo 🔍 Next steps:
echo 1. Check your deployment URL
echo 2. Verify all features work correctly
echo 3. Test authentication and API connectivity
echo 4. Configure custom domain (optional)
echo.
echo 🏥 Professional Medical AI - Ready for Production! ✨
pause