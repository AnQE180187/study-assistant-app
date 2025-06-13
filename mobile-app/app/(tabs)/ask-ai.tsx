import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Header } from '../../components/Header';
import { Colors } from '../../constants/Colors';

export default function AskAIScreen() {
  const [question, setQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState([
    {
      id: '1',
      type: 'ai',
      message: 'Hello! How can I help you with your studies today?',
    },
  ]);

  const handleSend = () => {
    if (question.trim()) {
      setChatHistory([
        ...chatHistory,
        { id: Date.now().toString(), type: 'user', message: question },
        {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          message: 'This is a placeholder response. The AI integration will be implemented later.',
        },
      ]);
      setQuestion('');
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Ask AI" />
      <ScrollView style={styles.chatContainer}>
        {chatHistory.map((chat) => (
          <View
            key={chat.id}
            style={[
              styles.messageContainer,
              chat.type === 'user' ? styles.userMessage : styles.aiMessage,
            ]}>
            <Text style={styles.messageText}>{chat.message}</Text>
          </View>
        ))}
      </ScrollView>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={question}
          onChangeText={setQuestion}
          placeholder="Ask your question..."
          placeholderTextColor={Colors.gray}
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  chatContainer: {
    flex: 1,
    padding: 16,
  },
  messageContainer: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
  },
  userMessage: {
    backgroundColor: Colors.primary,
    alignSelf: 'flex-end',
  },
  aiMessage: {
    backgroundColor: Colors.white,
    alignSelf: 'flex-start',
  },
  messageText: {
    color: Colors.text,
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.lightGray,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  sendButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 