# Legal AI Chatbot - Deployment Guide

This guide will help you deploy the Legal AI Chatbot to production using Vercel (Frontend) and Render (Backend).

## Prerequisites

- GitHub account
- Vercel account (sign up at https://vercel.com)
- Render account (sign up at https://render.com)
- All API keys ready:
  - Pinecone API Key
  - Google Gemini API Key
  - MongoDB Connection String

---

## Backend Deployment (Render)

### Step 1: Prepare Your Repository
✅ Already done - Your code is pushed to: https://github.com/arjun9978/Legal_Assistance_Chatbot.git

### Step 2: Deploy to Render

1. **Go to Render Dashboard**
   - Visit https://dashboard.render.com/
   - Click "New +" button
   - Select "Web Service"

2. **Connect Your Repository**
   - Click "Connect account" to link your GitHub
   - Search for "Legal_Assistance_Chatbot"
   - Click "Connect"

3. **Configure the Service**
   - **Name**: `legal-chatbot-backend`
   - **Region**: Select closest to your users (e.g., Singapore, Oregon)
   - **Branch**: `main`
   - **Root Directory**: Leave empty
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r backend/requirements.txt`
   - **Start Command**: `cd backend && gunicorn app:app --bind 0.0.0.0:$PORT`

4. **Add Environment Variables**
   Click "Advanced" → "Add Environment Variable" and add these:
   
   ```
   PINECONE_API_KEY=pcsk_QFNfK_QncaPX7fK3E1wQZ144RxpA7Efmzv7WZa47Uakm84jHfUCakfaMwqeoqq7j9d1ua
   PINECONE_INDEX_NAME=legal-index-v1
   GOOGLE_API_KEY=AIzaSyCrMXeXrTXaUxvV1DCEYYkbTMU0qUzb2Kc
   MONGODB_URI=mongodb+srv://arjunbrt1303_db_user:abL1L9NykdGiiTe5@legalchatbot.hrgjyjd.mongodb.net/LegalChatbot?retryWrites=true&w=majority&serverSelectionTimeoutMS=5000&connectTimeoutMS=10000
   DB_NAME=LegalChatbot
   SECRET_KEY=FTdfoOjfjbKj6oD13SehEU8W6bzkl7nCmFxgOs8cMsQ
   PYTHON_VERSION=3.11.0
   ```

5. **Select Plan**
   - Choose "Free" tier to start
   - Click "Create Web Service"

6. **Wait for Deployment**
   - Render will build and deploy your backend
   - Once done, you'll get a URL like: `https://legal-chatbot-backend.onrender.com`
   - **SAVE THIS URL** - you'll need it for frontend deployment

7. **Test Your Backend**
   - Visit: `https://your-backend-url.onrender.com/api/health`
   - Should return: `{"status": "healthy"}`

---

## Frontend Deployment (Vercel)

### Step 1: Update Frontend Environment Variable

Before deploying, you need to know your backend URL from Render.

### Step 2: Deploy to Vercel

1. **Go to Vercel Dashboard**
   - Visit https://vercel.com/dashboard
   - Click "Add New..." → "Project"

2. **Import Your Repository**
   - Click "Import Git Repository"
   - Find "Legal_Assistance_Chatbot"
   - Click "Import"

3. **Configure Project**
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

4. **Add Environment Variable**
   - Click "Environment Variables"
   - Add:
     ```
     Name: VITE_API_URL
     Value: https://your-backend-url.onrender.com/api
     ```
   - Replace `your-backend-url.onrender.com` with your actual Render backend URL

5. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes for build to complete
   - You'll get a URL like: `https://legal-assistance-chatbot.vercel.app`

### Step 3: Update Backend CORS Settings

After getting your Vercel URL, you need to update the backend to allow requests from it.

1. Go back to Render Dashboard
2. Find your backend service
3. Go to "Environment" tab
4. Add a new environment variable:
   ```
   FRONTEND_URL=https://your-vercel-url.vercel.app
   ```
5. The backend `app.py` should already have CORS configured, but verify it allows your frontend URL

---

## Quick Deployment Summary

### Backend on Render:
```bash
Build Command: pip install -r backend/requirements.txt
Start Command: cd backend && gunicorn app:app --bind 0.0.0.0:$PORT
```

### Frontend on Vercel:
```bash
Root Directory: frontend
Build Command: npm run build
Output Directory: dist
Environment: VITE_API_URL=https://your-backend-url.onrender.com/api
```

---

## Post-Deployment Checklist

- [ ] Backend health check works: `https://your-backend-url/api/health`
- [ ] Frontend loads: `https://your-vercel-url.vercel.app`
- [ ] User can register/login
- [ ] Chat functionality works
- [ ] File upload works
- [ ] Background effects display correctly

---

## Troubleshooting

### Backend Issues:
- **Build fails**: Check that all dependencies in `requirements.txt` are valid
- **App crashes**: Check Render logs for errors
- **Database connection fails**: Verify MongoDB URI is correct

### Frontend Issues:
- **Build fails**: Check for syntax errors in components
- **API calls fail**: Verify `VITE_API_URL` is correct
- **CORS errors**: Add frontend URL to backend CORS whitelist

### Common Fixes:
- **Render free tier sleeps**: First request takes 30-60s (cold start)
- **Environment variables**: Double-check all values are set correctly
- **Node/Python version**: Ensure compatible versions

---

## Free Tier Limitations

**Render Free Tier:**
- Service spins down after 15 minutes of inactivity
- First request after sleep takes ~30-60 seconds
- 750 hours/month free

**Vercel Free Tier:**
- 100 GB bandwidth/month
- Unlimited deployments
- Automatic HTTPS

---

## Support

If you encounter issues:
1. Check Render logs: Dashboard → Your Service → Logs
2. Check Vercel logs: Dashboard → Your Project → Deployments → View Logs
3. Verify all environment variables are set correctly

---

## Local Development

To run locally:

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

---

## Next Steps After Deployment

1. **Custom Domain** (Optional): Add your own domain in Vercel settings
2. **Monitoring**: Set up uptime monitoring (e.g., UptimeRobot)
3. **Analytics**: Add analytics to track usage
4. **Backups**: Regular MongoDB backups

---

Congratulations! Your Legal AI Chatbot is now live! 🎉
