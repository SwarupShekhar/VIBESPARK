import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInAnonymously, signInWithCustomToken, signOut } from 'firebase/auth';
import { collection, doc, getFirestore, onSnapshot, query, setDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
// Updated import: Removing built-in SafeAreaView and importing from safe-area-context
import { SafeAreaView } from 'react-native-safe-area-context';

// DO NOT TOUCH THIS CODE - Global declarations for TS compatibility
declare const __firebase_config: string | undefined;
declare const __app_id: string | undefined;
declare const __initial_auth_token: string | undefined;

// Renamed variables for clarity
const FIREBASE_CONFIG = JSON.parse(typeof __firebase_config !== 'undefined' ? __firebase_config : '{}');
const APP_ID = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const INITIAL_AUTH_TOKEN = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : '';
// END DO NOT TOUCH

// Type definition for a public profile
interface PublicProfile {
    id: string; // This will be the user's UID
    name: string;
    vibe: string;
}

// Main component, renamed to MainApp for internal clarity
const MainApp = () => {
  const [db, setDb] = useState<any>(null);
  const [auth, setAuth] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [profile, setProfile] = useState({ name: '', vibe: '' });
  const [profileExists, setProfileExists] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  // New state to hold all other users' profiles
  const [publicProfiles, setPublicProfiles] = useState<PublicProfile[]>([]);


  // Note: We use Alert.alert for error messages in React Native instead of custom modals.
  const [errorMessage, setErrorMessage] = useState('');

  // 1. Firebase Initialization and Authentication
  useEffect(() => {
    // CRITICAL FIX: If config is missing (local running), bypass Firebase init and clear loading state.
    if (Object.keys(FIREBASE_CONFIG).length === 0) {
      console.warn("VibesPark: Firebase config missing. Skipping database connection but loading UI.");
      setIsAuthReady(true);
      return;
    }

    try {
      const app = initializeApp(FIREBASE_CONFIG);
      const dbInstance = getFirestore(app);
      const authInstance = getAuth(app);
      setDb(dbInstance);
      setAuth(authInstance);

      onAuthStateChanged(authInstance, async (currentUser) => {
        if (currentUser) {
          setUser(currentUser);
          setIsAuthReady(true);
        } else {
          try {
            if (INITIAL_AUTH_TOKEN) {
              await signInWithCustomToken(authInstance, INITIAL_AUTH_TOKEN);
            } else {
              await signInAnonymously(authInstance);
            }
          } catch (error) {
            console.error("Authentication error:", error);
            try {
              await signInAnonymously(authInstance);
            } catch (anonError) {
              console.error("Anonymous authentication error:", anonError);
              setErrorMessage("Could not authenticate. Please try again.");
            }
          } finally {
            // This ensures the loading screen goes away after the auth attempt, successful or not.
            setIsAuthReady(true);
          }
        }
      });
    } catch (e: any) {
      // Catch initialization errors (e.g., malformed config)
      console.error("VibesPark Initialization Error:", e);
      setErrorMessage(`Fatal Error during initialization: ${e.message}`);
      setIsAuthReady(true); // Clear loading state on error
    }
  }, []);

  // 2. My Profile Data Listener (from Public Path)
  useEffect(() => {
    // Only run if DB, user, and auth are ready
    if (!db || !user || !isAuthReady) return;

    // *** IMPORTANT: Listening to the PUBLIC path to check if profile exists and retrieve it.
    // The path is now: /artifacts/{appId}/public/data/profiles/{userId}
    const userProfileDocRef = doc(db, 'artifacts', APP_ID, 'public', 'data', 'profiles', user.uid);

    const unsubscribe = onSnapshot(
      userProfileDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.name && data.vibe) {
            setProfileExists(true);
            setProfile({ name: data.name, vibe: data.vibe });
          } else {
            setProfileExists(false);
            setProfile({ name: '', vibe: '' });
          }
        } else {
          setProfileExists(false);
          setProfile({ name: '', vibe: '' });
        }
      },
      (error: any) => {
        console.error("Error listening to profile document:", error);
        setErrorMessage(`Error fetching profile: ${error.message}`);
      }
    );

    return () => unsubscribe();
  }, [db, user, isAuthReady]);
  
  // 3. Public Profiles Data Listener (Firestore)
  useEffect(() => {
    // Only run if DB, user, and auth are ready
    if (!db || !user || !isAuthReady) return;

    // Listen to the PUBLIC collection of all profiles
    const publicProfilesCollectionRef = collection(db, 'artifacts', APP_ID, 'public', 'data', 'profiles');

    const unsubscribe = onSnapshot(
        query(publicProfilesCollectionRef),
        (querySnapshot) => {
            const profiles: PublicProfile[] = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data() as { name: string, vibe: string };
                // Exclude the current user's profile from the list
                if (doc.id !== user.uid) {
                    profiles.push({ id: doc.id, ...data });
                }
            });
            setPublicProfiles(profiles);
        },
        (error: any) => {
            console.error("Error listening to public profiles:", error);
            setErrorMessage(`Error fetching public vibes: ${error.message}`);
        }
    );

    return () => unsubscribe();
}, [db, user, isAuthReady]);


  // Handle error display for React Native
  useEffect(() => {
    if (errorMessage) {
      Alert.alert("Application Error", errorMessage, [{ text: "OK", onPress: () => setErrorMessage('') }]);
    }
  }, [errorMessage]);

  // 4. Save Profile Handler
  const handleSaveProfile = async () => {
    // Check if the database instance is available before trying to save
    if (!db) {
        setErrorMessage("Database connection failed. Profile cannot be saved.");
        return;
    }

    if (!profile.name || !profile.vibe || profileSaving) return;

    setProfileSaving(true);

    try {
      // *** IMPORTANT: Saving profile to the PUBLIC path so others can read it.
      const userProfileDocRef = doc(db, 'artifacts', APP_ID, 'public', 'data', 'profiles', user.uid);
      await setDoc(userProfileDocRef, profile);
      setProfileExists(true);
    } catch (e: any) {
      console.error("Error saving profile:", e);
      setErrorMessage(`Error saving profile: ${e.message}`);
    } finally {
      setProfileSaving(false);
    }
  };

  // 5. Sign Out Handler
  const handleSignOut = async () => {
    if (auth) {
      try {
        await signOut(auth);
        setUser(null);
        setProfileExists(false);
        setProfile({ name: '', vibe: '' });
        setPublicProfiles([]); // Clear public profiles on sign out
      } catch (e) {
        console.error("Error signing out:", e);
      }
    }
  };
  
  // New component to render the list of other profiles
  const OtherVibesList = () => {
    if (publicProfiles.length === 0) {
        return (
            <View style={styles.noVibesContainer}>
                <Text style={styles.noVibesText}>No other vibes found in the park. Be the first to share!</Text>
            </View>
        );
    }

    return (
        <View style={styles.otherVibesContainer}>
            <Text style={styles.otherVibesTitle}>Other Vibes ({publicProfiles.length})</Text>
            <ScrollView style={styles.vibeScrollView}>
                {publicProfiles.map((p) => (
                    <View key={p.id} style={styles.vibeCard}>
                        <Text style={styles.vibeCardName}>{p.name}</Text>
                        <Text style={styles.vibeCardVibe}>"{p.vibe}"</Text>
                        <Text style={styles.vibeCardUserId}>ID: {p.id.substring(0, 8)}...</Text>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
  };


  // 6. Render Logic (React Native Components)

  const renderContent = () => {
    if (!isAuthReady || profileSaving) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8b5cf6" />
          <Text style={styles.loadingText}>{profileSaving ? 'Saving profile...' : 'Loading...'}</Text>
        </View>
      );
    }

    if (!profileExists) {
      return (
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Create Your Vibe Profile</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Your Name</Text>
            <TextInput
              style={styles.input}
              value={profile.name}
              onChangeText={(text) => setProfile({ ...profile, name: text })}
              placeholder="Enter your name"
              placeholderTextColor="#9ca3af"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Your Vibe</Text>
            <TextInput
              style={styles.input}
              value={profile.vibe}
              onChangeText={(text) => setProfile({ ...profile, vibe: text })}
              placeholder="Describe your current vibe"
              placeholderTextColor="#9ca3af"
            />
          </View>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSaveProfile}
            disabled={!profile.name || !profile.vibe || profileSaving}
          >
            <Text style={styles.saveButtonText}>
              {profileSaving ? 'Saving...' : 'Save Profile'}
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    // Profile exists, show user's profile and the list of others
    return (
        <ScrollView contentContainerStyle={styles.mainScrollViewContent}>
            <View style={styles.profileContainer}>
                <Text style={styles.profileWelcome}>Welcome, {profile.name}!</Text>
                <Text style={styles.profileVibe}>Your vibe is: <Text style={styles.vibeText}>"{profile.vibe}"</Text></Text>
                {/* CRITICAL: Display User ID for debugging multi-user apps */}
                <Text style={styles.userIdText}>Your User ID: {user?.uid || 'N/A'}</Text>
                <TouchableOpacity style={styles.connectButton} onPress={() => { Alert.alert('Connect', 'This feature is coming soon!'); }}>
                    <Text style={styles.connectButtonText}>Connect to a Vibe</Text>
                </TouchableOpacity>
                {/* Sign Out Button to show on profile screen for easy testing */}
                <TouchableOpacity style={styles.signOutButtonSmall} onPress={handleSignOut}>
                    <Text style={styles.signOutButtonSmallText}>Sign Out</Text>
                </TouchableOpacity>
            </View>
            <OtherVibesList />
        </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>VibesPark</Text>
          {isAuthReady && user && profileExists && (
            <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
              <Text style={styles.signOutButtonText}>Sign Out</Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.contentArea}>
          {renderContent()}
        </View>
      </View>
    </SafeAreaView>
  );
};

// Wrapper component to match the file structure expected by Expo Router
const App = () => <MainApp />;
export default App;

// React Native Styling using StyleSheet
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f3f4f6', // gray-100 equivalent
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '800', // extrabold
    color: '#7c3aed', // purple-600
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  signOutButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db', // gray-300
    backgroundColor: '#fff',
  },
  signOutButtonText: {
    fontSize: 14,
    fontWeight: '600', // semibold
    color: '#4b5563', // gray-600
  },
  contentArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Main Content ScrollView Style
  mainScrollViewContent: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  // Loading and Error Styles
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loadingText: {
    marginLeft: 12,
    fontSize: 18,
    color: '#4b5563', // gray-600
  },
  // Form Styles
  formContainer: {
    width: '100%',
    maxWidth: 400,
    padding: 32,
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1f2937', // gray-800
    marginBottom: 24,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151', // gray-700
    marginBottom: 8,
  },
  input: {
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#d1d5db', // gray-300
    borderRadius: 8,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  saveButton: {
    width: '100%',
    backgroundColor: '#8b5cf6', // purple-500 equivalent
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  // Profile Styles (Current User)
  profileContainer: {
    width: '100%',
    maxWidth: 400,
    padding: 32,
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    alignItems: 'center',
    marginBottom: 20, // Space before the list of others
  },
  profileWelcome: {
    fontSize: 24,
    fontWeight: '800',
    color: '#6d28d9', // purple-800
    marginBottom: 8,
  },
  profileVibe: {
    fontSize: 18,
    color: '#4b5563', // gray-600
    marginBottom: 24,
  },
  vibeText: {
    fontWeight: '700',
    color: '#ec4899', // pink-500
  },
  connectButton: {
    backgroundColor: '#10b981', // green-500 equivalent
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 30,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
    width: '100%',
    alignItems: 'center',
  },
  connectButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  signOutButtonSmall: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#fef2f2', // red-50
  },
  signOutButtonSmallText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#b91c1c', // red-700
  },
  userIdText: {
    fontSize: 12,
    color: '#9ca3af', // gray-400
    marginBottom: 16,
    textAlign: 'center',
  },
  // Other Vibes List Styles
  otherVibesContainer: {
    width: '100%',
    maxWidth: 400,
    paddingHorizontal: 16,
  },
  otherVibesTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#374151', // gray-700
    marginBottom: 12,
    textAlign: 'center',
  },
  vibeScrollView: {
    maxHeight: 300, // Limit height of the scroll view
    borderRadius: 12,
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  vibeCard: {
    backgroundColor: '#f9fafb', // gray-50
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb', // gray-200
  },
  vibeCardName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4c1d95', // purple-800
  },
  vibeCardVibe: {
    fontSize: 14,
    color: '#6b7280', // gray-500
    marginTop: 4,
    fontStyle: 'italic',
  },
  vibeCardUserId: {
    fontSize: 10,
    color: '#a1a1aa', // zinc-400
    marginTop: 4,
  },
  noVibesContainer: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fcd34d', // amber-300
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  noVibesText: {
    color: '#f59e0b', // amber-500
    textAlign: 'center',
    fontWeight: '600',
  }
});
