import { io } from 'socket.io-client';

const PORT = 3001;
const DevServerURL = `http://localhost:${PORT}`;
const ProdServerURL = ''

export function connectWS() {
  return io(DevServerURL)
}