#!/bin/bash

echo "🚀 Setting up BDS PRO for Production Deployment"
echo "=============================================="

# 1. Install Heroku CLI (if not installed)
echo "📦 Installing Heroku CLI..."
# Uncomment the line below if you need to install Heroku CLI
# curl https://cli-assets.heroku.com/install.sh | sh

# 2. Login to Heroku
echo "🔐 Please login to Heroku..."
heroku login

# 3. Create Heroku app
echo "🏗️ Creating Heroku app..."
heroku create bds-pro-backend

# 4. Add database addon
echo "🗄️ Adding database addon..."
heroku addons:create jawsdb:kitefin

# 5. Set environment variables
echo "⚙️ Setting environment variables..."
heroku config:set JWT_SECRET=$(openssl rand -base64 32)
heroku config:set SESSION_SECRET=$(openssl rand -base64 32)
heroku config:set NODE_ENV=production

# 6. Deploy backend
echo "🚀 Deploying backend to Heroku..."
git subtree push --prefix backend heroku main

echo "✅ Backend deployed! Your API URL is: https://bds-pro-backend.herokuapp.com"
echo "📝 Next steps:"
echo "1. Go to Netlify dashboard"
echo "2. Add environment variable: NEXT_PUBLIC_API_URL=https://bds-pro-backend.herokuapp.com"
echo "3. Redeploy your frontend"
