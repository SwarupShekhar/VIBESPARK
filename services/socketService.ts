import { io, Socket } from 'socket.io-client';

// Use the URL provided by the user
const SOCKET_URL = 'https://your-vibespark-backend.onrender.com';

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
