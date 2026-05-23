import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';

let io: SocketIOServer | null = null;

export const initializeSocket = (httpServer: HTTPServer): SocketIOServer => {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  io.on('connection', (socket: Socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    socket.on('join-assignment', (assignmentId: string) => {
      socket.join(`assignment-${assignmentId}`);
      console.log(`📋 Client ${socket.id} joined room: assignment-${assignmentId}`);
    });

    socket.on('leave-assignment', (assignmentId: string) => {
      socket.leave(`assignment-${assignmentId}`);
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = (): SocketIOServer => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

export const emitToAssignment = (
  assignmentId: string,
  event: string,
  data: any
): void => {
  if (io) {
    io.to(`assignment-${assignmentId}`).emit(event, data);
  }
};

export const emitProgress = (
  assignmentId: string,
  progress: number,
  message: string,
  status: 'processing' | 'completed' | 'failed' = 'processing'
): void => {
  emitToAssignment(assignmentId, 'generation-progress', {
    assignmentId,
    progress,
    message,
    status,
    timestamp: new Date().toISOString(),
  });
};
