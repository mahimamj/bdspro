# Google OAuth Setup Instructions

## 1. Create Google OAuth Credentials

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" in the left sidebar
5. Click "Create Credentials" → "OAuth 2.0 Client IDs"
6. Choose "Web application"
7. Add authorized redirect URIs:
   - `http://localhost:5001/api/auth/google/callback` (for development)
   - `https://yourdomain.com/api/auth/google/callback` (for production)

## 2. Environment Variables

Add these environment variables to your `.env` file in the backend directory:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:5001/api/auth/google/callback

# Session Configuration
SESSION_SECRET=your_session_secret_here
```

## 3. How It Works

1. User clicks "Continue with Google" button
2. Frontend redirects to `/api/auth/google`
3. Backend redirects to Google OAuth consent screen
4. User authorizes the application
5. Google redirects back to `/api/auth/google/callback`
6. Backend processes the OAuth response and creates/updates user
7. Backend generates JWT token and redirects to frontend with token
8. Frontend stores token and redirects to dashboard

## 4. Testing

1. Start the backend server: `npm start` (in backend directory)
2. Start the frontend server: `npm start` (in frontend directory)
3. Go to `http://localhost:3000/login`
4. Click "Continue with Google"
5. Complete Google OAuth flow
6. You should be redirected to the dashboard

## 5. Features

- **Automatic User Creation**: New users are automatically created when they sign in with Google
- **Existing User Login**: Existing users can sign in with Google if their email matches
- **JWT Token**: Secure authentication using JWT tokens
- **Session Management**: Proper session handling for OAuth flow
- **Error Handling**: Graceful error handling for failed OAuth attempts

## 6. Security Notes

- Always use HTTPS in production
- Keep your Google OAuth credentials secure
- Use strong session secrets
- Implement proper CORS settings
- Consider implementing token refresh for long-lived sessions
