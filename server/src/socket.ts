import { Server } from 'socket.io'
import type { Server as HTTPServer } from 'http'

let io: Server

export const initSocket = (server: HTTPServer) => {
    io = new Server(server, {
        cors: {
            origin: [
                'http://localhost:5173',
                'https://mary-no.github.io',
            ],
            credentials: true,
        },
    })

    io.on('connection', socket => {
        console.log('Socket connected:', socket.id)

        socket.on('join-template', (templateId: string) => {
            const room = `template-${templateId}`
            socket.join(room)
            console.log(`User ${socket.id} joined room ${room}`)
        })

        socket.on('disconnect', () => {
            console.log('Socket disconnected:', socket.id)
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
