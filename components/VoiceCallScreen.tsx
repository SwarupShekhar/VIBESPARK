import { ConnectionState, Room, RoomEvent } from 'livekit-client';
import { Mic, MicOff, PhoneOff, Volume2, VolumeX } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS } from '../constants/theme';
import { getLiveKitToken } from '../services/api';
import { liveKitService } from '../services/livekitService';

interface VoiceCallScreenProps {
    onNavigate: (screen: string) => void;
    onCallEnd: () => void;
    matchedUser?: any;
    currentUser: any;
}

export const VoiceCallScreen: React.FC<VoiceCallScreenProps> = ({ onNavigate, onCallEnd, matchedUser, currentUser }) => {
    const [seconds, setSeconds] = useState(180); // 3 minutes
    const [isMuted, setIsMuted] = useState(false);
    const [isSpeakerOn, setIsSpeakerOn] = useState(true);
    const [isConnected, setIsConnected] = useState(false);
    const [callStatus, setCallStatus] = useState('Connecting...');

    const currentUserId = currentUser?.id || 'anon';
    const roomId = matchedUser ? [currentUserId, matchedUser.id || 'unknown'].sort().join('-') : 'test-room';
    const roomRef = useRef<Room | null>(null);

    useEffect(() => {
        // Initialize LiveKit connection
        const initializeCall = async () => {
            try {
                setCallStatus('Setting up call...');
                
                // Get LiveKit token from backend
                const tokenResponse = await getLiveKitToken(roomId, currentUser?.name || 'Anonymous');
                const { token } = tokenResponse;

                // Connect to LiveKit room
                const room = await liveKitService.connectToRoom(
                    token,
                    process.env.EXPO_PUBLIC_LIVEKIT_URL || 'wss://ssengst-174tfe9o.livekit.cloud',
                    (participant) => {
                        console.log('Participant connected:', participant.identity);
                        setCallStatus('Connected');
                        setIsConnected(true);
                    },
                    (participant) => {
                        console.log('Participant disconnected:', participant.identity);
                        setCallStatus('Participant left');
                    },
                    (publication, participant) => {
                        console.log('Track subscribed:', publication.kind);
                    }
                );

                roomRef.current = room;

                // Create and publish local audio track
                const audioTrack = await liveKitService.createLocalAudioTrack();
                if (audioTrack) {
                    await liveKitService.publishAudioTrack();
                }

                // Set up room event listeners
                room.on(RoomEvent.ConnectionStateChanged, (state) => {
                    console.log('Connection state changed:', state);
                    setIsConnected(state === ConnectionState.Connected);
                    
                    if (state === ConnectionState.Disconnected) {
                        setCallStatus('Call ended');
                        handleEndCall();
                    }
                });

            } catch (error) {
                console.error('Error initializing LiveKit call:', error);
                setCallStatus('Connection failed');
                setIsConnected(false);
            }
        };

        initializeCall();

        // Timer for 3-minute call
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

        return () => {
            clearInterval(timer);
            // Cleanup LiveKit connection
            if (roomRef.current) {
                roomRef.current.disconnect();
            }
            liveKitService.disconnect();
        };
    }, [roomId]);

    const handleEndCall = async () => {
        try {
            // Disconnect from LiveKit room
            if (roomRef.current) {
                roomRef.current.disconnect();
            }
            await liveKitService.disconnect();
        } catch (error) {
            console.error('Error disconnecting from LiveKit:', error);
        } finally {
            onCallEnd();
            onNavigate('chat');
        }
    };

    const toggleMute = async () => {
        const newState = await liveKitService.toggleMute();
        setIsMuted(newState);
    };

    const formatTime = (secs: number) => {
        const mins = Math.floor(secs / 60);
        const remainingSecs = secs % 60;
        return `${mins}:${remainingSecs.toString().padStart(2, '0')}`;
    };

    // Handle cleanup on unmount
    useEffect(() => {
        return () => {
            if (roomRef.current) {
                roomRef.current.disconnect();
            }
        };
    }, []);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.timer}>{formatTime(seconds)}</Text>
                <Text style={styles.connectionStatus}>
                    {isConnected ? '🟢 Connected' : `🟡 ${callStatus}`}
                </Text>
            </View>

            <View style={styles.profileContainer}>
                <View style={styles.avatarContainer}>
                    <Text style={styles.avatarText}>
                        {matchedUser?.email?.charAt(0).toUpperCase() || matchedUser?.name?.charAt(0).toUpperCase() || '?'}
                    </Text>
                </View>
                <Text style={styles.name}>
                    {matchedUser?.name || matchedUser?.email?.split('@')[0] || 'Unknown User'}
                </Text>
                <Text style={styles.status}>{callStatus}</Text>

                {matchedUser?.vibes && Array.isArray(matchedUser.vibes) && (
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
                    {/* @ts-ignore */}
                    {isSpeakerOn ? <Volume2 size={24} color="#fff" /> : <VolumeX size={24} color="#fff" />}
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.controlButton, isMuted && styles.controlButtonInactive]}
                    onPress={toggleMute}
                >
                    {/* @ts-ignore */}
                    {isMuted ? <MicOff size={24} color="#fff" /> : <Mic size={24} color="#fff" />}
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.endCallButton}
                    onPress={handleEndCall}
                >
                    {/* @ts-ignore */}
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
    connectionStatus: {
        fontSize: 14,
        color: '#888',
        marginTop: 8,
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
        color: '#4ade80',
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
        backgroundColor: '#ef4444',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#ef4444',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
});