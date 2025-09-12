@echo off
echo.
echo ========================================
echo    Google OAuth Setup Helper
echo ========================================
echo.

echo This script will help you configure Google OAuth credentials.
echo.
echo Before running this script, make sure you have:
echo 1. Created a Google Cloud Project
echo 2. Enabled Google+ API  
echo 3. Created OAuth 2.0 credentials
echo 4. Got your Client ID and Client Secret
echo.

pause

echo Starting setup...
node setup-google-oauth.js

echo.
echo Setup complete! Press any key to exit.
pause > nul
