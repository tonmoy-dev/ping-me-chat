import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import dotenv from "dotenv"


// room events
const JOIN_ROOM = 'joinChatRoom';
const CHAT_MESSAGE = 'chatMessage';
const TYPING = 'userTyping';
const STOP_TYPING = 'userStopTyping';
const ROOM_NEWS = 'chatRoomNews';
const USER_LEAVE = 'userLeaveChatRoom';
const ROOM = 'pingMeChatRoom';

dotenv.config();

// initialize the app
const app = express();

// create the server
const server = createServer(app);

const PORT = process.env.PORT || 5000;

// create the socket server instance
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL
  }
});

// start socket io connection
io.on('connection', (socket) => {
  console.log(`User ${socket.id} connected`);

  // user join to socket room
  socket.on(JOIN_ROOM, async (userName) => {
    console.log(`${userName} is joined to the chat.`)

    // join to room
    await socket.join(ROOM);

    // broadcast to room
    socket.to(ROOM).emit(ROOM_NEWS, userName)
  })

  // user sends message
  socket.on(CHAT_MESSAGE, (message) => {
    socket.to(ROOM).emit(CHAT_MESSAGE, message);
  })

  // user typing 
  socket.on(TYPING, (UserName) => {
    socket.to(ROOM).emit(TYPING, UserName)
  })

  // user stop typing
  socket.on(STOP_TYPING, (userName) => {
    socket.to(ROOM).emit(STOP_TYPING, userName)
  })

  // user leave room
  socket.on(USER_LEAVE, (userName) => {
    socket.to(ROOM).emit(USER_LEAVE, userName)
  })

  // disconnect from socket io
  socket.on('disconnect', (reason) => {
    console.log(`User disconnect from the server for ${reason}`);
  })
})


app.get('/', (req, res) => {
  res.send('Hello! PING ME.')
})


server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`)
})