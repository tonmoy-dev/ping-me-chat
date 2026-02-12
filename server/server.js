import express from "express";
import { createServer } from "node:http";

const PORT = 3001;

// initialize the app
const app = express();

// create the server instance
const server = createServer(app);


app.get('/', (req, res) => {
  res.send('Hello! PING ME.')
})


server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`)
})