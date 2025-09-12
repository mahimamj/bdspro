# Google OAuth Quick Reference

## 🚀 Quick Setup (5 minutes)

### 1. Get Google Credentials
1. Go to: https://console.cloud.google.com/
2. Create project → Enable Google+ API
3. OAuth consent screen → Add your email as test user
4. Credentials → Create OAuth 2.0 Client ID
5. Add redirect URI: `http://localhost:5001/api/auth/google/callback`

### 2. Configure Your App
**Option A: Use Setup Script**
```bash
# Run the setup helper
node setup-google-oauth.js
```

**Option B: Manual Setup**
Create `Final/backend/.env`:
```env
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:5001/api/auth/google/callback
SESSION_SECRET=your_session_secret_here
```

### 3. Test
1. Restart servers
2. Go to: http://localhost:3000/login
3. Click "Continue with Google"

## 🔧 Common Issues

| Error | Solution |
|-------|----------|
| `Error 401: invalid_client` | Check Client ID/Secret in .env |
| `redirect_uri_mismatch` | Add exact URI: `http://localhost:5000/api/auth/google/callback` |
| `Access blocked` | Add your email to test users in OAuth consent screen |

## 📋 Required Redirect URIs

**Development:**
- `http://localhost:5001/api/auth/google/callback`

**Production:**
- `https://yourdomain.com/api/auth/google/callback`

## 🔑 Environment Variables

```env
# Required for Google OAuth
GOOGLE_CLIENT_ID=123456789-abc.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghijklmnop
GOOGLE_CALLBACK_URL=http://localhost:5001/api/auth/google/callback
SESSION_SECRET=your_32_character_secret_here
```

## 📚 Full Guide
See: `GOOGLE_OAUTH_API_KEY_GUIDE.md` for detailed instructions
