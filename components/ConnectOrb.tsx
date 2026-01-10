import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming
} from 'react-native-reanimated';

interface ConnectOrbProps {
    onPress: () => void;
}

export const ConnectOrb: React.FC<ConnectOrbProps> = ({ onPress }) => {
    const rotation = useSharedValue(0);
    const pulse = useSharedValue(1);

    useEffect(() => {
        // Rotate the orb
        rotation.value = withRepeat(
            withTiming(360, {
                duration: 3000,
                easing: Easing.linear,
            }),
            -1
        );

        // Pulse effect
        pulse.value = withRepeat(
            withSequence(
                withTiming(1.05, { duration: 1500 }),
                withTiming(1, { duration: 1500 })
            ),
            -1,
            true
        );
    }, []);

    const orbStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { rotate: `${rotation.value}deg` },
                { scale: pulse.value }
            ],
        };
    });

    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
            <View style={styles.container}>
                <Animated.View style={[styles.orbContainer, orbStyle]}>
                    <LinearGradient
                        colors={['#471eec', '#ad5fff', '#d60a47']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.orb}
                    />
                </Animated.View>

                <View style={styles.textContainer}>
                    <Text style={styles.text}>Connect</Text>
                    <Text style={styles.text}>Now</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        width: 280,
        height: 280,
        alignItems: 'center',
        justifyContent: 'center',
    },
    orbContainer: {
        width: 280,
        height: 280,
        borderRadius: 140,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#ad5fff',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 30,
        elevation: 15,
    },
    orb: {
        width: '100%',
        height: '100%',
        borderRadius: 140,
        opacity: 0.9,
    },
    textContainer: {
        position: 'absolute',
        alignItems: 'center',
        zIndex: 10,
    },
    text: {
        color: '#fff',
        fontSize: 32,
        fontWeight: 'bold',
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
});
