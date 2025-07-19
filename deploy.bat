@echo off
echo 🚀 Medical AI Platform - Deployment Preparation
echo ==============================================

REM Check if we're in the right directory
if not exist "frontend" if not exist "package.json" (
    echo ❌ Please run this script from the project root directory
    pause
    exit /b 1
)

echo 📦 Installing dependencies...

REM Install frontend dependencies
if exist "frontend" (
    echo 📱 Installing frontend dependencies...
    cd frontend
    call npm install
    if %errorlevel% neq 0 (
        echo ❌ Failed to install frontend dependencies
        pause
        exit /b 1
    )
    echo ✅ Frontend dependencies installed
    cd ..
) else (
    echo 📱 Installing dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo ❌ Failed to install dependencies
        pause
        exit /b 1
    )
    echo ✅ Dependencies installed
)

REM Install backend dependencies
if exist "backend" (
    echo 🖥️  Installing backend dependencies...
    cd backend
    pip install -r requirements.txt
    if %errorlevel% neq 0 (
        echo ⚠️  Failed to install backend dependencies
        echo Please install Python dependencies manually:
        echo    cd backend ^&^& pip install -r requirements.txt
    ) else (
        echo ✅ Backend dependencies installed
    )
    cd ..
)

echo.
echo 🔧 Building frontend for production...

REM Build frontend
if exist "frontend" (
    cd frontend
    call npm run build
    if %errorlevel% neq 0 (
        echo ❌ Failed to build frontend
        pause
        exit /b 1
    )
    echo ✅ Frontend built successfully
    cd ..
) else (
    call npm run build
    if %errorlevel% neq 0 (
        echo ❌ Failed to build frontend
        pause
        exit /b 1
    )
    echo ✅ Frontend built successfully
)

echo.
echo ✅ Deployment preparation complete!
echo.
echo 🌐 Next steps:
echo 1. Push your code to GitHub:
echo    git add .
echo    git commit -m "Ready for deployment"
echo    git push origin main
echo.
echo 2. Deploy frontend on Vercel:
echo    - Go to vercel.com
echo    - Import your GitHub repository
echo    - Set root directory to 'frontend'
echo    - Add environment variable: REACT_APP_API_URL
echo.
echo 3. Deploy backend on Railway:
echo    - Go to railway.app
echo    - Import your GitHub repository
echo    - Set root directory to 'backend'
echo    - Add your environment variables
echo.
echo 📖 For detailed instructions, see STEP_BY_STEP_DEPLOYMENT.md
echo.
echo 🎉 Your FAANG-level Medical AI Platform is ready for deployment!
echo.
pause