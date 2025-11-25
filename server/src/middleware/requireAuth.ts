import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export function requireAuth(req: Request, res: Response, next: NextFunction) {
    console.log('req.headers:', req.headers);
    console.log('req.session.userId:', req.session?.userId);
    const authHeader = req.headers['authorization'];
    console.log('authHeader:', authHeader);
    if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        console.log('JWT token:', token);
        try {
            const payload = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
            req.user = { id: payload.id };
            return next();
        } catch (err) {
            console.log('JWT verification failed:', err);
            return res.status(401).json({ error: 'Invalid token' });
        }
    }

    if (req.session.userId) {
        console.log('Authenticated via session:', req.session.userId);
        req.user = { id: req.session.userId };
        return next();
    }

    res.status(401).json({ error: 'Not authenticated' });
}
