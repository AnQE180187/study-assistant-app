import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const FlashcardDecksScreen: React.FC = () => (
  <View style={styles.container}>
    <Text style={styles.title}>Bộ Flashcards</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F6FA',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default FlashcardDecksScreen; 