import { Request, Response, NextFunction } from 'express'
import { prisma } from '../prisma'

export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
    if (!req.session.userId) {
        res.status(401).json({ error: 'Not authenticated' })
        return
    }

    const user = await prisma.user.findUnique({
        where: { id: req.session.userId },
    })

    if (!user || !user.isAdmin || user.isBlocked) {
        res.status(403).json({ error: 'Access denied' })
        return
    }

    next()
}
