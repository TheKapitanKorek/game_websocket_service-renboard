import { WebSocket } from "ws"

export interface Message {
  type: 'move' | 'join' | 'leave';
  params: {
    roomId: string;
    senderId: string;
    content: string;
  }
}

export interface Guest {
  ws: WebSocket;
  id: string;
  color: 'w' | 'b';
}

export interface Room {
  roomId: string;
  guests: Guest[],
  w?: string,
  b?: string
}

