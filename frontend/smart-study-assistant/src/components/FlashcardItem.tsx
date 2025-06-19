import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface FlashcardItemProps {
  question: string;
  answer: string;
}

const FlashcardItem: React.FC<FlashcardItemProps> = ({ question, answer }) => (
  <View style={styles.card}>
    <Text style={styles.question}>{question}</Text>
    <Text style={styles.answer}>{answer}</Text>
  </View>
);

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#fff',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  question: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 8,
  },
  answer: {
    fontSize: 14,
    color: '#555',
  },
});

export default FlashcardItem; 