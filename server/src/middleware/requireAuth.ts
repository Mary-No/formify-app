import { Request, Response, NextFunction } from 'express'

export function requireAuth(req: Request, res: Response, next: NextFunction) {
    if (!req.session.userId) {
        res.status(401).json({ error: 'Not authenticated' })
        return
    }

    next()
}
