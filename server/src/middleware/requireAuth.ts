import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import {getUserId} from "../utils/getUserId";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];
    const userId = getUserId(req)
    if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
            const payload = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
            req.user = { id: payload.id };
            return next();
        } catch (err) {
            return res.status(401).json({ error: 'Invalid token' });
        }
    }

    if (userId) {
        req.user = { id: userId };
        return next();
    }

    res.status(401).json({ error: 'Not authenticated' });
}
