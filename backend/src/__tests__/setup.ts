import dotenv from 'dotenv';

// Load environment variables for testing
dotenv.config({ path: '.env.test' });

// Set test environment variables if not already set
process.env.NODE_ENV = 'test';
process.env.PORT = '3002'; // Use different port for tests

// Increase timeout for Firebase operations
jest.setTimeout(30000);

// Mock Firebase Admin SDK for testing
jest.mock('firebase-admin', () => ({
  initializeApp: jest.fn(),
  credential: {
    cert: jest.fn(() => ({})),
  },
  auth: jest.fn(() => ({
    createUser: jest.fn().mockResolvedValue({
      uid: 'test-user-id',
      email: 'test@example.com',
      displayName: 'Test User',
      emailVerified: false,
    }),
    getUserByEmail: jest.fn().mockResolvedValue({
      uid: 'test-user-id',
      email: 'test@example.com',
      displayName: 'Test User',
      emailVerified: false,
    }),
    createCustomToken: jest.fn().mockResolvedValue('mock-custom-token'),
    verifyIdToken: jest.fn().mockResolvedValue({
      uid: 'test-user-id',
      email: 'test@example.com',
      name: 'Test User',
    }),
    deleteUser: jest.fn().mockResolvedValue(undefined),
    listUsers: jest.fn().mockResolvedValue({
      users: [],
    }),
  })),
  apps: [],
})); 