import { Request } from 'express'

export const getUserId = (req: Request): string => {
    const userId = req.user?.id;
    if (!userId) throw new Error('User not authenticated')
    return userId
}