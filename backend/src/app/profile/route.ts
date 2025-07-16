import { Response } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth';

export const getProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    res.json({
      message: 'Profile retrieved successfully',
      user: req.user,
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}; 