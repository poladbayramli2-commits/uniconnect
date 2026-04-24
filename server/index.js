import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import net from 'net';

import usersRouter from './routes/users.js';
import friendsRouter from './routes/friends.js';
import messagesRouter from './routes/messages.js';
import lettersRouter from './routes/letters.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

// REQUEST LOGGING
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// ROUTES
app.use('/api/users', usersRouter);
app.use('/api/friends', friendsRouter);
app.use('/api/messages', messagesRouter);
app.use('/api/letters', lettersRouter);

// HEALTH CHECK
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// SOCKET.IO - Real-time chat
io.on('connection', (socket) => {
  console.log('İstifadəçi qoşuldu:', socket.id);

  socket.on('join_chat', (chatId) => {
    socket.join(chatId);
    console.log(`Socket ${socket.id} joined chat: ${chatId}`);
  });

  socket.on('send_message', (data) => {
    io.to(data.chatId).emit('new_message', data);
  });

  socket.on('disconnect', () => {
    console.log('İstifadəçi ayrıldı:', socket.id);
  });
});

// MONGOOSE CONNECTION
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/uniconnect';

function isPortFree(port) {
  return new Promise((resolve) => {
    const tester = net
      .createServer()
      .once('error', () => resolve(false))
      .once('listening', () => tester.close(() => resolve(true)))
      .listen(port);
  });
}

async function pickPort(startPort) {
  let port = Number(startPort) || 3001;
  for (let i = 0; i < 25; i += 1) {
    const free = await isPortFree(port);
    if (free) return port;
    port += 1;
  }
  return Number(startPort) || 3001;
}

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Atlas bağlantısı uğurlu!');
    
    const desired = process.env.PORT || 3001;
    pickPort(desired).then((PORT) => {
      httpServer.listen(PORT, () => {
        console.log(`🚀 Server ${PORT} portunda aktivdir`);
      });
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB bağlantısı xətası:', err.message);
    process.exit(1);
  });

export { io };
