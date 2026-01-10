import { Home, PlaySquare, Search, User } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS } from '../constants/theme';

interface BottomNavBarProps {
    currentScreen: string;
    onNavigate: (screen: string) => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ currentScreen, onNavigate }) => {
    const tabs = [
        { name: 'home', label: 'Home', icon: Home },
        { name: 'discover', label: 'Discover', icon: Search },
        { name: 'profile', label: 'Profile', icon: User }, // Note: 'profile' here refers to viewing profile, not creation
        { name: 'feed', label: 'Feed', icon: PlaySquare },
    ];

    return (
        <View style={styles.container}>
            {tabs.map((tab) => {
                const isActive = currentScreen === tab.name;
                const Icon = tab.icon;

                return (
                    <TouchableOpacity
                        key={tab.name}
                        style={styles.tab}
                        onPress={() => onNavigate(tab.name)}
                    >
                        <Icon
                            size={24}
                            color={isActive ? COLORS.accent : COLORS.mutedForeground}
                            strokeWidth={isActive ? 2.5 : 2}
                        />
                        <Text style={[
                            styles.label,
                            { color: isActive ? COLORS.accent : COLORS.mutedForeground }
                        ]}>
                            {tab.label}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: '#1E1B4B', // Dark indigo matching the design
        paddingBottom: 24, // Safe area padding
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.1)',
    },
    tab: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
    },
    label: {
        fontSize: 12,
        fontWeight: '500',
    },
});
