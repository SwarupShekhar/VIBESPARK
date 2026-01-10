import axios from 'axios';
import { Audio, InterruptionModeAndroid, InterruptionModeIOS, ResizeMode, Video } from 'expo-av';
import { Mic, Square, X } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { COLORS } from '../constants/theme';

interface AnamChatScreenProps {
    onNavigate: (screen: string) => void;
}

export const AnamChatScreen: React.FC<AnamChatScreenProps> = ({ onNavigate }) => {
    const [recording, setRecording] = useState<Audio.Recording | null>(null);
    const [permissionResponse, requestPermission] = Audio.usePermissions();
    const [status, setStatus] = useState<'idle' | 'recording' | 'processing' | 'playing'>('idle');
    const [transcript, setTranscript] = useState('');
    const [aiReply, setAiReply] = useState('');
    const [videoUrl, setVideoUrl] = useState<string | null>(null);

    // Animation shared value for pulsing effect
    const pulse = useSharedValue(1);

    const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';
    const CHAT_ENDPOINT = `${API_URL}/ai/chat`;

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

    async function startRecording() {
        try {
            // Clean up any existing recording first
            if (recording) {
                console.log('Cleaning up previous recording...');
                await recording.stopAndUnloadAsync();
                setRecording(null);
            }

            if (permissionResponse?.status !== 'granted') {
                console.log('Requesting permission..');
                await requestPermission();
            }

            // CRITICAL: Properly configure audio mode for iOS recording
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
                staysActiveInBackground: false,
                interruptionModeIOS: InterruptionModeIOS.DoNotMix,
                shouldDuckAndroid: true,
                interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
                playThroughEarpieceAndroid: false,
            });

            // Explicit recording options for better compatibility
            const recordingOptions: any = {
                android: {
                    extension: '.m4a',
                    outputFormat: Audio.AndroidOutputFormat.MPEG_4,
                    audioEncoder: Audio.AndroidAudioEncoder.AAC,
                    sampleRate: 44100,
                    numberOfChannels: 2,
                    bitRate: 128000,
                },
                ios: {
                    extension: '.m4a',
                    audioQuality: Audio.IOSAudioQuality.HIGH,
                    sampleRate: 44100,
                    numberOfChannels: 2,
                    bitRate: 128000,
                    linearPCMBitDepth: 16,
                    linearPCMIsBigEndian: false,
                    linearPCMIsFloat: false,
                },
                web: {
                    mimeType: 'audio/webm',
                    bitsPerSecond: 128000,
                },
            };

            console.log('Starting recording with custom options..');
            const { recording: newRecording } = await Audio.Recording.createAsync(
                recordingOptions
            );
            setRecording(newRecording);
            setStatus('recording');
        } catch (err: any) {
            console.error('Failed to start recording', err);
            setStatus('idle');
            alert(`Recording failed: ${err.message || 'Unknown error'}`);
        }
    }

    async function stopRecording() {
        console.log('Stopping recording..');
        if (!recording) return;

        setStatus('processing');
        setRecording(null);
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        console.log('Recording stopped and stored at', uri);

        if (uri) {
            uploadAudio(uri);
        }
    }

    async function uploadAudio(uri: string) {
        const formData = new FormData();
        // @ts-ignore
        formData.append('audio', {
            uri: uri,
            name: 'recording.m4a',
            type: 'audio/m4a',
        });
        formData.append('avatarId', '30fa96d0-26c4-4e55-94a0-517025942e18');

        try {
            const response = await axios.post(CHAT_ENDPOINT, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            const { transcript, reply, avatarVideoUrl } = response.data;
            setTranscript(transcript);
            setAiReply(reply);
            setVideoUrl(avatarVideoUrl);
            setStatus('playing');

        } catch (error) {
            console.error("Error uploading audio:", error);
            setStatus('idle');
            setAiReply("Sorry, something went wrong. Please try again.");
        }
    }

    return (
        <View style={styles.container}>
            {/* Header / X Button */}
            <TouchableOpacity style={styles.closeButton} onPress={() => onNavigate('home')}>
                {/* @ts-ignore */}
                <X size={32} color={COLORS.foreground} />
            </TouchableOpacity>

            <Text style={styles.title}>VIBE-buddy</Text>
            <Text style={styles.subtitle}>Your AI Friend</Text>

            {/* Main Content Area */}
            <View style={styles.contentArea}>
                {status === 'processing' && (
                    <View style={styles.centered}>
                        <ActivityIndicator size="large" color={COLORS.primary} />
                        <Text style={styles.statusText}>Thinking...</Text>
                    </View>
                )}

                {status === 'playing' && videoUrl && (
                    <View style={styles.videoContainer}>
                        <Video
                            style={styles.video}
                            source={{ uri: videoUrl }}
                            useNativeControls
                            resizeMode={ResizeMode.CONTAIN}
                            shouldPlay
                            isLooping={false}
                            onPlaybackStatusUpdate={playbackStatus => {
                                // optional: auto-reset to idle when finished
                                // if (playbackStatus.didJustFinish) setStatus('idle');
                            }}
                        />
                        <View style={styles.captionsContainer}>
                            <Text style={styles.captionTitle}>You said:</Text>
                            <Text style={styles.captionText}>"{transcript}"</Text>
                            <Text style={styles.captionTitle}>Reply:</Text>
                            <Text style={styles.captionText}>{aiReply}</Text>
                        </View>
                    </View>
                )}

                {/* Idle / Recording State */}
                {(status === 'idle' || status === 'recording') && (
                    <View style={styles.centered}>
                        <View style={styles.placeholderAvatar}>
                            <Text style={{ fontSize: 60 }}>🤖</Text>
                        </View>
                        {status === 'idle' && (
                            <Text style={styles.instructionText}>Press and hold to talk</Text>
                        )}
                    </View>
                )}
            </View>

            {/* Controls */}
            <View style={styles.controls}>
                {status !== 'playing' && status !== 'processing' ? (
                    <TouchableOpacity
                        onPressIn={startRecording}
                        onPressOut={stopRecording}
                        activeOpacity={0.8}
                    >
                        <Animated.View style={[styles.recordButton, animatedStyle]}>
                            {/* @ts-ignore */}
                            <Mic size={40} color="#fff" />
                        </Animated.View>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        style={[styles.recordButton, { backgroundColor: COLORS.secondary }]}
                        onPress={() => {
                            setStatus('idle');
                            setVideoUrl(null);
                        }}
                    >
                        {status === 'playing' ? (
                            <Text style={{ color: '#fff', fontWeight: 'bold' }}>NEW</Text>
                        ) : (
                            // @ts-ignore
                            <Square size={30} color="#fff" />
                        )}
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
    videoContainer: {
        flex: 1,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    video: {
        width: '100%',
        height: 300,
        backgroundColor: '#000',
    },
    captionsContainer: {
        padding: 20,
        width: '100%',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    captionTitle: {
        color: COLORS.primary,
        fontWeight: 'bold',
        marginTop: 10,
    },
    captionText: {
        color: '#fff',
        fontSize: 16,
        fontStyle: 'italic',
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
});
