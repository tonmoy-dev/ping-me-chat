import { io } from 'socket.io-client';

const PORT = 3001;

export function connectWS() {
  return io(`http://localhost:${PORT}`)
}