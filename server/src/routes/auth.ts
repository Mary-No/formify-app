import express from 'express'
import bcrypt from 'bcrypt'
import { prisma } from '../prisma'
import { Request, Response } from 'express'
import { handleRequest } from '../utils/handleRequest'

const router = express.Router()


router.post('/register', handleRequest(async (req, res) => {
        const { email, password, nickname } = req.body
        if (!email || !password || !nickname) {
            res.status(400).json({ error: 'Email, password and name are required' })
            return
        }

        const existingUser = await prisma.user.findUnique({ where: { email } })
        if (existingUser) {
            res.status(409).json({ error: 'User already exists' })
            return
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        const user = await prisma.user.create({
            data: { email, password: hashedPassword, nickname },
        })

        req.session.userId = user.id

        res.status(201).json({
            message: 'Registered successfully',
            user: { id: user.id, email: user.email, nickname: user.nickname },
        })
}))

router.post('/login', handleRequest(async (req, res) => {
        const { email, password } = req.body
        if (!email || !password) {
            res.status(400).json({ error: 'Email and password are required' })
            return
        }

        const user = await prisma.user.findUnique({ where: { email } })
        if (!user) {
            res.status(401).json({ error: 'Invalid credentials' })
            return
        }

        if (user.isBlocked) {
            res.status(403).json({ error: 'Your account is blocked' })
            return
        }

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            res.status(401).json({ error: 'Invalid credentials' })
            return
        }

        req.session.userId = user.id

        res.json({
            message: 'Logged in',
            user: { id: user.id, email: user.email, nickname: user.nickname },
        })
}))

router.get('/me', handleRequest(async (req, res) => {
        const userId = req.session.userId
        if (!userId) {
            res.status(401).json({ error: 'Not authenticated' })
            return
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, email: true, nickname: true, isAdmin: true, isBlocked: true },
        })

        if (!user) {
            res.status(404).json({ error: 'User not found' })
            return
        }

        if (user.isBlocked) {
            res.status(403).json({ error: 'Your account is blocked' })
            return
        }

        res.json({ user })
}))


router.post('/logout', (req: Request, res: Response): void => {
    req.session.destroy(err => {
        if (err) {
            console.error(err)
            res.status(500).json({ error: 'Logout failed' })
            return
        }
        res.clearCookie('connect.sid')
        res.json({ message: 'Logged out' })
    })
})

export default router
