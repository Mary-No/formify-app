import express from 'express'
import bcrypt from 'bcrypt'
import { prisma } from '../prisma'
import { handleRequest } from '../utils/handleRequest'
import passport from 'passport'
import jwt from 'jsonwebtoken';
import { requireAuth } from '../middleware/requireAuth'
import { generateAccessToken, generateRefreshToken } from '../utils/tokens'
import { setRefreshCookie } from '../utils/setRefreshCookie'


const router = express.Router()

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

router.post('/register', handleRequest(async (req, res) => {
    const { email, password, nickname } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
        res.status(409).json({ error: 'User already exists' });
        return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
        data: { email, password: hashedPassword, nickname },
    });

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    setRefreshCookie(res, refreshToken);

    res.status(201).json({
        message: 'Registered successfully',
        user: {
            id: user.id,
            email: user.email,
            nickname: user.nickname,
        },
        accessToken,
    });
}));

router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email'],
}))

router.get(
    '/google/callback',
    passport.authenticate('google', {
        failureRedirect: `${CLIENT_URL}/login?error=auth_failed`,
        session: false,
    }),
    async (req, res) => {
        if (!req.user) {
            return res.redirect(`${CLIENT_URL}/login?error=no_user`);
        }

        const user = req.user as { id: string };

        const accessToken = jwt.sign(
            { id: user.id },
            process.env.JWT_SECRET!,
            { expiresIn: '15m' }
        );

        const refreshToken = jwt.sign(
            { id: user.id },
            process.env.JWT_REFRESH_SECRET!,
            { expiresIn: '7d' }
        );

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            path: '/auth/refresh',
            maxAge: 1000 * 60 * 60 * 24 * 7,
        });

        return res.redirect(`${CLIENT_URL}/auth/callback#token=${accessToken}`);
    }
);

router.post('/refresh', async (req, res) => {
    const token = req.cookies.refreshToken;
    if (!token) {
        return res.status(401).json({ error: 'No refresh token' });
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as { id: string };

        const newAccessToken = jwt.sign(
            { id: payload.id },
            process.env.JWT_SECRET!,
            { expiresIn: '15m' }
        );

        res.json({ accessToken: newAccessToken });

    } catch (err) {
        return res.status(401).json({ error: 'Invalid refresh token' });
    }
});


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

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    setRefreshCookie(res, refreshToken);

    res.json({
        message: 'Welcome back! Login successful.',
        user: {
            id: user.id,
            email: user.email,
            nickname: user.nickname,
        },
        accessToken,
    });
}));


router.get(
    '/me',
    requireAuth,
    handleRequest(async (req, res) => {
        const userId = req.user?.id;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, email: true, nickname: true, isAdmin: true, isBlocked: true },
        });

        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        if (user.isBlocked) {
            res.status(403).json({
                error: 'Your account is temporarily locked. Contact support for help.',
            });
            return;
        }

        res.json({ user });
    })
);


router.post('/logout', (req, res) => {
    res.clearCookie('refreshToken', {
        path: '/auth/refresh',
        httpOnly: true,
        secure: true,
        sameSite: 'none',
    });

    res.status(200).json({ message: 'Logged out' });
});

export default router
