import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export const ConnectLoader = () => {
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
                withTiming(1.1, { duration: 1000 }),
                withTiming(1, { duration: 1000 })
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
        <View style={styles.container}>
            <View style={styles.loaderWrapper}>
                <Animated.View style={[styles.orbContainer, orbStyle]}>
                    <LinearGradient
                        colors={['#471eec', '#ad5fff', '#d60a47']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.orb}
                    />
                    {/* Inner glow simulation */}
                    <View style={styles.innerGlow} />
                </Animated.View>

                <View style={styles.textContainer}>
                    <Text style={styles.text}>Connecting</Text>
                </View>            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000', // Black background as per screenshot
        alignItems: 'center',
        justifyContent: 'center',
    },
    loaderWrapper: {
        width: 200,
        height: 200,
        alignItems: 'center',
        justifyContent: 'center',
    },
    orbContainer: {
        width: 180,
        height: 180,
        borderRadius: 90,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#ad5fff',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 40,
        elevation: 20,
    },
    orb: {
        width: '100%',
        height: '100%',
        borderRadius: 90,
        opacity: 0.8,
    },
    innerGlow: {
        position: 'absolute',
        width: '90%',
        height: '90%',
        borderRadius: 90,
        backgroundColor: '#000', // Inner black to create the "ring" or "sphere" look
        opacity: 0.2, // Adjust to make it look like a solid sphere or ring
        // For a solid sphere look like the image, we might not want this inner hole.
        // The image shows a solid purple sphere with a glow.
        // Let's adjust: The provided CSS had "inset" shadows which makes it look 3D.
        // We can simulate 3D with a radial gradient if we had one, but Linear is okay.
        // Let's just make it a solid gradient sphere.
        display: 'none',
    },
    textContainer: {
        position: 'absolute',
        zIndex: 10,
    },
    text: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 18,
        fontWeight: '300',
        letterSpacing: 1,
    },
});
