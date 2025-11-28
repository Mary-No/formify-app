import jwt from 'jsonwebtoken';

const ACCESS_EXPIRES = '15m';
const REFRESH_EXPIRES = '7d';

export function generateAccessToken(id: string) {
    return jwt.sign(
        { id },
        process.env.JWT_SECRET!,
        { expiresIn: ACCESS_EXPIRES }
    );
}

export function generateRefreshToken(id: string) {
    return jwt.sign(
        { id },
        process.env.JWT_REFRESH_SECRET!,
        { expiresIn: REFRESH_EXPIRES }
    );
}
