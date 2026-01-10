import { Mic, MicOff, PhoneOff, Volume2, VolumeX } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { io } from 'socket.io-client'; // Import socket.io-client directly
import { COLORS } from '../constants/theme';
import { auth } from '../firebase-config';

interface VoiceCallScreenProps {
    onNavigate: (screen: string) => void;
    onCallEnd: () => void;
    matchedUser?: any;
}

export const VoiceCallScreen: React.FC<VoiceCallScreenProps> = ({ onNavigate, onCallEnd, matchedUser }) => {
    const [seconds, setSeconds] = useState(180); // 3 minutes
    const [isMuted, setIsMuted] = useState(false);
    const [isSpeakerOn, setIsSpeakerOn] = useState(true);

    const currentUserId = auth.currentUser?.uid || 'anon';
    const roomId = matchedUser ? [currentUserId, matchedUser.id || 'unknown'].sort().join('-') : 'test-room';

    useEffect(() => {
        // Connect to Socket.IO Server
        const socket = io('http://localhost:3000');

        socket.on('connect', () => {
            console.log("Connected to signaling server");
            socket.emit('join_room', roomId);

            // Initiate mock offer to start the chain (simulation)
            console.log("Emitting Mock Offer...");
            socket.emit('offer', { toRoom: roomId, signal: { type: 'offer', sdp: 'mock-sdp' } });
        });

        socket.on('user_joined', (userId) => {
            console.log("User joined room:", userId);
        });

        socket.on('offer', (signal) => {
            console.log("Received Offer:", signal);
            // In real WebRTC, you'd createAnswer here
            socket.emit('answer', { toRoom: roomId, signal: { type: 'answer', sdp: 'mock-answer' } });
        });

        socket.on('answer', (signal) => {
            console.log("Received Answer:", signal);
        });

        socket.on('ice-candidate', (candidate) => {
            console.log("Received ICE Candidate:", candidate);
        });

        return () => {
            socket.disconnect();
            console.log("Disconnected from signaling server");
        };
    }, [roomId]);

    useEffect(() => {
        const timer = setInterval(() => {
            setSeconds(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleEndCall();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const handleEndCall = () => {
        onCallEnd();
        onNavigate('chat');
    };

    const formatTime = (secs: number) => {
        const mins = Math.floor(secs / 60);
        const remainingSecs = secs % 60;
        return `${mins}:${remainingSecs.toString().padStart(2, '0')}`;
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.timer}>{formatTime(seconds)}</Text>
            </View>

            <View style={styles.profileContainer}>
                <View style={styles.avatarContainer}>
                    <Text style={styles.avatarText}>
                        {matchedUser?.email?.charAt(0).toUpperCase() || '?'}
                    </Text>
                </View>
                <Text style={styles.name}>
                    {matchedUser?.email?.split('@')[0] || 'Unknown User'}
                </Text>
                <Text style={styles.status}>Connected</Text>

                {matchedUser?.vibes && (
                    <View style={styles.vibesContainer}>
                        {matchedUser.vibes.map((vibe: string, index: number) => (
                            <View key={index} style={styles.vibeBadge}>
                                <Text style={styles.vibeText}>{vibe}</Text>
                            </View>
                        ))}
                    </View>
                )}
            </View>

            <View style={styles.controls}>
                <TouchableOpacity
                    style={[styles.controlButton, !isSpeakerOn && styles.controlButtonInactive]}
                    onPress={() => setIsSpeakerOn(!isSpeakerOn)}
                >
                    {isSpeakerOn ?
                        <Volume2 size={24} color="#fff" /> :
                        <VolumeX size={24} color="#fff" />
                    }
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.controlButton, isMuted && styles.controlButtonInactive]}
                    onPress={() => setIsMuted(!isMuted)}
                >
                    {isMuted ?
                        <MicOff size={24} color="#fff" /> :
                        <Mic size={24} color="#fff" />
                    }
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.endCallButton}
                    onPress={handleEndCall}
                >
                    <PhoneOff size={32} color="#fff" />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1a1a1a',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 60,
    },
    header: {
        alignItems: 'center',
    },
    timer: {
        fontSize: 32,
        fontWeight: '300',
        color: '#fff',
        letterSpacing: 2,
    },
    profileContainer: {
        alignItems: 'center',
        gap: 16,
    },
    avatarContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        borderWidth: 4,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    avatarText: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#fff',
    },
    name: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
    },
    status: {
        fontSize: 16,
        color: '#4ade80', // green-400
        fontWeight: '500',
    },
    vibesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        justifyContent: 'center',
        marginTop: 16,
        maxWidth: '80%',
    },
    vibeBadge: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    vibeText: {
        color: '#fff',
        fontSize: 14,
    },
    controls: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 32,
    },
    controlButton: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    controlButtonInactive: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        opacity: 0.5,
    },
    endCallButton: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: '#ef4444', // red-500
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#ef4444',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
});
