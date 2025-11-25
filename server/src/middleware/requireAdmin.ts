import { Request, Response, NextFunction } from 'express'
import { prisma } from '../prisma'
import {getUserId} from "../utils/getUserId";

export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
    const userId = getUserId(req)
    if (!userId) {
        res.status(401).json({ error: 'Not authenticated' })
        return
    }

    const user = await prisma.user.findUnique({
        where: { id: userId },
    })

    if (!user || !user.isAdmin || user.isBlocked) {
        res.status(403).json({ error: 'Access denied' })
        return
    }

    next()
}
