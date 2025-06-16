import { Request, Response } from 'express'

type AsyncHandler = (req: Request, res: Response) => Promise<void>

export const handleRequest = (fn: AsyncHandler): AsyncHandler => {
    return async (req, res) => {
        try {
            await fn(req, res)
        } catch (error) {
            console.error(error)
            res.status(500).json({ error: 'Internal server error' })
        }
    }
}
