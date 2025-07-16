# Budget App Backend - Firebase Authentication

This backend provides Firebase Authentication endpoints for user signup, login, and profile management.

## Features

- ✅ User registration with email/password
- ✅ User login with email/password  
- ✅ Protected routes with JWT token authentication
- ✅ Comprehensive integration tests
- ✅ TypeScript support
- ✅ Express.js server with CORS

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Firebase Configuration

You need to set up Firebase Admin SDK credentials:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (`budget-app-72d92`)
3. Go to **Project Settings** > **Service Accounts**
4. Click **Generate New Private Key**
5. Download the JSON file, name it `private-key.json` and put it under /backend

### 3. Environment Variables

Create a `.env` file in the backend directory:

```bash
cp env.example .env
```

Then update the `.env` file with your Firebase credentials:

```env
FIREBASE_CLIENT_EMAIL=your-service-account-email@budget-app-72d92.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
PORT=3001
NODE_ENV=development
```

### 4. Run the Server

```bash
# Development mode with hot reload
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:3001`

## API Endpoints

### Authentication

#### POST `/api/auth/signup`
Create a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "displayName": "John Doe"
}
```

**Response (201):**
```json
{
  "message": "User created successfully",
  "user": {
    "uid": "user123",
    "email": "user@example.com",
    "displayName": "John Doe",
    "emailVerified": false
  },
  "customToken": "eyJhbGciOiJSUzI1NiIs..."
}
```

#### POST `/api/auth/login`
Authenticate an existing user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "user": {
    "uid": "user123",
    "email": "user@example.com",
    "displayName": "John Doe",
    "emailVerified": false
  },
  "customToken": "eyJhbGciOiJSUzI1NiIs..."
}
```

### Protected Routes

#### GET `/api/profile`
Get user profile (requires authentication).

**Headers:**
```
Authorization: Bearer <customToken>
```

**Response (200):**
```json
{
  "message": "Profile retrieved successfully",
  "user": {
    "uid": "user123",
    "email": "user@example.com",
    "displayName": "John Doe"
  }
}
```

### Health Check

#### GET `/health`
Check server status.

**Response (200):**
```json
{
  "status": "OK",
  "message": "Server is running"
}
```

## Testing

### Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

## User Data Storage

### Where is user data stored?

**Firebase Authentication Database:**
- User accounts are stored in Firebase Authentication
- This includes: email, password hash, display name, email verification status
- **Location:** Firebase Console > Authentication > Users

**How to find user data:**

1. **Firebase Console:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project (`budget-app-72d92`)
   - Navigate to **Authentication** > **Users**
   - You'll see all registered users with their details

2. **Programmatically:**
   ```typescript
   // List all users
   const listUsersResult = await adminAuth.listUsers();
   console.log(listUsersResult.users);
   
   // Get specific user by email
   const userRecord = await adminAuth.getUserByEmail('user@example.com');
   console.log(userRecord);
   ```

### Data Structure

Each user record contains:
- `uid`: Unique user ID
- `email`: User's email address
- `displayName`: User's display name (optional)
- `emailVerified`: Whether email is verified
- `creationTime`: When account was created
- `lastSignInTime`: Last login timestamp
- `disabled`: Whether account is disabled

### Security Notes

- Passwords are hashed and stored securely by Firebase
- Never store sensitive data in client-side code
- Use Firebase Admin SDK for server-side operations
- Custom tokens are short-lived and should be exchanged for ID tokens on the client

## Development

### Project Structure

```
backend/
├── src/
│   ├── app/
│   │   ├── login/route.ts      # Login endpoint
│   │   ├── signup/route.ts     # Signup endpoint
│   │   └── profile/route.ts    # Protected profile endpoint
│   ├── middleware/
│   │   └── auth.ts             # Authentication middleware
│   ├── __tests__/
│   │   ├── auth.test.ts        # Integration tests
│   │   └── setup.ts            # Test configuration
│   ├── firebase.ts             # Firebase configuration
│   └── server.ts               # Express server
├── jest.config.js              # Jest configuration
├── package.json                # Dependencies
└── tsconfig.json              # TypeScript configuration
```

### Adding New Protected Routes

1. Create your route handler
2. Import the `authenticateToken` middleware
3. Add the middleware to your route:

```typescript
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';

app.get('/api/protected-route', authenticateToken, (req: AuthenticatedRequest, res) => {
  // Access user data via req.user
  res.json({ user: req.user });
});
```

## Troubleshooting

### Common Issues

1. **Firebase Admin SDK initialization error:**
   - Check your `.env` file has correct credentials
   - Ensure private key includes newlines (`\n`)

2. **CORS errors:**
   - The server includes CORS middleware
   - Check your frontend is making requests to the correct port

3. **Authentication errors:**
   - Ensure you're sending the `Authorization: Bearer <token>` header
   - Custom tokens expire quickly, exchange them for ID tokens on the client

### Debug Mode

Set `NODE_ENV=development` to see detailed error messages and request logs. 