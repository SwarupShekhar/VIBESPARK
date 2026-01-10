import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { login, register } from '../services/api';

interface OnboardingScreenProps {
    onLogin: (userData?: any, token?: string) => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onLogin }) => {
    const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
    const [username, setUsername] = useState(''); // Added username
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    // ... (Inside OnboardingScreen component)
    const handleAuth = async () => {
        if (!email || !password || (authMode === 'signup' && !username)) {
            setErrorMessage('Please enter all required fields');
            return;
        }

        setLoading(true);
        setErrorMessage('');

        try {
            let data;
            if (authMode === 'signin') {
                data = await login({ email, password });
            } else {
                // Backend expects 'name', we have 'username' in state
                data = await register({ name: username, email, password });
            }

            // Success
            console.log("Auth success:", data);

            // Pass token and user data up
            onLogin(data.user, data.token);

        } catch (err: any) {
            console.error("Auth error:", err);

            let msg = err.message || 'Authentication failed';

            if (err.response?.data) {
                if (err.response.data.message) {
                    msg = err.response.data.message;
                } else if (err.response.data.errors && Array.isArray(err.response.data.errors)) {
                    // Extract validation messages
                    msg = err.response.data.errors.map((e: any) => e.msg).join('\n');
                }
            }

            setErrorMessage(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.contentContainer}>
                <View style={styles.header}>
                    <View style={styles.logoContainer}>
                        <Text style={styles.logoText}>VIBE</Text>
                        <Text style={styles.logoIcon}>⚡</Text>
                        <Text style={[styles.logoText, styles.logoTextPink]}>PARK</Text>
                    </View>
                    <Text style={styles.tagline}>Connect through daily conversations</Text>
                </View>

                <View style={styles.form}>
                    {authMode === 'signup' && (
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Username</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Choose a username"
                                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                                value={username}
                                onChangeText={setUsername}
                                autoCapitalize="none"
                            />
                        </View>
                    )}

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your email"
                            placeholderTextColor="rgba(255, 255, 255, 0.5)"
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Password</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your password"
                            placeholderTextColor="rgba(255, 255, 255, 0.5)"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />
                    </View>

                    {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

                    <TouchableOpacity
                        style={styles.button}
                        onPress={handleAuth}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>
                                {authMode === 'signin' ? 'Login' : 'Sign Up'}
                            </Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => {
                            setAuthMode(authMode === 'signin' ? 'signup' : 'signin');
                            setErrorMessage('');
                        }}
                        style={styles.switchButton}
                    >
                        <Text style={styles.switchText}>
                            {authMode === 'signin' ? "Don't have an account? Sign Up" : 'Already have an account? Login'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.forgotButton}>
                        <Text style={styles.forgotText}>Forgot Password?</Text>
                    </TouchableOpacity>

                    {/* Social buttons removed for brevity as they would need separate migration */}
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#2E026D', // Deep purple background
    },
    contentContainer: {
        flex: 1,
        padding: 24,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 48,
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    logoText: {
        fontSize: 32,
        fontWeight: '900',
        color: '#fff',
        textShadowColor: 'rgba(255, 255, 255, 0.5)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 10,
    },
    logoTextPink: {
        color: '#D946EF', // Pinkish purple
        textShadowColor: 'rgba(217, 70, 239, 0.5)',
    },
    logoIcon: {
        fontSize: 32,
        marginHorizontal: 4,
        color: '#FACC15', // Yellow lightning
        textShadowColor: 'rgba(250, 204, 21, 0.5)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 10,
    },
    tagline: {
        color: '#E9D5FF',
        fontSize: 16,
        textAlign: 'center',
    },
    form: {
        width: '100%',
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
    },
    input: {
        backgroundColor: 'rgba(76, 29, 149, 0.5)', // Semi-transparent dark purple
        borderRadius: 12,
        padding: 16,
        color: '#fff',
        fontSize: 16,
        borderWidth: 1,
        borderColor: 'rgba(139, 92, 246, 0.3)',
    },
    button: {
        backgroundColor: '#8B5CF6', // Bright purple
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginTop: 8,
        marginBottom: 16,
        shadowColor: '#8B5CF6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    switchButton: {
        alignItems: 'center',
        marginBottom: 16,
    },
    switchText: {
        color: '#E9D5FF',
        fontSize: 14,
    },
    forgotButton: {
        alignItems: 'center',
        marginBottom: 32,
    },
    forgotText: {
        color: '#A78BFA',
        fontSize: 14,
    },
    socialContainer: {
        gap: 12,
    },
    socialButton: {
        backgroundColor: 'rgba(76, 29, 149, 0.4)',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(139, 92, 246, 0.3)',
    },
    socialButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    errorText: {
        color: '#EF4444',
        marginBottom: 16,
        textAlign: 'center',
    },
});
