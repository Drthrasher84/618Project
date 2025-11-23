// frontend/src/socket.js
import { io } from 'socket.io-client'

const SOCKET_URL =
  import.meta.env.VITE_BACKEND_SOCKET_URL || 'http://localhost:3000' // fallback for real local dev

export const socket = io(SOCKET_URL, {
  autoConnect: true,
  transports: ['websocket'], // required in Codespaces
})
