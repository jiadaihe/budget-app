# Firebase Auth Frontend Demo

A React frontend that demonstrates Firebase Authentication with email/password, following the [official Firebase documentation](https://firebase.google.com/docs/auth/web/password-auth).

## Features

- ✅ User registration with email/password
- ✅ User login with email/password
- ✅ Real-time authentication state management
- ✅ Secure communication with backend using Firebase ID tokens
- ✅ Beautiful, responsive UI with modern design
- ✅ Error handling and user feedback
- ✅ Backend health status monitoring

## Quick Start

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Start the Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## How to Test the Full Flow

### Prerequisites

1. **Backend Server**: Make sure your backend is running on `http://localhost:3001`
2. **Firebase Configuration**: The app uses the same Firebase config as your backend

### Testing Steps

1. **Start both servers**:
   ```bash
   # Terminal 1 - Backend
   cd backend && npm run dev
   
   # Terminal 2 - Frontend
   cd frontend && npm run dev
   ```

2. **Open the frontend** at `http://localhost:3000`

3. **Test the authentication flow**:
   - **Sign Up**: Create a new account with email/password
   - **Sign In**: Log in with existing credentials
   - **Get Profile**: Click "Get Profile from Backend" to test the protected API
   - **Sign Out**: Log out and verify the session is cleared

### Expected Behavior

- **Backend Status**: Should show "Connected" if your backend is running
- **Sign Up**: Creates a new Firebase user account
- **Sign In**: Authenticates with Firebase and gets an ID token
- **Get Profile**: Sends the ID token to your backend, which verifies it and returns user data
- **Profile Response**: You should see the user data returned from your backend

## Architecture

### Frontend (React + Firebase JS SDK)
- Handles user authentication (signup/login)
- Manages authentication state
- Gets Firebase ID tokens for backend communication

### Backend (Express + Firebase Admin SDK)
- Verifies Firebase ID tokens using middleware
- Provides protected endpoints
- Returns user data for authenticated requests

### Data Flow
1. User signs up/logs in on frontend → Firebase creates/authenticates user
2. Frontend gets ID token from Firebase
3. Frontend sends requests to backend with ID token in Authorization header
4. Backend middleware verifies the ID token
5. Backend returns protected data

## File Structure

```
frontend/
├── src/
│   ├── firebase.ts      # Firebase configuration
│   ├── auth.ts          # Authentication functions
│   ├── api.ts           # Backend API communication
│   ├── App.tsx          # Main React component
│   ├── App.css          # Styles
│   └── main.tsx         # App entry point
├── package.json         # Dependencies
├── vite.config.js       # Vite configuration
└── index.html           # HTML template
```

## API Endpoints Used

- `GET /health` - Backend health check
- `GET /api/profile` - Protected user profile (requires Firebase ID token)

## Firebase Configuration

The app uses the same Firebase configuration as your backend.


## Error Handling

The app handles common Firebase authentication errors:
- Email already in use
- Invalid email format
- Weak password
- User not found
- Wrong password
- Too many failed attempts

## Security Notes

- Passwords are handled securely by Firebase
- ID tokens are short-lived and automatically refreshed
- No sensitive data is stored in localStorage
- All backend communication uses HTTPS in production

## Development

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

### Environment Variables

No environment variables needed for the frontend - the Firebase configuration is hardcoded to match your backend.

## Troubleshooting

### Common Issues

1. **Backend shows "Disconnected"**:
   - Make sure your backend is running on port 3001
   - Check that the backend health endpoint is accessible

2. **Authentication errors**:
   - Verify your Firebase project is properly configured
   - Check the browser console for detailed error messages

3. **CORS errors**:
   - The backend should have CORS configured to allow requests from `http://localhost:3000`

4. **Profile request fails**:
   - Ensure you're logged in before clicking "Get Profile"
   - Check that your backend middleware is properly configured

### Debug Mode

Open browser developer tools to see:
- Firebase authentication logs
- API request/response details
- Error messages and stack traces

## Next Steps

This demo shows the basic Firebase authentication flow. You can extend it by:

1. **Adding more protected endpoints** on the backend
2. **Implementing user profile management**
3. **Adding social authentication** (Google, Facebook, etc.)
4. **Implementing password reset functionality**
5. **Adding email verification**

## References

- [Firebase Auth Documentation](https://firebase.google.com/docs/auth/web/password-auth)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
