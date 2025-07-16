import request from 'supertest';
import app from '../server';
import { adminAuth } from '../firebase';

describe('Authentication API', () => {
  const testUser = {
    email: 'test@example.com',
    password: 'password123',
    displayName: 'Test User'
  };

  let createdUserId: string;

  beforeAll(async () => {
    // Clean up any existing test user
    try {
      const userRecord = await adminAuth.getUserByEmail(testUser.email);
      await adminAuth.deleteUser(userRecord.uid);
    } catch (error) {
      // User doesn't exist, which is fine
    }
  });

  afterAll(async () => {
    // Clean up test user
    if (createdUserId) {
      try {
        await adminAuth.deleteUser(createdUserId);
      } catch (error) {
        console.error('Failed to clean up test user:', error);
      }
    }
  });

  describe('POST /api/auth/signup', () => {
    it('should create a new user successfully (happy path)', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send(testUser)
        .expect(201);

      expect(response.body).toHaveProperty('message', 'User created successfully');
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('customToken');
      
      const { user } = response.body;
      expect(user).toHaveProperty('uid');
      expect(user.email).toBe(testUser.email);
      expect(user.displayName).toBe(testUser.displayName);
      expect(user.emailVerified).toBe(false);

      createdUserId = user.uid;
    });

    it('should return 400 for missing email', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({ password: 'password123', displayName: 'Test User' })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Email and password are required');
    });

    it('should return 400 for missing password', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({ email: 'test@example.com', displayName: 'Test User' })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Email and password are required');
    });

    it('should return 400 for weak password', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({ email: 'test2@example.com', password: '123', displayName: 'Test User' })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Password must be at least 6 characters long');
    });

    it('should return 409 for duplicate email', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send(testUser)
        .expect(409);

      expect(response.body).toHaveProperty('error', 'Email already exists');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login existing user successfully (happy path)', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        })
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Login successful');
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('customToken');
      
      const { user } = response.body;
      expect(user).toHaveProperty('uid');
      expect(user.email).toBe(testUser.email);
      expect(user.displayName).toBe(testUser.displayName);
    });

    it('should return 400 for missing email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ password: 'password123' })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Email and password are required');
    });

    it('should return 400 for missing password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com' })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Email and password are required');
    });

    it('should return 401 for non-existent user', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        })
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Invalid email or password');
    });
  });

  describe('GET /api/profile', () => {
    let authToken: string;

    beforeAll(async () => {
      // Get a custom token for authentication
      const customToken = await adminAuth.createCustomToken(createdUserId);
      authToken = customToken;
    });

    it('should return user profile with valid token (happy path)', async () => {
      const response = await request(app)
        .get('/api/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Profile retrieved successfully');
      expect(response.body).toHaveProperty('user');
      
      const { user } = response.body;
      expect(user).toHaveProperty('uid');
      expect(user).toHaveProperty('email');
    });

    it('should return 401 without authorization header', async () => {
      const response = await request(app)
        .get('/api/profile')
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Access token required');
    });

    it('should return 401 with invalid token', async () => {
      const response = await request(app)
        .get('/api/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(403);

      expect(response.body).toHaveProperty('error', 'Invalid or expired token');
    });
  });

  describe('Health Check', () => {
    it('should return server status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('message', 'Server is running');
    });
  });
}); 