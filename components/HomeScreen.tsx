import { Flame } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ConnectOrb } from './ConnectOrb';

interface HomeScreenProps {
    onNavigate: (screen: string) => void;
    streakCount: number;
    onSignOut: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigate, streakCount, onSignOut }) => {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.logoContainer}>
                    <Text style={styles.logoText}>VIBE</Text>
                    <Text style={styles.logoIcon}>⚡</Text>
                    <Text style={[styles.logoText, styles.logoTextPink]}>PARK</Text>
                </View>
            </View>

            <View style={styles.content}>
                <View style={styles.orbWrapper}>
                    <ConnectOrb onPress={() => onNavigate('call')} />
                    <TouchableOpacity
                        style={styles.vibeBuddyButton}
                        onPress={() => onNavigate('anam-chat')}
                    >
                        <Text style={styles.vibeBuddyText}>🤖 Talk to VIBE-buddy</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.streakContainer}>
                    {/* @ts-ignore */}
                    <Flame size={20} color="#F97316" fill="#F97316" />
                    <Text style={styles.streakText}>{streakCount} day streak</Text>
                </View>

                <Text style={styles.description}>
                    Start a spontaneous 3-minute conversation with someone new
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#2E026D', // Deep purple
    },
    header: {
        alignItems: 'center',
        paddingTop: 20,
        paddingBottom: 20,
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logoText: {
        fontSize: 24,
        fontWeight: '900',
        color: '#fff',
        textShadowColor: 'rgba(255, 255, 255, 0.5)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 10,
    },
    logoTextPink: {
        color: '#D946EF',
        textShadowColor: 'rgba(217, 70, 239, 0.5)',
    },
    logoIcon: {
        fontSize: 24,
        marginHorizontal: 4,
        color: '#FACC15',
        textShadowColor: 'rgba(250, 204, 21, 0.5)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 10,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    orbWrapper: {
        marginBottom: 40,
    },
    streakContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(76, 29, 149, 0.6)',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 30,
        gap: 8,
        marginBottom: 24,
    },
    streakText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    description: {
        color: '#E9D5FF',
        fontSize: 16,
        textAlign: 'center',
        maxWidth: 300,
        lineHeight: 24,
    },
    vibeBuddyButton: {
        marginTop: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    vibeBuddyText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
