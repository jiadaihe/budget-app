import { Request, Response } from 'express';
import { adminAuth } from '../../firebase';

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      res.status(400).json({ 
        error: 'Email and password are required' 
      });
      return;
    }

    // Note: Firebase Admin SDK doesn't support password verification directly
    // In a real application, you would use Firebase Auth REST API or client SDK
    // For this demo, we'll create a custom token for the user if they exist
    try {
      const userRecord = await adminAuth.getUserByEmail(email);
      
      // Create custom token for the user
      const customToken = await adminAuth.createCustomToken(userRecord.uid);

      res.json({
        message: 'Login successful',
        user: {
          uid: userRecord.uid,
          email: userRecord.email,
          displayName: userRecord.displayName,
          emailVerified: userRecord.emailVerified,
        },
        customToken,
      });
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        res.status(401).json({ 
          error: 'Invalid email or password' 
        });
        return;
      }
      throw error;
    }
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
}; 