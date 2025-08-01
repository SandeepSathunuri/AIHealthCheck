# 🚀 Render Deployment Guide

## 📋 Environment Variables Required

Set these in your Render dashboard under "Environment":

### Required Variables:
```
GROQ_API_KEY=your_groq_api_key_here
MONGO_CONN=your_mongodb_connection_string_here
JWT_SECRET=your_jwt_secret_here
```

### Optional Variables:
```
HF_TOKEN=your_hugging_face_token_here
```

## 🔑 How to Get API Keys

### 1. Groq API Key (Required)
- Go to: https://console.groq.com/
- Sign up/login
- Create API key
- Copy the key starting with `gsk_`

### 2. MongoDB Connection (Required)
- Go to: https://cloud.mongodb.com/
- Create cluster
- Get connection string
- Format: `mongodb+srv://username:password@cluster.mongodb.net/`

### 3. JWT Secret (Required)
- Generate a random string
- Example: `your-super-secret-jwt-key-123`

### 4. Hugging Face Token (Optional)
- Go to: https://huggingface.co/settings/tokens
- Create token with "Read" permissions
- Copy token starting with `hf_`
- **Note**: System works without this token using free Google TTS

## 🌐 TTS System Behavior

### With HF_TOKEN:
1. Try Hugging Face TTS (premium quality)
2. Fallback to Google TTS (free, high quality)
3. Final fallback to mock audio

### Without HF_TOKEN:
1. Use Google TTS (free, high quality) ✅
2. Fallback to mock audio

## 🚀 Deployment Steps

1. **Push code to GitHub** (secrets removed)
2. **Connect Render to GitHub repo**
3. **Set environment variables** in Render dashboard
4. **Deploy** - should work immediately

## ✅ Expected Logs

```
🤗 Hugging Face TTS system ready
✅ Successfully imported Hugging Face TTS system
🚀 Server will start immediately with HF TTS support
✅ MongoDB connected successfully
🚀 Starting Medical AI Platform on port 10000
```

## 🎙️ TTS Quality

- **Google TTS**: Natural voice, ~40KB audio files
- **Mock Audio**: Silent fallback, always works
- **No heavy downloads**: Fast startup
- **No timeouts**: Reliable service

## 🔧 Troubleshooting

### If TTS fails:
- Check logs for "Free TTS successful"
- System automatically falls back to mock audio
- Users still get responses (with silent audio)

### If app won't start:
- Check all required environment variables are set
- Verify MongoDB connection string
- Check Groq API key format

## 📊 Production Ready Features

✅ Works without premium tokens  
✅ Multiple fallback systems  
✅ Fast startup (no model downloads)  
✅ Lightweight dependencies  
✅ Cloud-optimized  
✅ Error handling  
✅ Logging for debugging  

Your deployment is ready! 🎉