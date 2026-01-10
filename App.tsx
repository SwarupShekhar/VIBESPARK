import { registerRootComponent } from 'expo';
// import { onAuthStateChanged, User } from 'firebase/auth';
// import { collection, doc, getDoc, getDocs, limit, query, where } from 'firebase/firestore';
// import { auth, db } from './firebase-config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AnamChatScreen } from './components/AnamChatScreen';
import { BottomNavBar } from './components/BottomNavBar';
import { ConnectLoader } from './components/ConnectLoader';
import { DiscoverScreen } from './components/DiscoverScreen';
import { HomeScreen } from './components/HomeScreen';
import { OnboardingScreen } from './components/OnboardingScreen';
import { PostCallChatScreen } from './components/PostCallChatScreen';
import { ProfileCreationScreen } from './components/ProfileCreationScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { ReelsFeedScreen } from './components/ReelsFeedScreen';
import { VoiceCallScreen } from './components/VoiceCallScreen';
import { COLORS } from './constants/theme';
import { getProfile, logout } from './services/api';

type Screen = 'onboarding' | 'home' | 'profile' | 'call' | 'chat' | 'feed' | 'discover' | 'profile-creation' | 'connecting' | 'anam-chat';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('onboarding');
  const [streakCount, setStreakCount] = useState(7);
  const [hasProfile, setHasProfile] = useState(false);
  const [user, setUser] = useState<any | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [matchedUser, setMatchedUser] = useState<any>(null);

  // ... (Inside App component)

  // Replaces firebase onAuthStateChanged
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
          setToken(token);
          // Optional: Fetch user profile to validate token
          const userProfile = await getProfile();
          setUser(userProfile);
          setHasProfile(true); // Assume profile exists if we have a valid token/user
          setCurrentScreen('home');
        }
      } catch (e) {
        console.log("Auth check failed:", e);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogin = (userData: any, authToken?: string) => {
    console.log("Logged in:", userData?.email);
    setUser(userData);
    if (authToken) setToken(authToken);
    setHasProfile(true);
    setCurrentScreen('home');
  };

  const handleSaveProfile = () => {
    setHasProfile(true);
    setCurrentScreen('home');
  };

  const handleCallEnd = () => {
    setStreakCount(prev => prev + 1);
  };

  const navigateToScreen = (screen: string) => {
    setCurrentScreen(screen as Screen);
  };

  const handleSignOut = async () => {
    await logout();
    setUser(null);
    setToken(null);
    setCurrentScreen('onboarding');
  };

  const handleCallStart = async () => {
    setCurrentScreen('connecting');

    try {
      // Mock matching logic for now (Backend migration required)
      console.log("Finding match...");

      setTimeout(() => {
        const randomUser = {
          id: 'mock_uid_123',
          email: 'receiver@test.com',
          name: 'Mock User',
          vibes: ['Chill', 'Music']
        }; // Mock
        setMatchedUser(randomUser);
        setCurrentScreen('call');
      }, 2000);

      //   if (!db || !user) return;

      //   // Simple matching logic: find any other user
      //   // In a real app, this would be more complex (matching algorithm)
      //   const usersRef = collection(db, 'users');
      //   const q = query(usersRef, where('uid', '!=', user.uid), limit(10));
      //   const querySnapshot = await getDocs(q);

      //   if (!querySnapshot.empty) {
      //     // Pick a random user from the results
      //     const users = querySnapshot.docs.map(doc => doc.data());
      //     const randomUser = users[Math.floor(Math.random() * users.length)];
      //     setMatchedUser(randomUser);

      //     // Simulate connection delay
      //     setTimeout(() => {
      //       setCurrentScreen('call');
      //     }, 3000);
      //   } else {
      //     console.log("No users found to match with");
      //     // Fallback or show error
      //     setCurrentScreen('home');
      //   }
    } catch (error) {
      console.error("Error matching user:", error);
      setCurrentScreen('home');
    }
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'onboarding':
        return <OnboardingScreen onLogin={handleLogin} />;

      case 'home':
        return (
          <HomeScreen
            onNavigate={(screen) => {
              if (screen === 'call') {
                handleCallStart();
              } else {
                navigateToScreen(screen);
              }
            }}
            streakCount={streakCount}
            onSignOut={handleSignOut}
          />
        );

      case 'profile':
        return <ProfileScreen onNavigate={navigateToScreen} />;

      case 'profile-creation':
        return (
          <ProfileCreationScreen
            onNavigate={navigateToScreen}
            onSaveProfile={handleSaveProfile}
          />
        );

      case 'connecting':
        return <ConnectLoader />;

      case 'call':
        return (
          <VoiceCallScreen
            onNavigate={navigateToScreen}
            onCallEnd={handleCallEnd}
            matchedUser={matchedUser}
            currentUser={user}
          />
        );

      case 'chat':
        return <PostCallChatScreen onNavigate={navigateToScreen} currentUser={user} />;

      case 'feed':
        return <ReelsFeedScreen onNavigate={navigateToScreen} />;

      case 'discover':
        return <DiscoverScreen onNavigate={navigateToScreen} currentUser={user} />;

      case 'anam-chat':
        return <AnamChatScreen onNavigate={navigateToScreen} />;

      default:
        return <HomeScreen onNavigate={navigateToScreen} streakCount={streakCount} onSignOut={handleSignOut} />;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ color: COLORS.foreground }}>Loading...</Text>
      </View>
    );
  }

  const showBottomNav = hasProfile && ['home', 'discover', 'profile', 'feed'].includes(currentScreen);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <View style={{ flex: 1 }}>
        {renderScreen()}
      </View>
      {showBottomNav && (
        <BottomNavBar
          currentScreen={currentScreen}
          onNavigate={navigateToScreen}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  discoverContainer: {
    flex: 1,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  discoverContent: {
    alignItems: 'center',
    gap: 16,
  },
  discoverTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.foreground,
  },
  discoverText: {
    color: COLORS.mutedForeground,
  },
  backLink: {
    color: COLORS.accent,
    fontSize: 16,
    marginTop: 16,
  },
});

registerRootComponent(App);