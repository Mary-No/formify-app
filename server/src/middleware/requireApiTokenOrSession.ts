import { prisma } from '../prisma'
import { NextFunction, Request, Response } from "express";
import jwt from 'jsonwebtoken'

export async function requireApiTokenOrSession(req: Request, res: Response, next: NextFunction) {
    const JWT_SECRET = process.env.JWT_SECRET || 'some_super_secret_key'
    try {
        const authHeader = req.headers['authorization'];
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];

            let payload;
            try {
                payload = jwt.verify(token, JWT_SECRET) as { userId?: string };
            } catch (e) {
                return res.status(401).json({ error: 'Invalid API token' });
            }

            if (!payload.userId) {
                return res.status(401).json({ error: 'Invalid API token payload' });
            }

            const user = await prisma.user.findUnique({
                where: { id: payload.userId },
                select: { id: true, email: true, nickname: true, isBlocked: true, isAdmin: true },
            });

            if (!user) {
                return res.status(401).json({ error: 'Invalid API token' });
            }
            if (user.isBlocked) {
                return res.status(403).json({ error: 'Account is blocked' });
            }

            req.user = user;
            return next();
        }

        if (req.session && req.session.userId) {
            const user = await prisma.user.findUnique({
                where: { id: req.session.userId },
                select: { id: true, email: true, nickname: true, isBlocked: true, isAdmin: true },
            });

            if (!user) {
                return res.status(401).json({ error: 'Invalid session' });
            }
            if (user.isBlocked) {
                return res.status(403).json({ error: 'Account is blocked' });
            }

            req.user = user;
            return next();
        }

        return res.status(401).json({ error: 'Unauthorized' });
    } catch (err) {
        console.error('Auth middleware error:', err);
        return res.status(500).json({ error: 'Auth middleware failed' });
    }
}

