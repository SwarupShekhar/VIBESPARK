import { addDoc, collection, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore';
import { ArrowLeft } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Bubble, GiftedChat, IMessage, InputToolbar } from 'react-native-gifted-chat';
import { COLORS } from '../constants/theme';
import { auth, db } from '../firebase-config';

interface PostCallChatScreenProps {
    onNavigate: (screen: string) => void;
}

export const PostCallChatScreen: React.FC<PostCallChatScreenProps> = ({ onNavigate }) => {
    const [messages, setMessages] = useState<IMessage[]>([]);
    const user = auth.currentUser;

    // In a real app, this would be a unique chat ID between two users
    // For demo purposes, we'll use a single global chat room or a temporary one
    const chatId = 'demo_chat_room';

    useEffect(() => {
        if (!db) return;

        const messagesRef = collection(db, 'chats', chatId, 'messages');
        const q = query(messagesRef, orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const newMessages = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    _id: doc.id,
                    text: data.text,
                    createdAt: data.createdAt?.toDate() || new Date(),
                    user: data.user,
                } as IMessage;
            });
            setMessages(newMessages);
        });

        return () => unsubscribe();
    }, []);

    const onSend = useCallback((messages: IMessage[] = []) => {
        if (!db || !user) return;

        const { _id, createdAt, text, user: msgUser } = messages[0];

        addDoc(collection(db, 'chats', chatId, 'messages'), {
            _id,
            createdAt: serverTimestamp(),
            text,
            user: msgUser,
        });
    }, [user]);

    const renderBubble = (props: any) => {
        return (
            <Bubble
                {...props}
                wrapperStyle={{
                    right: {
                        backgroundColor: COLORS.primary,
                    },
                    left: {
                        backgroundColor: '#2e2e2e',
                    },
                }}
                textStyle={{
                    right: {
                        color: '#fff',
                    },
                    left: {
                        color: '#fff',
                    },
                }}
            />
        );
    };

    const renderInputToolbar = (props: any) => {
        return (
            <InputToolbar
                {...props}
                containerStyle={{
                    backgroundColor: '#1a1a1a',
                    borderTopColor: '#333',
                }}
                textInputStyle={{
                    color: '#fff',
                }}
            />
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => onNavigate('home')} style={styles.backButton}>
                    <ArrowLeft size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Chat</Text>
                <View style={{ width: 24 }} />
            </View>

            <GiftedChat
                messages={messages}
                onSend={messages => onSend(messages)}
                user={{
                    _id: user?.uid || 'anonymous',
                    name: user?.email?.split('@')[0] || 'User',
                    avatar: 'https://placeimg.com/140/140/any',
                }}
                renderBubble={renderBubble}
                renderInputToolbar={renderInputToolbar}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 60,
        paddingBottom: 20,
        backgroundColor: COLORS.background,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
});
