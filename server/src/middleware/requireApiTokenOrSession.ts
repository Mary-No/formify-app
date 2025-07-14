import { prisma } from '../prisma'
import {NextFunction, Request, Response} from "express";

export async function requireApiTokenOrSession(req: Request, res: Response, next: NextFunction) {
    try {
        const authHeader = req.headers['authorization'];
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            const user = await prisma.user.findUnique({
                where: { apiToken: token },
                select: { id: true, email: true, nickname: true, isBlocked: true, isAdmin: true },
            });

            if (!user) {
                res.status(401).json({ error: 'Invalid API token' });
                return
            }
            if (user.isBlocked) {
                res.status(403).json({ error: 'Account is blocked' });
                return
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
