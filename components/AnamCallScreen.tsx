import AsyncStorage from '@react-native-async-storage/async-storage';
import { ConnectionState, Room, RoomEvent } from 'livekit-client';
import { Mic, MicOff, PhoneOff, X } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { COLORS } from '../constants/theme';
import { getAnamSessionToken } from '../services/api';
import { liveKitService } from '../services/livekitService';

interface AnamCallScreenProps {
    onNavigate: (screen: string) => void;
}

export const AnamCallScreen: React.FC<AnamCallScreenProps> = ({ onNavigate }) => {
    const [recording, setRecording] = useState(false);
    const [status, setStatus] = useState<'idle' | 'recording' | 'processing' | 'calling'>('idle');
    const [transcript, setTranscript] = useState('');
    const [aiReply, setAiReply] = useState('');
    const [isMuted, setIsMuted] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [callStatus, setCallStatus] = useState('Connecting to AI...');
    const [remoteStream, setRemoteStream] = useState<any>(null);
    const [isLoadingAvatar, setIsLoadingAvatar] = useState(true);

    // Animation shared value for pulsing effect
    const pulse = useSharedValue(1);
    
    const roomRef = useRef<Room | null>(null);
    const audioTrackRef = useRef<any>(null);

    const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

    // Start pulse animation when recording
    useEffect(() => {
        if (status === 'recording') {
            pulse.value = withRepeat(withTiming(1.5, { duration: 1000 }), -1, true);
        } else {
            pulse.value = withTiming(1);
        }
    }, [status]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: pulse.value }],
    }));

    useEffect(() => {
        // Initialize Anam call
        const initializeCall = async () => {
            try {
                setCallStatus('Initializing AI connection...');
                
                // Get LiveKit token for Anam AI room
                const tokenResponse = await getAnamSessionToken('VIBE-buddy');
                const { sessionToken, avatarId } = tokenResponse;

                // Connect to LiveKit room with Anam AI
                const room = await liveKitService.connectToRoom(
                    sessionToken,
                    process.env.EXPO_PUBLIC_LIVEKIT_URL || 'wss://ssengst-174tfe9o.livekit.cloud',
                    (participant) => {
                        console.log('Anam AI connected:', participant.identity);
                        setCallStatus('AI Connected - Ready to chat');
                        setIsConnected(true);
                    },
                    (participant) => {
                        console.log('Anam AI disconnected:', participant.identity);
                        setCallStatus('AI disconnected');
                        setIsConnected(false);
                    },
                    (publication, participant) => {
                        console.log('AI track subscribed:', publication.kind);
                    }
                );

                roomRef.current = room;

                // Set up room event listeners
                room.on(RoomEvent.ConnectionStateChanged, (state) => {
                    console.log('Connection state changed:', state);
                    setIsConnected(state === ConnectionState.Connected);
                    
                    if (state === ConnectionState.Disconnected) {
                        setCallStatus('Call ended');
                        handleEndCall();
                    }
                });

                // Handle remote participant and track subscription
                room.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
                    console.log('Track subscribed:', publication.kind, 'from', participant.identity);
                    
                    if (publication.kind === 'video') {
                        // Video track from Anam AI is now available
                        console.log('Anam video track subscribed');
                        setIsLoadingAvatar(false);
                    } else if (publication.kind === 'audio') {
                        // Audio track is handled by LiveKit automatically
                        console.log('Anam audio track subscribed');
                    }
                });

                room.on(RoomEvent.TrackUnsubscribed, (track, publication, participant) => {
                    console.log('Track unsubscribed:', publication.kind);
                    if (publication.kind === 'video') {
                        setRemoteStream(null);
                        setIsLoadingAvatar(true);
                    }
                });

                // Create and publish local audio track
                const audioTrack = await liveKitService.createLocalAudioTrack();
                if (audioTrack) {
                    audioTrackRef.current = audioTrack;
                    await liveKitService.publishAudioTrack();
                }

            } catch (error) {
                console.error('Error initializing Anam call:', error);
                setCallStatus('Failed to connect to AI');
                setIsConnected(false);
            }
        };

        initializeCall();

        return () => {
            // Cleanup
            if (roomRef.current) {
                roomRef.current.disconnect();
            }
            liveKitService.disconnect();
        };
    }, []);

    const startRecording = async () => {
        setRecording(true);
        setStatus('recording');
    };

    const stopRecording = async () => {
        setRecording(false);
        setStatus('processing');
        
        try {
            // In a real implementation, we would:
            // 1. Stop the recording and get the audio data
            // 2. Send it to the backend AI endpoint for processing
            // 3. Receive the AI response and update the UI
            
            // For now, we'll simulate sending the recorded audio to backend
            // and getting back the AI response
            console.log("Sending audio to AI for processing...");
            
            // In a real implementation, we would capture the recorded audio and send it
            // For now, we'll call the existing API service to simulate the AI response
            try {
                // This would eventually send the recorded audio to the backend
                // For simulation, we'll use the API service
                const aiResponse = await fetch(`${API_URL}/ai/chat`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${await AsyncStorage.getItem('authToken')}`,
                    },
                    body: JSON.stringify({
                        text: "Hello, how are you doing today?", // This would be the transcribed audio
                        avatarId: 'default'
                    })
                });
                
                if (aiResponse.ok) {
                    const data = await aiResponse.json();
                    setTranscript(data.transcript || "Hello, how are you doing today?");
                    setAiReply(data.reply || "Hi there! I'm doing great, thanks for asking. How can I help you today?");
                } else {
                    // Fallback response if API call fails
                    setTranscript("Hello, how are you doing today?");
                    setAiReply("Hi there! I'm doing great, thanks for asking. How can I help you today?");
                }
            } catch (apiError) {
                console.error('API call failed:', apiError);
                // Fallback on error
                setTranscript("Hello, how are you doing today?");
                setAiReply("Hi there! I'm doing great, thanks for asking. How can I help you today?");
            }
            
            setStatus('calling');
        } catch (error) {
            console.error("Error processing audio:", error);
            // Fallback on error
            setTranscript("Hello, how are you doing today?");
            setAiReply("Hi there! I'm doing great, thanks for asking. How can I help you today?");
            setStatus('calling');
        }
    };

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
            onNavigate('home');
        }
    };

    const toggleMute = async () => {
        if (audioTrackRef.current) {
            const newState = await liveKitService.toggleMute();
            setIsMuted(newState);
        }
    };

    return (
        <View style={styles.container}>
            {/* Header / X Button */}
            <TouchableOpacity style={styles.closeButton} onPress={() => onNavigate('home')}>
                {/* @ts-ignore */}
                <X size={32} color={COLORS.foreground} />
            </TouchableOpacity>

            <Text style={styles.title}>VIBE-buddy</Text>
            <Text style={styles.subtitle}>AI Conversation Partner</Text>

            {/* Main Content Area */}
            <View style={styles.contentArea}>
                {status === 'processing' && (
                    <View style={styles.centered}>
                        <ActivityIndicator size="large" color={COLORS.primary} />
                        <Text style={styles.statusText}>Thinking...</Text>
                    </View>
                )}

                {status === 'calling' && isConnected && (
                    <View style={styles.callContainer}>
                        {/* Anam AI Video Display */}
                        <View style={styles.avatarContainer}>
                            <View style={styles.avatarPlaceholder}>
                                {isLoadingAvatar ? (
                                    <View style={styles.loadingContainer}>
                                        <ActivityIndicator size="large" color={COLORS.primary} />
                                        <Text style={styles.loadingText}>Loading VIBE-buddy...</Text>
                                    </View>
                                ) : (
                                    <View style={styles.videoContainer}>
                                        {/* This is where the Anam video stream will be rendered */}
                                        {/* When LiveKit receives the video track from Anam, it will appear here */}
                                        <View style={styles.avatarVideo}>
                                            <Text style={{ color: 'white', textAlign: 'center', fontSize: 16, fontWeight: 'bold' }}>VIBE-buddy</Text>
                                            <Text style={{ color: 'white', textAlign: 'center', fontSize: 12 }}>Live Video</Text>
                                        </View>
                                    </View>
                                )}
                            </View>
                            <Text style={styles.aiName}>VIBE-buddy</Text>
                        </View>

                        {/* Conversation Display */}
                        <View style={styles.conversationContainer}>
                            <View style={styles.messageBubbleUser}>
                                <Text style={styles.messageText}>"{transcript}"</Text>
                                <Text style={styles.messageSender}>You</Text>
                            </View>
                            
                            <View style={styles.messageBubbleAI}>
                                <Text style={styles.messageText}>{aiReply}</Text>
                                <Text style={styles.messageSender}>VIBE-buddy</Text>
                            </View>
                        </View>
                    </View>
                )}

                {/* Idle / Connecting State */}
                {(status === 'idle' || status === 'processing') && (
                    <View style={styles.centered}>
                        <View style={styles.placeholderAvatar}>
                            <Text style={{ fontSize: 60 }}>🤖</Text>
                        </View>
                        {status === 'idle' && (
                            <Text style={styles.instructionText}>Connecting to AI...</Text>
                        )}
                        {status === 'processing' && (
                            <Text style={styles.instructionText}>{callStatus}</Text>
                        )}
                    </View>
                )}
            </View>

            {/* Controls */}
            <View style={styles.controls}>
                {status === 'calling' ? (
                    <>
                        <TouchableOpacity
                            style={[styles.controlButton, isMuted && styles.controlButtonInactive]}
                            onPress={toggleMute}
                        >
                            {/* @ts-ignore */}
                            {isMuted ? <MicOff size={24} color="#fff" /> : <Mic size={24} color="#fff" />}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.recordButton, animatedStyle]}
                            onPressIn={startRecording}
                            onPressOut={stopRecording}
                        >
                            {/* @ts-ignore */}
                            <Mic size={40} color="#fff" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.endCallButton}
                            onPress={handleEndCall}
                        >
                            {/* @ts-ignore */}
                            <PhoneOff size={32} color="#fff" />
                        </TouchableOpacity>
                    </>
                ) : status === 'processing' ? (
                    <ActivityIndicator size="large" color={COLORS.primary} />
                ) : (
                    <TouchableOpacity
                        style={styles.endCallButton}
                        onPress={handleEndCall}
                    >
                        {/* @ts-ignore */}
                        <X size={32} color="#fff" />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        paddingTop: 60,
    },
    closeButton: {
        position: 'absolute',
        top: 50,
        right: 20,
        zIndex: 10,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.foreground,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.mutedForeground,
        textAlign: 'center',
        marginBottom: 20,
    },
    contentArea: {
        flex: 1,
        justifyContent: 'center',
    },
    centered: {
        alignItems: 'center',
        justifyContent: 'center',
        gap: 20,
    },
    placeholderAvatar: {
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: COLORS.card,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: COLORS.border,
    },
    callContainer: {
        flex: 1,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    avatarContainer: {
        alignItems: 'center',
        marginBottom: 30,
    },
    avatarPlaceholder: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
        overflow: 'hidden', // Ensure the video fits properly within the rounded container
    },
    videoContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        overflow: 'hidden',
    },
    avatarEmoji: {
        fontSize: 60,
    },
    avatarVideo: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: COLORS.primary,
    },
    loadingContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    loadingText: {
        color: '#fff',
        fontSize: 12,
        marginTop: 5,
    },
    aiName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.foreground,
    },
    conversationContainer: {
        width: '100%',
        gap: 20,
    },
    messageBubbleUser: {
        alignSelf: 'flex-end',
        backgroundColor: COLORS.primary,
        padding: 15,
        borderRadius: 20,
        borderBottomRightRadius: 5,
        maxWidth: '80%',
    },
    messageBubbleAI: {
        alignSelf: 'flex-start',
        backgroundColor: COLORS.card,
        padding: 15,
        borderRadius: 20,
        borderBottomLeftRadius: 5,
        maxWidth: '80%',
    },
    messageText: {
        color: COLORS.foreground,
        fontSize: 16,
        marginBottom: 5,
    },
    messageSender: {
        fontSize: 12,
        color: COLORS.mutedForeground,
        fontWeight: 'bold',
    },
    statusText: {
        color: COLORS.foreground,
        marginTop: 10,
        fontSize: 18,
    },
    instructionText: {
        color: COLORS.mutedForeground,
        fontSize: 16,
    },
    controls: {
        height: 150,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 20,
    },
    controlButton: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    controlButtonInactive: {
        backgroundColor: 'rgba(255,255,255,0.3)',
    },
    recordButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 10,
    },
    endCallButton: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#ef4444',
        alignItems: 'center',
        justifyContent: 'center',
    },
});