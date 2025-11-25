import { Server } from 'socket.io'
import type { Server as HTTPServer } from 'http'

let io: Server

export const initSocket = (server: HTTPServer) => {
    io = new Server(server, {
        cors: {
            origin: [
                'http://localhost:5173',
                'https://formify-app-chi.vercel.app',
            ],
            credentials: true,
        },
    })

    io.on('connection', socket => {

        socket.on('join-template', (templateId: string) => {
            const room = `template-${templateId}`
            socket.join(room)
        })
    })
}

export const getIO = () => {
    if (!io) throw new Error('Socket.io not initialized')
    return io
}

export const emitNewComment = (templateId: string, comment: any) => {
    const room = `template-${templateId}`
    getIO().to(room).emit('new-comment', comment)
}
