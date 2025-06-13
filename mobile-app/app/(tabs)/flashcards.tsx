import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text } from 'react-native';
import { FlashcardItem } from '../../components/FlashcardItem';
import { Header } from '../../components/Header';
import { Colors } from '../../constants/Colors';

// Static flashcard data
const staticFlashcards = [
  {
    id: '1',
    front: 'What is React Native?',
    back: 'A framework for building native apps using React',
  },
  {
    id: '2',
    front: 'What is Expo?',
    back: 'A framework and platform for universal React applications',
  },
  {
    id: '3',
    front: 'What is TypeScript?',
    back: 'A typed superset of JavaScript that compiles to plain JavaScript',
  },
  {
    id: '4',
    front: 'What is JSX?',
    back: 'A syntax extension for JavaScript that lets you write HTML-like code in JavaScript',
  },
];

export default function FlashcardsScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    if (currentIndex < staticFlashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Flashcards" />
      <ScrollView contentContainerStyle={styles.content}>
        <FlashcardItem
          front={staticFlashcards[currentIndex].front}
          back={staticFlashcards[currentIndex].back}
        />
        <View style={styles.navigation}>
          <TouchableOpacity
            style={[styles.navButton, currentIndex === 0 && styles.disabledButton]}
            onPress={handlePrevious}
            disabled={currentIndex === 0}>
            <Text style={styles.navButtonText}>Previous</Text>
          </TouchableOpacity>
          <Text style={styles.counter}>
            {currentIndex + 1} / {staticFlashcards.length}
          </Text>
          <TouchableOpacity
            style={[styles.navButton, currentIndex === staticFlashcards.length - 1 && styles.disabledButton]}
            onPress={handleNext}
            disabled={currentIndex === staticFlashcards.length - 1}>
            <Text style={styles.navButtonText}>Next</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 16,
    flexGrow: 1,
    justifyContent: 'center',
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
  },
  navButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  disabledButton: {
    backgroundColor: Colors.gray,
  },
  navButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  counter: {
    fontSize: 16,
    color: Colors.text,
  },
}); 