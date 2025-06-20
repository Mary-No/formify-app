import express from 'express'
import cors from 'cors'
import session from 'express-session'
import passport from 'passport'
import helmet from 'helmet'
import './auth/google'
import authRoutes from './routes/auth'
import formsRoutes from './routes/forms'
import templatesRoutes from './routes/templates'
import adminRoutes from './routes/admin'
import { config } from 'dotenv'
import { initSocket } from './socket'
import http from 'http'


config()

const app = express()
const PORT = 4000
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", 'https://fonts.googleapis.com', "'unsafe-inline'"],
            fontSrc: ["'self'", 'https://fonts.gstatic.com'],
            scriptSrc: ["'self'", 'https://accounts.google.com', "'unsafe-inline'"],
            connectSrc: ["'self'", 'https://accounts.google.com'],
            imgSrc: ["'self'", 'data:', 'https://*.googleusercontent.com'],
            frameSrc: ["'self'", 'https://accounts.google.com'],
        },
    },
}))

app.use(cors({
    origin: [
        'http://localhost:5173',
        'https://mary-no.github.io',
    ],
    credentials: true,
}))
app.use(express.json())

app.use(session({
    secret: process.env.SESSION_SECRET || 'supersecret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: true,
        sameSite: 'none',
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7,
    }
}))

app.use(passport.initialize())
app.use(passport.session())

app.use('/auth', authRoutes)
app.use('/forms', formsRoutes)
app.use('/templates', templatesRoutes)
app.use('/admin', adminRoutes)


app.get('/', (_, res) => {
    res.send('Formify API is running')
})

const server = http.createServer(app)
initSocket(server)

server.listen(PORT, () => {
    console.log(`🚀 Server is running at http://localhost:${PORT}`)
})