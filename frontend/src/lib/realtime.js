'use client';

import { io } from 'socket.io-client';
import { SOCKET_BASE } from './api';

let socket;

export function getRealtimeSocket() {
  if (!socket) {
    socket = io(SOCKET_BASE, {
      withCredentials: true,
      autoConnect: false,
      transports: ['websocket', 'polling'],
    });
  }
  if (!socket.connected) socket.connect();
  return socket;
}
