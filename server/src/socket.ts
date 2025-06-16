import { Server } from 'socket.io'

let io: Server

export const initSocket = (server: any) => {
    io = new Server(server, {
        cors: {
            origin: 'http://localhost:3000',
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
    })
}

export const getIO = () => {
    if (!io) throw new Error('Socket.io not initialized')
    return io
}
