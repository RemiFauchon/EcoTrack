import { io, Socket } from 'socket.io-client';
import { Capacitor } from '@capacitor/core';

const WS_URL = Capacitor.isNativePlatform()
  ? 'https://ecotrack.lorisdev.fr'
  : (import.meta.env.VITE_WS_URL ?? 'http://localhost:3000');

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(WS_URL, { transports: ['websocket'], autoConnect: true });
  }
  return socket;
}
