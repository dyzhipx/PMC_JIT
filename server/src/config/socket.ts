import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import { env } from "./env.js";

let io: Server | null = null;

export function initSocketServer(server: HttpServer) {
  const origins = env.CORS_ORIGIN.includes(",") ? env.CORS_ORIGIN.split(",") : env.CORS_ORIGIN;
  
  io = new Server(server, {
    cors: {
      origin: origins,
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true,
    },
  });

  io.on("connection", (socket: Socket) => {
    console.log(`📡 Socket connected: ${socket.id}`);

    socket.on("disconnect", () => {
      console.log(`📡 Socket disconnected: ${socket.id}`);
    });
  });

  return io;
}

export function getSocketInstance(): Server | null {
  return io;
}

/**
 * Convenient utility to safely emit events to all connected clients
 */
export function broadcastEvent(eventName: string, data?: any) {
  if (io) {
    io.emit(eventName, data);
  } else {
    console.warn(`[Socket.io] Cannot emit '${eventName}', server not initialized.`);
  }
}
