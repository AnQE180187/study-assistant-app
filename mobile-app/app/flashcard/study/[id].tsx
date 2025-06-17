import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Flashcard, StudyMode } from '../../../types';

// Temporary static data for testing
const FLASHCARDS: Record<string, Flashcard[]> = {
  '1': [
    {
      id: '1-1',
      front: 'What is the capital of France?',
      back: 'Paris',
    },
    {
      id: '1-2',
      front: 'What is the largest planet in our solar system?',
      back: 'Jupiter',
    },
    {
      id: '1-3',
      front: 'What is the chemical symbol for gold?',
      back: 'Au',
    },
  ],
  '2': [
    {
      id: '2-1',
      front: 'What is the past tense of "go"?',
      back: 'Went',
    },
    {
      id: '2-2',
      front: 'What is the plural form of "child"?',
      back: 'Children',
    },
    {
      id: '2-3',
      front: 'What is the comparative form of "good"?',
      back: 'Better',
    },
  ],
};

export default function StudyScreen() {
  const { id, mode } = useLocalSearchParams<{ id: string; mode: StudyMode }>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const flipAnimation = useRef(new Animated.Value(0)).current;

  const flashcards = FLASHCARDS[id] || [];
  const currentCard = flashcards[currentIndex];

  const flipCard = () => {
    setIsFlipped(!isFlipped);
    Animated.spring(flipAnimation, {
      toValue: isFlipped ? 0 : 180,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start();
  };

  const nextCard = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
      flipAnimation.setValue(0);
    }
  };

  const previousCard = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
      flipAnimation.setValue(0);
    }
  };

  const frontAnimatedStyle = {
    transform: [
      {
        rotateY: flipAnimation.interpolate({
          inputRange: [0, 180],
          outputRange: ['0deg', '180deg'],
        }),
      },
    ],
  };

  const backAnimatedStyle = {
    transform: [
      {
        rotateY: flipAnimation.interpolate({
          inputRange: [0, 180],
          outputRange: ['180deg', '360deg'],
        }),
      },
    ],
  };

  if (!currentCard) {
    return (
      <View style={styles.container}>
        <Text>No flashcards found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.progress}>
          {currentIndex + 1} / {flashcards.length}
        </Text>
      </View>

      <View style={styles.cardContainer}>
        <TouchableOpacity onPress={flipCard} activeOpacity={1}>
          <Animated.View style={[styles.card, frontAnimatedStyle]}>
            <Text style={styles.cardText}>{currentCard.front}</Text>
            <Text style={styles.tapHint}>Tap to flip</Text>
          </Animated.View>
          <Animated.View style={[styles.card, styles.cardBack, backAnimatedStyle]}>
            <Text style={styles.cardText}>{currentCard.back}</Text>
            <Text style={styles.tapHint}>Tap to flip</Text>
          </Animated.View>
        </TouchableOpacity>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.controlButton, currentIndex === 0 && styles.disabledButton]}
          onPress={previousCard}
          disabled={currentIndex === 0}
        >
          <Ionicons name="chevron-back" size={24} color={currentIndex === 0 ? '#ccc' : '#4A90E2'} />
          <Text style={[styles.controlText, currentIndex === 0 && styles.disabledText]}>Previous</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, currentIndex === flashcards.length - 1 && styles.disabledButton]}
          onPress={nextCard}
          disabled={currentIndex === flashcards.length - 1}
        >
          <Text style={[styles.controlText, currentIndex === flashcards.length - 1 && styles.disabledText]}>Next</Text>
          <Ionicons
            name="chevron-forward"
            size={24}
            color={currentIndex === flashcards.length - 1 ? '#ccc' : '#4A90E2'}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
  },
  progress: {
    fontSize: 16,
    color: '#666',
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: width - 40,
    height: 400,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    backfaceVisibility: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  cardBack: {
    backgroundColor: '#F0F7FF',
  },
  cardText: {
    fontSize: 24,
    textAlign: 'center',
    color: '#333',
    marginBottom: 20,
  },
  tapHint: {
    position: 'absolute',
    bottom: 20,
    fontSize: 14,
    color: '#666',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#F0F7FF',
  },
  disabledButton: {
    backgroundColor: '#F5F5F5',
  },
  controlText: {
    fontSize: 16,
    color: '#4A90E2',
    marginHorizontal: 8,
  },
  disabledText: {
    color: '#ccc',
  },
}); 