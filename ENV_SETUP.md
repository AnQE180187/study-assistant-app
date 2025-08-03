# Environment Variables Setup Guide

## 🔧 Backend Configuration

### 1. Copy and configure backend environment:
```bash
cd backend
cp .env.example .env
```

### 2. Update the following variables in `backend/.env`:

#### **Google OAuth Setup:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API and Google OAuth2 API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:3000/auth/google/callback`
   - `exp://localhost:19000/--/auth/google`
6. Copy Client ID and Client Secret to `.env`

#### **ZaloPay Setup:**
1. Register at [ZaloPay Developer](https://developers.zalopay.vn/)
2. Create new application
3. Get App ID, Key1, Key2 from dashboard
4. Update in `.env`:
```env
ZALOPAY_APP_ID=your_app_id
ZALOPAY_KEY1=your_key1
ZALOPAY_KEY2=your_key2
```

#### **VNPay Setup:**
1. Register merchant at [VNPay](https://vnpay.vn/)
2. Get TMN Code and Hash Secret
3. Update in `.env`:
```env
VNPAY_TMN_CODE=your_tmn_code
VNPAY_HASH_SECRET=your_hash_secret
```

## 📱 Frontend Configuration

### 1. Copy and configure frontend environment:
```bash
cd frontend/smart-study-assistant
cp .env.example .env
```

### 2. Update Google OAuth credentials in `frontend/smart-study-assistant/.env`:
```env
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your_web_client_id
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=your_ios_client_id
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=your_android_client_id
EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID=your_expo_client_id
```

### 3. Configure API URL:
- **Development**: `http://localhost:5000/api`
- **Production**: Your production API URL

## 🔑 Getting Google OAuth Credentials

### For Web Client ID:
- Platform: Web application
- Authorized origins: `http://localhost:3000`

### For iOS Client ID:
- Platform: iOS
- Bundle ID: Your app's bundle identifier

### For Android Client ID:
- Platform: Android
- Package name: Your app's package name
- SHA-1 certificate fingerprint

### For Expo Client ID:
- Platform: Web application
- Authorized origins: `https://auth.expo.io`

## 🚀 Quick Start

1. **Backend:**
```bash
cd backend
npm install
npm run dev
```

2. **Frontend:**
```bash
cd frontend/smart-study-assistant
npm install
npx expo start
```

## ⚠️ Security Notes

- Never commit `.env` files to version control
- Use different credentials for development and production
- Keep API keys secure and rotate them regularly
- Use sandbox/test credentials for development

## 🧪 Testing

### Test Google Login:
1. Ensure Google OAuth credentials are configured
2. Run both backend and frontend
3. Try login with Google on mobile app

### Test Payment:
1. Use ZaloPay/VNPay sandbox credentials
2. Test payment flow in app
3. Check webhook responses

### Test Voice Input:
1. Grant microphone permissions
2. Test voice input in Notes and Flashcards
3. Verify speech-to-text functionality

## 📞 Support

If you encounter issues:
1. Check console logs for API errors
2. Verify all environment variables are set
3. Ensure services are running on correct ports
4. Check network connectivity between frontend and backend
