import express from 'express'
import "dotenv/config"
import cors from 'cors'
import http from "http"
import { connectDB } from './lib/db.js';
import userRouter from './routes/userRoutes.js';
import messageRouter from './routes/messageRoutes.js';
import { Server } from 'socket.io';
import jwt from "jsonwebtoken";

// Create Express app and HTTP server
const app = express();
const server = http.createServer(app);

// Initialize socket.io server
export const io = new Server(server, {
    cors: {origin: "*"}
})

io.use((socket, next) => {
    try {
        const token = socket.handshake.auth?.token;
        if (!token) {
            return next(new Error("Authentication required"));
        }

        const { userId } = jwt.verify(token, process.env.JWT_SECRET);
        if (!userId) {
            return next(new Error("Invalid authentication token"));
        }

        socket.data.userId = String(userId);
        next();
    } catch {
        next(new Error("Invalid authentication token"));
    }
});

// Store online users
export const userSocketMap = new Map();

// Socket.io connection handler
io.on("connection", (socket)=>{
    const userId = socket.data.userId;
    console.log("User Connected", userId)

    socket.join(userId);
    const userSockets = userSocketMap.get(userId) ?? new Set();
    userSockets.add(socket.id);
    userSocketMap.set(userId, userSockets);
    
    // Emit online users to all connected clients
    io.emit("getOnlineUsers", [...userSocketMap.keys()]);

    socket.on("disconnect", ()=>{
        console.log("User Disconnected", userId);
        const sockets = userSocketMap.get(userId);
        sockets?.delete(socket.id);
        if (sockets?.size === 0) userSocketMap.delete(userId);
        io.emit("getOnlineUsers", [...userSocketMap.keys()]);
    })
})

// Middleware setup
app.use(express.json({limit: "4mb"}));
app.use(cors());

// Routes setup
app.use('/api/status', (req, res)=>res.send("Server is live"));
app.use('/api/auth', userRouter);
app.use('/api/messages', messageRouter)

// Connect to MongoDB
await connectDB();

if(process.env.NODE_ENV !== "production"){
    const PORT = process.env.PORT || 5000
    server.listen(PORT, ()=>console.log(`Server is running on PORT: ${PORT}`));
}

// Export server for vercel deployment
export default server;