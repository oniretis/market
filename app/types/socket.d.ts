import { Server as ServerIO } from 'socket.io';

declare global {
  var io: ServerIO | undefined;
}

export {};
