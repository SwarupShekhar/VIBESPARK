import { LinearGradient } from 'expo-linear-gradient';
import { Flame, MoreHorizontal, Music } from 'lucide-react-native';
import React, { useState } from 'react';
import { Dimensions, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width, height } = Dimensions.get('window');
const BOTTOM_NAV_HEIGHT = 80; // Approximate height of bottom nav

interface Reel {
    id: string;
    username: string;
    description: string;
    music: string;
    likes: string;
    comments: string;
    color: [string, string, ...string[]]; // Gradient colors for placeholder
}

const DUMMY_REELS: Reel[] = [
    {
        id: '1',
        username: 'alex_vibes',
        description: 'Late night coding sessions be like... 💻✨ #coding #vibes',
        music: 'Lo-Fi Beats - Chill Mix',
        likes: '1.2k',
        comments: '342',
        color: ['#4c1d95', '#2e1065'],
    },
    {
        id: '2',
        username: 'sarah_travels',
        description: 'Missing this view! Take me back 🌊☀️ #travel #wanderlust',
        music: 'Summer Vibes - Beach Boy',
        likes: '8.5k',
        comments: '1.1k',
        color: ['#0ea5e9', '#0284c7'],
    },
    {
        id: '3',
        username: 'mike_gym',
        description: 'No pain no gain! 💪🔥 #fitness #motivation',
        music: 'Workout Hype - Power Up',
        likes: '4.3k',
        comments: '89',
        color: ['#dc2626', '#991b1b'],
    },
    {
        id: '4',
        username: 'foodie_jen',
        description: 'Best burger in town! 🍔🍟 #foodie #yummy',
        music: 'Yummy - Justin B',
        likes: '2.1k',
        comments: '156',
        color: ['#f59e0b', '#d97706'],
    },
];

interface ReelsFeedScreenProps {
    onNavigate: (screen: string) => void;
}

export const ReelsFeedScreen: React.FC<ReelsFeedScreenProps> = ({ onNavigate }) => {
    const [activeReelIndex, setActiveReelIndex] = useState(0);

    const renderItem = ({ item, index }: { item: Reel; index: number }) => {
        return (
            <View style={styles.reelContainer}>
                {/* Video Placeholder (Gradient) */}
                <LinearGradient
                    colors={item.color}
                    style={styles.videoPlaceholder}
                >
                    <Text style={styles.placeholderText}>Video Content</Text>
                </LinearGradient>

                {/* Overlay Content */}
                <View style={styles.overlay}>
                    {/* Right Side Actions */}
                    <View style={styles.actionsContainer}>
                        <TouchableOpacity style={styles.actionButton}>
                            <View style={styles.avatarPlaceholder}>
                                <Text style={styles.avatarText}>{item.username[0].toUpperCase()}</Text>
                            </View>
                            <View style={styles.followBadge}>
                                <Text style={styles.followText}>+</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionButton}>
                            <Flame size={32} color="#FACC15" fill="#FACC15" />
                            <Text style={styles.actionText}>{item.likes}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionButton}>
                            <MoreHorizontal size={32} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    {/* Bottom Content */}
                    <View style={styles.bottomContainer}>
                        <Text style={styles.username}>@{item.username}</Text>
                        <Text style={styles.description}>{item.description}</Text>

                        <View style={styles.musicContainer}>
                            <Music size={16} color="#fff" />
                            <Text style={styles.musicText}>{item.music}</Text>
                        </View>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={DUMMY_REELS}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                pagingEnabled
                showsVerticalScrollIndicator={false}
                snapToInterval={height - BOTTOM_NAV_HEIGHT}
                snapToAlignment="start"
                decelerationRate="fast"
                onMomentumScrollEnd={(e) => {
                    const index = Math.round(e.nativeEvent.contentOffset.y / (height - BOTTOM_NAV_HEIGHT));
                    setActiveReelIndex(index);
                }}
                getItemLayout={(data, index) => ({
                    length: height - BOTTOM_NAV_HEIGHT,
                    offset: (height - BOTTOM_NAV_HEIGHT) * index,
                    index,
                })}
            />

            {/* Top Tabs Overlay */}
            <View style={styles.topTabs}>
                <Text style={styles.tabTextInactive}>Following</Text>
                <Text style={styles.tabTextActive}>For You</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    reelContainer: {
        width: width,
        height: height - BOTTOM_NAV_HEIGHT,
        position: 'relative',
    },
    videoPlaceholder: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderText: {
        color: 'rgba(255,255,255,0.2)',
        fontSize: 24,
        fontWeight: 'bold',
    },
    overlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        top: 0,
        justifyContent: 'flex-end',
        paddingBottom: 20,
        paddingHorizontal: 16,
    },
    actionsContainer: {
        position: 'absolute',
        right: 16,
        bottom: 100,
        alignItems: 'center',
        gap: 20,
    },
    actionButton: {
        alignItems: 'center',
        gap: 4,
    },
    actionText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    avatarPlaceholder: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#fff',
    },
    avatarText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000',
    },
    followBadge: {
        position: 'absolute',
        bottom: -8,
        backgroundColor: '#ef4444',
        width: 20,
        height: 20,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    followText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    bottomContainer: {
        maxWidth: '80%',
        gap: 8,
        marginBottom: 20,
    },
    username: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    description: {
        color: '#fff',
        fontSize: 16,
        lineHeight: 22,
    },
    musicContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    musicText: {
        color: '#fff',
        fontSize: 14,
    },
    topTabs: {
        position: 'absolute',
        top: 50,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 20,
        zIndex: 10,
    },
    tabTextActive: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        borderBottomWidth: 2,
        borderBottomColor: '#fff',
        paddingBottom: 4,
    },
    tabTextInactive: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 18,
        fontWeight: '600',
    },
});
