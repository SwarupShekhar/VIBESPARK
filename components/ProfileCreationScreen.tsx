import React, { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface ProfileCreationScreenProps {
    onNavigate: (screen: string) => void;
    onSaveProfile: () => void;
}

const VIBES = [
    'Listener', 'Storyteller', 'Energetic', 'Creative',
    'Analytical', 'Empathetic', 'Adventurous', 'Thoughtful',
    'Optimistic', 'Curious'
];

export const ProfileCreationScreen: React.FC<ProfileCreationScreenProps> = ({ onNavigate, onSaveProfile }) => {
    const [selectedVibes, setSelectedVibes] = useState<string[]>([]);
    const [storyAnswers, setStoryAnswers] = useState({
        favoriteTopic: '',
        excitedWhen: '',
        funFact: '',
        dream: ''
    });
    const [loading, setLoading] = useState(false);

    const toggleVibe = (vibe: string) => {
        if (selectedVibes.includes(vibe)) {
            setSelectedVibes(prev => prev.filter(v => v !== vibe));
        } else {
            if (selectedVibes.length >= 3) {
                Alert.alert('Limit Reached', 'You can only select up to 3 vibes.');
                return;
            }
            setSelectedVibes(prev => [...prev, vibe]);
        }
    };

    const handleSave = async () => {
        if (selectedVibes.length === 0) {
            Alert.alert('Missing Vibes', 'Please select at least one vibe.');
            return;
        }

        setLoading(true);
        try {
            // BACKEND MIGRATION TODO: POST /api/users/profile
            console.log("Saving profile (mock)...", { selectedVibes, storyAnswers });

            setTimeout(() => {
                onSaveProfile();
            }, 1000);

        } catch (error: any) {
            console.error("Error saving profile:", error);
            Alert.alert('Error', 'Failed to save profile: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text style={styles.title}>Choose <Text style={styles.highlight}>Your Vibes</Text></Text>
                    <Text style={styles.subtitle}>Select up to 3 words that describe you</Text>
                </View>

                <View style={styles.vibesGrid}>
                    {VIBES.map(vibe => (
                        <TouchableOpacity
                            key={vibe}
                            style={[
                                styles.vibeChip,
                                selectedVibes.includes(vibe) && styles.vibeChipSelected
                            ]}
                            onPress={() => toggleVibe(vibe)}
                        >
                            <Text style={[
                                styles.vibeText,
                                selectedVibes.includes(vibe) && styles.vibeTextSelected
                            ]}>{vibe}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Tell Your Story</Text>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>My favorite thing to talk about is...</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Your answer..."
                            placeholderTextColor="rgba(255, 255, 255, 0.4)"
                            value={storyAnswers.favoriteTopic}
                            onChangeText={text => setStoryAnswers(prev => ({ ...prev, favoriteTopic: text }))}
                            multiline
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>I get excited when...</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Your answer..."
                            placeholderTextColor="rgba(255, 255, 255, 0.4)"
                            value={storyAnswers.excitedWhen}
                            onChangeText={text => setStoryAnswers(prev => ({ ...prev, excitedWhen: text }))}
                            multiline
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>A fun fact about me is...</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Your answer..."
                            placeholderTextColor="rgba(255, 255, 255, 0.4)"
                            value={storyAnswers.funFact}
                            onChangeText={text => setStoryAnswers(prev => ({ ...prev, funFact: text }))}
                            multiline
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>My biggest dream is...</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Your answer..."
                            placeholderTextColor="rgba(255, 255, 255, 0.4)"
                            value={storyAnswers.dream}
                            onChangeText={text => setStoryAnswers(prev => ({ ...prev, dream: text }))}
                            multiline
                        />
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.saveButton}
                    onPress={handleSave}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.saveButtonText}>Save Profile</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1E1B4B', // Dark blue/indigo background
    },
    scrollContent: {
        padding: 24,
        paddingBottom: 40,
    },
    header: {
        marginBottom: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8,
    },
    highlight: {
        color: '#818CF8', // Indigo-400
        textDecorationLine: 'underline',
    },
    subtitle: {
        color: '#A5B4FC', // Indigo-300
        fontSize: 14,
    },
    vibesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 32,
    },
    vibeChip: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,
        backgroundColor: 'rgba(49, 46, 129, 0.5)', // Indigo-900/50
        borderWidth: 1,
        borderColor: '#4338CA', // Indigo-700
    },
    vibeChipSelected: {
        backgroundColor: '#8B5CF6', // Violet-500
        borderColor: '#8B5CF6',
    },
    vibeText: {
        color: '#E0E7FF', // Indigo-100
        fontSize: 14,
        fontWeight: '500',
    },
    vibeTextSelected: {
        color: '#fff',
        fontWeight: 'bold',
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 16,
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        color: '#E0E7FF',
        fontSize: 14,
        marginBottom: 8,
        fontWeight: '500',
    },
    input: {
        backgroundColor: 'rgba(49, 46, 129, 0.5)',
        borderRadius: 12,
        padding: 16,
        color: '#fff',
        fontSize: 14,
        borderWidth: 1,
        borderColor: 'rgba(129, 140, 248, 0.2)',
        minHeight: 50,
    },
    saveButton: {
        backgroundColor: '#8B5CF6', // Violet-500
        padding: 18,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 8,
        shadowColor: '#8B5CF6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
