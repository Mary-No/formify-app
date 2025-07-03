import express from 'express'
import bcrypt from 'bcrypt'
import { prisma } from '../prisma'
import { Request, Response } from 'express'
import { handleRequest } from '../utils/handleRequest'
import passport from 'passport'
import { User } from '@prisma/client'

const router = express.Router()

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

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

router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email'],
}))

router.get('/google/callback',
    passport.authenticate('google', {
        failureRedirect: `${CLIENT_URL}/login`,
        session: true,
    }),
    (req, res) => {
        if (req.user) {
            req.session.userId = (req.user as User).id;
        }
        res.redirect(`${CLIENT_URL}/auth/callback`);
    }
);

router.post('/login', handleRequest(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400).json({
            error: 'Email and password are both required.'
        });
        return;
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        res.status(401).json({
            error: 'Account not found. Please check your email or sign up.'
        });
        return;
    }

    if (user.isBlocked) {
        res.status(403).json({
            error: 'Your account is temporarily locked. Contact support for help.'
        });
        return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        res.status(401).json({
            error: 'Incorrect password. Try again or reset your password.'
        });
        return;
    }

    req.session.userId = user.id;

    res.json({
        message: 'Welcome back! Login successful.',
        user: {
            id: user.id,
            email: user.email,
            nickname: user.nickname
        },
    });
}));

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
            res.status(403).json({ error: 'Your account is temporarily locked. Contact support for help.' })
            return
        }

        res.json({ user })
}))


router.post('/logout', (req: Request, res: Response): void => {
    req.session.destroy(err => {
        if (err) {
            console.error('Logout error:', err)
            res.status(500).json({ error: 'Logout failed' })
            return
        }

        res.clearCookie('connect.sid', {
            path: '/',
            sameSite: 'none',
            secure: true,
        })

        res.status(200).json({ message: 'Logged out' })
    })
})
export default router
