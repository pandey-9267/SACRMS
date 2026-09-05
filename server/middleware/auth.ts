import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/models';

export interface AuthRequest extends Request {
  user?: { id: string; role: string; campId?: string | null };
}

export async function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({
      message: 'Authentication required',
    });
  }

  try {
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET || 'development-secret'
    ) as { id: string };

    const user = await User.findById(payload.id).select('_id role campId');

    if (!user) {
      return res.status(401).json({
        message: 'User no longer exists',
      });
    }

    console.log('AUTH USER:', {
      id: String(user._id),
      role: user.role,
      campId: user.campId ? String(user.campId) : null,
    });

    req.user = {
      id: String(user._id),
      role: user.role,
      campId: user.campId ? String(user.campId) : null,
    };

    next();
  } catch (error) {
    console.error('AUTH ERROR:', error);

    return res.status(401).json({
      message: 'Invalid or expired token',
    });
  }
}

export function requireRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    console.log('ROLE CHECK:', {
      actualRole: req.user?.role,
      allowedRoles: roles,
    });

    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: 'Insufficient permissions',
      });
    }

    next();
  };
}