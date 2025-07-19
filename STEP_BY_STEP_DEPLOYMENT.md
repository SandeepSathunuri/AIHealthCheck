# 🚀 Step-by-Step Free Deployment Guide

## 🎯 **Quick Start - Deploy in 15 Minutes**

### **Option 1: Vercel + Railway (Recommended)**

---

## 📋 **Prerequisites**

1. **GitHub Account** - [github.com](https://github.com)
2. **MongoDB Atlas Account** - [mongodb.com/atlas](https://mongodb.com/atlas)
3. **API Keys**:
   - Groq API Key - [console.groq.com](https://console.groq.com)
   - ElevenLabs API Key - [elevenlabs.io](https://elevenlabs.io)

---

## 🗄️ **Step 1: Setup MongoDB Atlas (5 minutes)**

1. **Create MongoDB Atlas Account**
   - Go to [mongodb.com/atlas](https://mongodb.com/atlas)
   - Sign up for free account

2. **Create Free Cluster**
   - Click "Create" → "Shared" → "M0 Sandbox (FREE)"
   - Choose AWS, region closest to you
   - Cluster name: `medical-ai-cluster`
   - Click "Create Cluster"

3. **Create Database User**
   - Go to "Database Access"
   - Click "Add New Database User"
   - Username: `medicalai-user`
   - Password: Generate secure password (save it!)
   - Database User Privileges: "Read and write to any database"

4. **Configure Network Access**
   - Go to "Network Access"
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - Confirm

5. **Get Connection String**
   - Go to "Clusters" → Click "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your actual password
   - Save this connection string!

---

## 🔑 **Step 2: Get API Keys (5 minutes)**

### **Groq API Key**
1. Go to [console.groq.com](https://console.groq.com)
2. Sign up/Login
3. Go to API Keys section
4. Create new API key
5. Copy and save the key

### **ElevenLabs API Key**
1. Go to [elevenlabs.io](https://elevenlabs.io)
2. Sign up/Login
3. Go to Profile → API Keys
4. Copy your API key

---

## 📤 **Step 3: Push Code to GitHub (2 minutes)**

```bash
# Initialize git (if not already done)
git init
git add .
git commit -m "Initial commit - Medical AI Platform"

# Create GitHub repository
# Go to github.com → New Repository → "medical-ai-platform"

# Push to GitHub
git remote add origin https://github.com/YOUR_USERNAME/medical-ai-platform.git
git branch -M main
git push -u origin main
```

---

## 🖥️ **Step 4: Deploy Backend on Railway (3 minutes)**

1. **Go to Railway**
   - Visit [railway.app](https://railway.app)
   - Click "Login with GitHub"

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your `medical-ai-platform` repository

3. **Configure Service**
   - Railway will auto-detect Python
   - Click on the service → Settings
   - Change "Root Directory" to `backend`

4. **Add Environment Variables**
   - Go to Variables tab
   - Add these variables:
   ```
   GROQ_API_KEY=your_groq_api_key_here
   ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
   JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
   MONGO_CONN=your_mongodb_connection_string_here
   ENVIRONMENT=production
   LOG_LEVEL=INFO
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait for deployment (2-3 minutes)
   - Copy your Railway URL (e.g., `https://your-app.railway.app`)

---

## 🌐 **Step 5: Deploy Frontend on Vercel (2 minutes)**

1. **Go to Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Click "Login with GitHub"

2. **Import Project**
   - Click "New Project"
   - Select your `medical-ai-platform` repository
   - Click "Import"

3. **Configure Build Settings**
   - Framework Preset: `Vite`
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

4. **Add Environment Variables**
   - Click "Environment Variables"
   - Add:
   ```
   Name: REACT_APP_API_URL
   Value: https://your-railway-app.railway.app
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait for deployment (2-3 minutes)
   - Your app will be live at `https://your-app.vercel.app`

---

## 🔧 **Step 6: Update CORS Settings**

1. **Update Backend CORS**
   - Go to your Railway dashboard
   - Click on your service → Variables
   - The CORS is already configured to accept your Vercel domain
   - If needed, you can update the `allow_origins` in `main.py`

---

## ✅ **Step 7: Test Your Deployment**

1. **Visit Your Frontend URL**
   - Go to your Vercel URL
   - You should see the Medical AI Platform

2. **Test Registration**
   - Click "Sign Up"
   - Create a test account
   - Verify you can login

3. **Test Core Features**
   - Record audio
   - Upload image
   - Run AI analysis
   - Check profile page

---

## 🎉 **You're Live!**

Your Medical AI Platform is now deployed and accessible worldwide!

- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://your-app.railway.app`
- **Database**: MongoDB Atlas

---

## 🔧 **Alternative: Netlify + Render**

### **Frontend on Netlify**
1. Go to [netlify.com](https://netlify.com)
2. Drag and drop your `frontend/dist` folder
3. Or connect GitHub for auto-deployment

### **Backend on Render**
1. Go to [render.com](https://render.com)
2. Connect GitHub
3. Select your repository
4. Choose "Web Service"
5. Root Directory: `backend`
6. Build Command: `pip install -r requirements.txt`
7. Start Command: `python main.py`
8. Add environment variables

---

## 🚨 **Troubleshooting**

### **Common Issues**

1. **Backend not starting**
   - Check environment variables are set correctly
   - Verify MongoDB connection string
   - Check Railway logs

2. **Frontend can't connect to backend**
   - Verify `REACT_APP_API_URL` is set correctly
   - Check CORS settings in backend
   - Ensure backend is running

3. **MongoDB connection failed**
   - Verify connection string format
   - Check network access settings (0.0.0.0/0)
   - Verify database user credentials

4. **API keys not working**
   - Verify Groq API key is valid
   - Check ElevenLabs API key
   - Ensure keys are set in environment variables

### **Getting Help**
- Check Railway/Vercel logs for errors
- Verify all environment variables are set
- Test backend endpoints directly
- Check browser console for frontend errors

---

## 💰 **Free Tier Limits**

- **Railway**: $5/month credit (usually sufficient)
- **Vercel**: Unlimited for personal projects
- **MongoDB Atlas**: 512MB storage
- **Netlify**: 100GB bandwidth/month

---

## 🎯 **Next Steps**

1. **Custom Domain** (Optional)
   - Buy domain or use free subdomain
   - Configure DNS settings
   - Add SSL certificate (automatic)

2. **Monitoring**
   - Set up error tracking
   - Monitor performance
   - Check usage metrics

3. **Scaling**
   - Upgrade to paid tiers when needed
   - Add CDN for better performance
   - Implement caching

**Congratulations! Your FAANG-level Medical AI Platform is now live! 🚀**