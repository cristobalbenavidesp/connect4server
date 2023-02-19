import { Server } from "socket.io";
export type User = {
    id: string
    username: string
}

export type Game = {
    id: string
    player1 : string
    player2: string
    turn: string
}

export type Invitation = {
    id: string,
    senderId: string,
    senderUsername: string,
    recieverId: string,
    recieverUsername: string
}

interface ServerToClientEvents {
    noArg: () => void;
    basicEmit: (a: number, b: string, c: Buffer) => void;
    withAck: (d: string, callback: (e: number) => void) => void;
  }
  
  interface ClientToServerEvents {
    hello: () => void;
  }
  
  interface InterServerEvents {
    ping: () => void;
  }
  
  interface SocketData {
    name: string;
    age: number;
  }

  export type Io = Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
  >