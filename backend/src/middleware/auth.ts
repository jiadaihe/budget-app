import { Request, Response, NextFunction } from 'express';
import { adminAuth } from '../firebase';

export interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    email: string;
    displayName?: string;
  };
}

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({ error: 'Access token required' });
      return;
    }

    const decodedToken = await adminAuth.verifyIdToken(token);
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email || '',
      displayName: decodedToken.name || undefined,
    };

    next();
    return;
  } catch (error) {
    console.error('Token verification failed:', error);
    res.status(403).json({ error: 'Invalid or expired token' });
    return;
  }
}; 