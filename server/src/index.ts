import express from 'express'
import cors from 'cors'
import passport from 'passport'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import { config } from 'dotenv'
import http from 'http'
import './auth/google'
import { initSocket } from './socket'
import authRoutes from './routes/auth'
import formsRoutes from './routes/forms'
import templatesRoutes from './routes/templates'
import adminRoutes from './routes/admin'
import companyRoutes from './routes/company'

config()

const app = express()
app.set('trust proxy', 1)
const PORT = 4000

app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", 'https://fonts.googleapis.com', "'unsafe-inline'"],
            fontSrc: ["'self'", 'https://fonts.gstatic.com'],
            scriptSrc: ["'self'", 'https://accounts.google.com', "'unsafe-inline'"],
            connectSrc: [
                "'self'",
                'https://formify-app.onrender.com',
                'wss://formify-app.onrender.com',
                'https://accounts.google.com',
            ],
            imgSrc: ["'self'", 'data:', 'https://*.googleusercontent.com'],
            frameSrc: ["'self'", 'https://accounts.google.com'],
        },
    },
}))

app.use((req, res, next) => {
    if (req.path.includes('/auth/google/callback')) {
        res.setHeader(
            'Content-Security-Policy',
            "script-src 'self' 'unsafe-inline' https://accounts.google.com; default-src 'self'"
        );
    }
    next();
});

app.use(cors({
    origin: [
        'http://localhost:5173',
        'https://formify-app-chi.vercel.app',
    ],
    credentials: true,
}))
app.use(express.json())
app.use(cookieParser() as express.RequestHandler);
app.use(passport.initialize())

app.use('/auth', authRoutes)
app.use('/forms', formsRoutes)
app.use('/templates', templatesRoutes)
app.use('/admin', adminRoutes)
app.use('/company', companyRoutes)

app.get('/', (_, res) => {
    res.send('Formify API is running')
})

const server = http.createServer(app)
initSocket(server)

server.listen(PORT, () => {
    console.log(`🚀 Server is running at http://localhost:${PORT}`)
})
