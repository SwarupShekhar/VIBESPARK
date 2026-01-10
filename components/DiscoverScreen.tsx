import { MessageCircle, User as UserIcon } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS } from '../constants/theme';

interface DiscoverScreenProps {
    onNavigate: (screen: string) => void;
    currentUser: any;
}

interface UserProfile {
    id: string;
    email: string;
    vibes: string[];
    isProfileComplete: boolean;
}

export const DiscoverScreen: React.FC<DiscoverScreenProps> = ({ onNavigate, currentUser }) => {
    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState<UserProfile[]>([]);

    useEffect(() => {
        // TODO: Implement GET /api/users/discover
        const mockUsers: UserProfile[] = [
            { id: '1', email: 'alice@example.com', vibes: ['Creative', 'Fun'], isProfileComplete: true },
            { id: '2', email: 'bob@example.com', vibes: ['Chill', 'Tech'], isProfileComplete: true },
        ];
        setUsers(mockUsers);
    }, []);

    const renderItem = ({ item }: { item: UserProfile }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.avatar}>
                    <UserIcon size={24} color="#fff" />
                </View>
                <Text style={styles.cardTitle}>{item.email.split('@')[0]}</Text>
            </View>

            <View style={styles.vibesContainer}>
                {item.vibes?.slice(0, 3).map((vibe, index) => (
                    <View key={index} style={styles.vibeTag}>
                        <Text style={styles.vibeText}>{vibe}</Text>
                    </View>
                ))}
            </View>

            <TouchableOpacity style={styles.chatButton}>
                <MessageCircle size={16} color="#fff" />
                <Text style={styles.chatButtonText}>Say Hi</Text>
            </TouchableOpacity>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.accent} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.headerTitle}>Discover People</Text>
            {users.length === 0 ? (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>No other users found yet.</Text>
                </View>
            ) : (
                <FlatList
                    data={users}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                    numColumns={2}
                    columnWrapperStyle={styles.columnWrapper}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1E1B4B',
        paddingTop: 24,
        paddingHorizontal: 16,
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: '#1E1B4B',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 16,
    },
    listContent: {
        paddingBottom: 20,
    },
    columnWrapper: {
        justifyContent: 'space-between',
    },
    card: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        width: '48%',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 8,
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: COLORS.accent,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardTitle: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
        flex: 1,
    },
    vibesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 4,
        marginBottom: 12,
    },
    vibeTag: {
        backgroundColor: 'rgba(139, 92, 246, 0.2)',
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 8,
    },
    vibeText: {
        color: '#A5B4FC',
        fontSize: 10,
    },
    chatButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.accent,
        padding: 8,
        borderRadius: 8,
        gap: 4,
    },
    chatButtonText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        color: '#A5B4FC',
        fontSize: 16,
    },
});
