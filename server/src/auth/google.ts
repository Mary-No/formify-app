import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import { prisma } from '../prisma'


passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: 'https://formify-app.onrender.com/auth/google/callback',
}, async (accessToken, refreshToken, profile, done) => {
    try {
        const email = profile.emails?.[0]?.value
        if (!email) return done(null, false)

        let user = await prisma.user.findUnique({ where: { email } })

        if (!user) {
            user = await prisma.user.create({
                data: {
                    email,
                    nickname: profile.displayName,
                    password: '',
                },
            })
        }

        return done(null, user)
    } catch (error) {
        console.error('Google auth error:', error);
        return done(error);
    }
}))

passport.serializeUser((user: any, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id },
            select: { id: true, email: true, nickname: true, isAdmin: true, isBlocked: true }
        });
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});
