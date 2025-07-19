# 🚀 Free Deployment Guide - Medical AI Platform

## 🎯 **Best Free Deployment Options**

### 🏆 **Recommended Stack (100% Free)**
- **Frontend**: Vercel or Netlify
- **Backend**: Railway, Render, or Heroku (free tier)
- **Database**: MongoDB Atlas (free tier)
- **Domain**: Freenom or use platform subdomain

---

## 🌐 **Frontend Deployment Options**

### 1. **Vercel (Recommended) ⭐**
**Why Vercel?**
- ✅ Unlimited bandwidth
- ✅ Global CDN
- ✅ Automatic HTTPS
- ✅ Git integration
- ✅ Perfect for React apps

**Steps:**
1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Sign up with GitHub
4. Click "New Project"
5. Select your repository
6. Configure build settings:
   ```
   Framework Preset: Vite
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```
7. Add environment variables:
   ```
   REACT_APP_API_URL=https://your-backend-url.com
   ```
8. Deploy!

### 2. **Netlify**
**Steps:**
1. Build your project locally:
   ```bash
   cd frontend
   npm run build
   ```
2. Go to [netlify.com](https://netlify.com)
3. Drag and drop your `dist` folder
4. Or connect to GitHub for auto-deployment

### 3. **GitHub Pages**
**Steps:**
1. Install gh-pages:
   ```bash
   npm install --save-dev gh-pages
   ```
2. Add to package.json:
   ```json
   {
     "homepage": "https://yourusername.github.io/your-repo-name",
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d dist"
     }
   }
   ```
3. Deploy:
   ```bash
   npm run deploy
   ```

---

## 🖥️ **Backend Deployment Options**

### 1. **Railway (Recommended) ⭐**
**Why Railway?**
- ✅ $5/month free credit
- ✅ Easy Python deployment
- ✅ Automatic HTTPS
- ✅ Environment variables
- ✅ Git integration

**Steps:**
1. Create `railway.json` in backend folder:
   ```json
   {
     "build": {
       "builder": "NIXPACKS"
     },
     "deploy": {
       "startCommand": "python main.py",
       "healthcheckPath": "/health"
     }
   }
   ```

2. Create `Procfile`:
   ```
   web: python main.py
   ```

3. Update `main.py` for Railway:
   ```python
   if __name__ == "__main__":
       import uvicorn
       port = int(os.environ.get("PORT", 8080))
       uvicorn.run(
           app, 
           host="0.0.0.0", 
           port=port,
           log_level="info"
       )
   ```

4. Deploy:
   - Go to [railway.app](https://railway.app)
   - Connect GitHub
   - Select your repository
   - Add environment variables
   - Deploy!

### 2. **Render**
**Steps:**
1. Create `render.yaml`:
   ```yaml
   services:
     - type: web
       name: medical-ai-backend
       env: python
       buildCommand: pip install -r requirements.txt
       startCommand: python main.py
       envVars:
         - key: GROQ_API_KEY
           sync: false
         - key: ELEVENLABS_API_KEY
           sync: false
         - key: JWT_SECRET
           sync: false
         - key: MONGO_CONN
           sync: false
   ```

2. Go to [render.com](https://render.com)
3. Connect GitHub and deploy

### 3. **Heroku (Limited Free)**
**Steps:**
1. Install Heroku CLI
2. Create `Procfile`:
   ```
   web: python main.py
   ```
3. Create `runtime.txt`:
   ```
   python-3.11.0
   ```
4. Deploy:
   ```bash
   heroku create your-app-name
   git push heroku main
   ```

---

## 🗄️ **Database Setup (MongoDB Atlas)**

### **Free MongoDB Atlas Setup**
1. Go to [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create free account
3. Create new cluster (M0 Sandbox - FREE)
4. Create database user
5. Whitelist IP addresses (0.0.0.0/0 for development)
6. Get connection string
7. Update your backend environment variables

**Connection String Format:**
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

---

## 🔧 **Environment Variables Setup**

### **Frontend (.env)**
```env
REACT_APP_API_URL=https://your-backend-url.railway.app
```

### **Backend Environment Variables**
```env
GROQ_API_KEY=your_groq_api_key_here
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
JWT_SECRET=your_super_secret_jwt_key_here
MONGO_CONN=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

---

## 🚀 **Quick Deployment Commands**

### **Option 1: Vercel + Railway (Recommended)**
```bash
# Frontend (Vercel)
cd frontend
npm install
npm run build
# Push to GitHub, then deploy via Vercel dashboard

# Backend (Railway)
cd backend
# Push to GitHub, then deploy via Railway dashboard
```

### **Option 2: Netlify + Render**
```bash
# Frontend (Netlify)
cd frontend
npm run build
# Drag dist folder to Netlify

# Backend (Render)
# Push to GitHub, then deploy via Render dashboard
```

---

## 🌍 **Free Domain Options**

### 1. **Use Platform Subdomains (Easiest)**
- Vercel: `your-app.vercel.app`
- Netlify: `your-app.netlify.app`
- Railway: `your-app.railway.app`

### 2. **Free Domains**
- **Freenom**: .tk, .ml, .ga domains
- **GitHub Pages**: username.github.io
- **Netlify**: Custom subdomain

### 3. **Custom Domain (If you have one)**
- Add CNAME record pointing to your platform
- Configure in platform dashboard

---

## 📋 **Deployment Checklist**

### **Pre-Deployment**
- [ ] Code pushed to GitHub
- [ ] Environment variables ready
- [ ] MongoDB Atlas cluster created
- [ ] API keys obtained (Groq, ElevenLabs)
- [ ] Frontend built successfully
- [ ] Backend tested locally

### **Frontend Deployment**
- [ ] Vercel/Netlify account created
- [ ] Repository connected
- [ ] Build settings configured
- [ ] Environment variables added
- [ ] Custom domain configured (optional)

### **Backend Deployment**
- [ ] Railway/Render account created
- [ ] Repository connected
- [ ] Environment variables added
- [ ] Health check endpoint working
- [ ] CORS configured for frontend domain

### **Testing**
- [ ] Frontend loads correctly
- [ ] API endpoints responding
- [ ] Authentication working
- [ ] File uploads working
- [ ] Database connections working

---

## 🎯 **Recommended Free Stack**

### **🏆 Best Performance & Reliability**
```
Frontend: Vercel
Backend: Railway
Database: MongoDB Atlas
Domain: Platform subdomain
```

### **💰 Most Cost-Effective**
```
Frontend: Netlify
Backend: Render
Database: MongoDB Atlas
Domain: Platform subdomain
```

### **🔧 Easiest Setup**
```
Frontend: GitHub Pages
Backend: Heroku
Database: MongoDB Atlas
Domain: GitHub Pages subdomain
```

---

## 🚨 **Important Notes**

### **Free Tier Limitations**
- **Railway**: $5/month credit (usually enough)
- **Render**: 750 hours/month free
- **Heroku**: Limited free tier
- **Vercel**: Unlimited for personal projects
- **Netlify**: 100GB bandwidth/month

### **Production Considerations**
- Use environment variables for all secrets
- Enable HTTPS (automatic on most platforms)
- Configure CORS properly
- Set up error monitoring
- Regular backups of MongoDB

---

## 🎉 **You're Ready to Deploy!**

Your FAANG-level Medical AI Platform can be deployed completely **FREE** using these platforms. The recommended stack (Vercel + Railway + MongoDB Atlas) will give you:

- ✅ **Professional URLs**
- ✅ **Automatic HTTPS**
- ✅ **Global CDN**
- ✅ **99.9% Uptime**
- ✅ **Easy scaling**

**Choose your preferred option and start deploying! 🚀**