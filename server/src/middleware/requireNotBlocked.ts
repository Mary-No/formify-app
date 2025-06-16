import { Request, Response, NextFunction } from 'express'
import { prisma } from '../prisma'

export async function requireNotBlocked(req: Request, res: Response, next: NextFunction) {
    const userId = req.session.userId
    if (!userId) {
        res.status(401).json({ error: 'Not authenticated' })
        return
    }

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
        res.status(404).json({ error: 'User not found' })
        return
    }

    if (user.isBlocked) {
        res.status(403).json({ error: 'Your account is blocked' })
        return

    }

    next()
}
