import { Server as HttpServer } from "http";
import { Server } from "socket.io";
export declare function initSocketServer(server: HttpServer): Server<import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, any>;
export declare function getSocketInstance(): Server | null;
/**
 * Convenient utility to safely emit events to all connected clients
 */
export declare function broadcastEvent(eventName: string, data?: any): void;
