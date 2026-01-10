import { ArrowLeft } from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Bubble, GiftedChat, IMessage, InputToolbar } from 'react-native-gifted-chat';
import { COLORS } from '../constants/theme';

interface PostCallChatScreenProps {
    onNavigate: (screen: string) => void;
    currentUser: any;
}

export const PostCallChatScreen: React.FC<PostCallChatScreenProps> = ({ onNavigate, currentUser }) => {
    const [messages, setMessages] = useState<IMessage[]>([]);

    const onSend = useCallback((newMessages: IMessage[] = []) => {
        setMessages(previousMessages => GiftedChat.append(previousMessages, newMessages));
        // TODO: Send message to Backend API -> Socket.IO
    }, []);

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
                    _id: currentUser?.id || 'anonymous',
                    name: currentUser?.name || 'User',
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
