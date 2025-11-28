import { Response } from 'express';

export function setRefreshCookie(res: Response, token: string) {
    res.cookie('refreshToken', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        path: '/auth/refresh',
        maxAge: 1000 * 60 * 60 * 24 * 7,
    });
}