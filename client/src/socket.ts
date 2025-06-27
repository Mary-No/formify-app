import { io, Socket } from 'socket.io-client'

const URL = 'https://formify-app.onrender.com/'
export const socket: Socket = io(URL, {
    withCredentials: true,
    autoConnect: false,
})
