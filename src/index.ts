import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import { manageInvites } from "./room/index";
import type { Io } from "./types"
import * as dotenv from 'dotenv'

dotenv.config()
const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 3000
app.use(cors());

const io: Io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  manageInvites(socket, io);
});

server.listen(port, () => {
  console.log("listening on *:", port);
});
