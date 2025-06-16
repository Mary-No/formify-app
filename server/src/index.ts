import express from 'express'
import cors from 'cors'
import session from 'express-session'
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

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
}))
app.use(express.json())

app.use(session({
    secret: process.env.SESSION_SECRET || 'supersecret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7,
    }
}))

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