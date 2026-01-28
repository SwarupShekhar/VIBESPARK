import { io, Socket } from 'socket.io-client';

// Use the URL from environment variables
const SOCKET_URL = process.env.EXPO_PUBLIC_API_URL
  ? process.env.EXPO_PUBLIC_API_URL.replace('/api', '')
  : 'http://localhost:3000';

export const socket: Socket = io(SOCKET_URL, {
    autoConnect: false,
    transports: ['websocket'], // Recommended for React Native
});

export const connectSocket = () => {
    if (!socket.connected) {
        socket.connect();
    }
};

export const disconnectSocket = () => {
    if (socket.connected) {
        socket.disconnect();
    }
};

export const joinRoom = (roomId: string) => {
    socket.emit('join_room', roomId);
};
