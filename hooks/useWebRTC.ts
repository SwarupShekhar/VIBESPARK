import { useEffect, useRef, useState } from 'react';
import { RTCIceCandidate, RTCPeerConnection, RTCSessionDescription } from 'react-native-webrtc'; // Ensure react-native-webrtc is installed
import { socket } from '../services/socketService';

const configuration = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' }
    ]
};

export const useWebRTC = (roomId: string, currentUserId: string) => {
    const [localStream, setLocalStream] = useState<any>(null);
    const [remoteStream, setRemoteStream] = useState<any>(null);
    const peerConnection = useRef<RTCPeerConnection | null>(null);

    useEffect(() => {
        // Initialize PeerConnection
        peerConnection.current = new RTCPeerConnection(configuration);

        // ICE Candidate Handler
        (peerConnection.current as any).onicecandidate = ({ candidate }: any) => {
            if (candidate) {
                socket.emit('ice-candidate', { candidate, toRoom: roomId });
            }
        };

        // Track Handler (for remote stream)
        (peerConnection.current as any).ontrack = (event: any) => {
            if (event.streams && event.streams[0]) {
                setRemoteStream(event.streams[0]);
            }
        };

        // Socket Event Listeners
        socket.on('offer', async (signal: any, callerId: string) => {
            if (!peerConnection.current) return;
            // Prevent handling own offer if broadcasted back (optional check)
            if (callerId === currentUserId) return;

            try {
                await peerConnection.current.setRemoteDescription(new RTCSessionDescription(signal));
                const answer = await peerConnection.current.createAnswer();
                await peerConnection.current.setLocalDescription(answer);
                socket.emit('answer', { signal: answer, toRoom: roomId });
            } catch (error) {
                console.error("Error handling offer:", error);
            }
        });

        socket.on('answer', async (signal: any) => {
            if (!peerConnection.current) return;
            try {
                await peerConnection.current.setRemoteDescription(new RTCSessionDescription(signal));
            } catch (error) {
                console.error("Error handling answer:", error);
            }
        });

        socket.on('ice-candidate', async (candidate: any) => {
            if (!peerConnection.current) return;
            try {
                await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
            } catch (error) {
                console.error("Error adding received ice candidate:", error);
            }
        });

        socket.on('user_joined', (userId: string) => {
            console.log(`User ${userId} joined the room.`);
            // Automatically create offer if we are the "initiator" or just based on logic
            // For simplicity, you might trigger this manually or based on sort order
        });

        // Join the room
        if (roomId) {
            socket.emit('join_room', roomId);
        }

        return () => {
            socket.off('offer');
            socket.off('answer');
            socket.off('ice-candidate');
            socket.off('user_joined');
            peerConnection.current?.close();
        };
    }, [roomId, currentUserId]);

    const createOffer = async () => {
        if (!peerConnection.current) return;
        try {
            const offer = await peerConnection.current.createOffer();
            await peerConnection.current.setLocalDescription(offer);
            socket.emit('offer', { signal: offer, toRoom: roomId });
        } catch (error) {
            console.error("Error creating offer:", error);
        }
    };

    return {
        localStream,
        remoteStream,
        createOffer,
    };
};
