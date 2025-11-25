import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export function requireAuth(req: Request, res: Response, next: NextFunction) {

    const authHeader = req.headers['authorization'];
    if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
            const payload = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
            console.log('JWT verified, payload:', payload);
            req.user = { id: payload.id };
            return next();
        } catch (err) {
            console.log('JWT verification failed:', err);
            return res.status(401).json({ error: 'Invalid token' });
        }
    }

    if (req.session.userId) {
        req.user = { id: req.session.userId };
        return next();
    }

    res.status(401).json({ error: 'Not authenticated' });
}
