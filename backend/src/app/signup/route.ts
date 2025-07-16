import { Request, Response } from 'express';
import { adminAuth } from '../../firebase';

export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, displayName } = req.body;

    // Validate input
    if (!email || !password) {
      res.status(400).json({ 
        error: 'Email and password are required' 
      });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ 
        error: 'Password must be at least 6 characters long' 
      });
      return;
    }

    // Create user with Firebase Admin SDK
    const userRecord = await adminAuth.createUser({
      email,
      password,
      displayName,
      emailVerified: false,
    });

    // Create custom token for immediate login
    const customToken = await adminAuth.createCustomToken(userRecord.uid);

    res.status(201).json({
      message: 'User created successfully',
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
        emailVerified: userRecord.emailVerified,
      },
      customToken,
    });
  } catch (error: any) {
    console.error('Signup error:', error);
    
    if (error.code === 'auth/email-already-exists') {
      res.status(409).json({ 
        error: 'Email already exists' 
      });
      return;
    }
    
    if (error.code === 'auth/invalid-email') {
      res.status(400).json({ 
        error: 'Invalid email format' 
      });
      return;
    }
    
    if (error.code === 'auth/weak-password') {
      res.status(400).json({ 
        error: 'Password is too weak' 
      });
      return;
    }

    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
}; 