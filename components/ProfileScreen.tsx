import { Edit2, User as UserIcon } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS } from '../constants/theme';
import { getProfile } from '../services/api';

interface ProfileScreenProps {
    onNavigate: (screen: string) => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ onNavigate }) => {
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState<any>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const profile = await getProfile();
                setUserData(profile);
            } catch (error) {
                console.error("Error fetching profile:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.accent} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <View style={styles.avatarContainer}>
                        <UserIcon size={40} color="#fff" />
                    </View>
                    <Text style={styles.email}>{userData?.email || 'User'}</Text>
                    <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => onNavigate('profile-creation')} // Reuse creation screen for editing
                    >
                        <Edit2 size={16} color={COLORS.accent} />
                        <Text style={styles.editButtonText}>Edit Profile</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>My Vibes</Text>
                    <View style={styles.vibesGrid}>
                        {userData?.vibes?.map((vibe: string) => (
                            <View key={vibe} style={styles.vibeChip}>
                                <Text style={styles.vibeText}>{vibe}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>My Story</Text>

                    {userData?.story && Object.entries(userData.story).map(([key, value]) => {
                        if (!value) return null;
                        let label = '';
                        switch (key) {
                            case 'favoriteTopic': label = 'Favorite thing to talk about'; break;
                            case 'excitedWhen': label = 'I get excited when'; break;
                            case 'funFact': label = 'Fun fact about me'; break;
                            case 'dream': label = 'My biggest dream'; break;
                            default: label = key;
                        }

                        return (
                            <View key={key} style={styles.storyItem}>
                                <Text style={styles.storyLabel}>{label}</Text>
                                <Text style={styles.storyValue}>{value as string}</Text>
                            </View>
                        );
                    })}
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1E1B4B',
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: '#1E1B4B',
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        padding: 24,
        paddingBottom: 40,
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    avatarContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(139, 92, 246, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        borderWidth: 2,
        borderColor: COLORS.accent,
    },
    email: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 8,
    },
    editButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        padding: 8,
    },
    editButtonText: {
        color: COLORS.accent,
        fontSize: 14,
        fontWeight: '500',
    },
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
        paddingBottom: 8,
    },
    vibesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    vibeChip: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: COLORS.accent,
    },
    vibeText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    storyItem: {
        marginBottom: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        padding: 16,
        borderRadius: 12,
    },
    storyLabel: {
        color: '#A5B4FC',
        fontSize: 12,
        marginBottom: 4,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    storyValue: {
        color: '#fff',
        fontSize: 16,
        lineHeight: 24,
    },
});
