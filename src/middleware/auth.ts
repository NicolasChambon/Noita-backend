import { Response, NextFunction } from 'express';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getAuth, DecodedIdToken } from 'firebase-admin/auth';
import { AuthenticatedRequest, FirebaseUser } from '../types/index.js';
import { UnauthorizedError } from '../utils/errors/AppError.js';

// Initialize Firebase Admin only once
if (!getApps().length) {
  initializeApp();
}

const createFirebaseUser = (decodedToken: DecodedIdToken): FirebaseUser => {
  return {
    uid: decodedToken.uid,
    email:
      typeof decodedToken.email === 'string' ? decodedToken.email : undefined,
    email_verified: Boolean(decodedToken.email_verified),
    name: typeof decodedToken.name === 'string' ? decodedToken.name : undefined,
  };
};

export const auth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      throw new UnauthorizedError('Invalid token format');
    }

    const decodedToken: DecodedIdToken = await getAuth().verifyIdToken(token);

    // Attach user info to request with proper typing
    req.user = createFirebaseUser(decodedToken);

    next();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      res.status(401).json({
        message: error.message,
        errors: ['Authentication failed'],
        status: 401,
      });
    } else {
      console.error('Authentication error:', error);
      res.status(401).json({
        message: 'User not authenticated',
        errors: ['Invalid or expired token'],
        status: 401,
      });
    }
  }
};

// Optional auth middleware - doesn't throw if no token provided
export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];

      if (token) {
        const decodedToken: DecodedIdToken =
          await getAuth().verifyIdToken(token);
        req.user = createFirebaseUser(decodedToken);
      }
    }

    next();
  } catch (error) {
    // For optional auth, we don't throw errors, just continue without user
    console.warn('Optional authentication failed:', error);
    next();
  }
};

export default auth;
