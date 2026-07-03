import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, TextInput, ScrollView, Platform, KeyboardAvoidingView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { id: 1, sender: 'ai', text: 'Hello! I am your S.A.F.E. AI assistant. How can I help you today?' }
  ]);

  const slideAnim = useState(new Animated.Value(300))[0]; // Initial position off-screen
  const fadeAnim = useState(new Animated.Value(0))[0];

  const toggleChat = () => {
    if (isOpen) {
      // Close
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 300,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start(() => setIsOpen(false));
    } else {
      // Open
      setIsOpen(true);
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
    }
  };

  const sendMessage = () => {
    if (!message.trim()) return;
    
    const userMsg = { id: Date.now(), sender: 'user', text: message };
    setChatHistory(prev => [...prev, userMsg]);
    setMessage('');
    
    // Mock AI response
    setTimeout(() => {
      const aiMsg = { id: Date.now() + 1, sender: 'ai', text: 'I am analyzing your request. If this is an emergency, please use the SOS button.' };
      setChatHistory(prev => [...prev, aiMsg]);
    }, 1000);
  };

  return (
    <>
      {/* Floating Action Button */}
      <TouchableOpacity 
        style={[styles.fab, isOpen && styles.fabOpen]} 
        onPress={toggleChat}
        activeOpacity={0.8}
      >
        <Ionicons name={isOpen ? "close" : "chatbubbles"} size={28} color="white" />
      </TouchableOpacity>

      {/* Chat Window */}
      {isOpen && (
        <Animated.View style={[
          styles.chatWindow,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}>
          <View style={styles.header}>
            <View style={styles.headerTitleContainer}>
              <Ionicons name="shield-checkmark" size={20} color="white" />
              <Text style={styles.headerTitle}>S.A.F.E. Assistant</Text>
            </View>
            <TouchableOpacity onPress={toggleChat}>
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.messagesContainer} contentContainerStyle={{ padding: 16 }}>
            {chatHistory.map((msg) => (
              <View 
                key={msg.id} 
                style={[
                  styles.messageBubble, 
                  msg.sender === 'user' ? styles.userBubble : styles.aiBubble
                ]}
              >
                <Text style={[
                  styles.messageText,
                  msg.sender === 'user' ? styles.userMessageText : styles.aiMessageText
                ]}>
                  {msg.text}
                </Text>
              </View>
            ))}
          </ScrollView>

          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Type your message..."
                placeholderTextColor="#9ca3af"
                value={message}
                onChangeText={setMessage}
                onSubmitEditing={sendMessage}
              />
              <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
                <Ionicons name="send" size={20} color="white" />
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </Animated.View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 90, // above bottom tabs
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#b91c1c', // red-700
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#b91c1c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 100,
  },
  fabOpen: {
    backgroundColor: '#374151',
  },
  chatWindow: {
    position: 'absolute',
    bottom: 90, // above tabs
    right: 20,
    left: 20,
    height: 400,
    backgroundColor: 'white',
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
    zIndex: 90,
    overflow: 'hidden',
  },
  header: {
    backgroundColor: '#b91c1c',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#1f2937',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#e5e7eb',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  userMessageText: {
    color: 'white',
  },
  aiMessageText: {
    color: '#1f2937',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: '#1f2937',
  },
  sendButton: {
    backgroundColor: '#b91c1c',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});
