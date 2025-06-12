import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS, FONTS, SIZES, SHADOWS } from '../../constants/theme';
import FlashcardService from '../../services/flashcardService';

interface Flashcard {
  id: string;
  noteId: string;
  question: string;
  answer: string;
  difficulty: number;
  lastReviewed?: Date;
  nextReview?: Date;
}

export const FlashcardDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { id } = route.params as { id: string };
  const [flashcard, setFlashcard] = React.useState<Flashcard | null>(null);
  const [showAnswer, setShowAnswer] = React.useState(false);

  const loadFlashcard = async () => {
    try {
      const data = await FlashcardService.getFlashcard(id);
      setFlashcard(data);
    } catch (error) {
      console.error('Error loading flashcard:', error);
      Alert.alert('Error', 'Failed to load flashcard');
    }
  };

  const handleDifficultyUpdate = async (difficulty: number) => {
    try {
      await FlashcardService.updateReviewStatus(id, difficulty);
      navigation.goBack();
    } catch (error) {
      console.error('Error updating review status:', error);
      Alert.alert('Error', 'Failed to update review status');
    }
  };

  React.useEffect(() => {
    loadFlashcard();
  }, [id]);

  if (!flashcard) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.question}>{flashcard.question}</Text>
        <TouchableOpacity
          style={styles.showAnswerButton}
          onPress={() => setShowAnswer(!showAnswer)}
        >
          <Text style={styles.showAnswerText}>
            {showAnswer ? 'Hide Answer' : 'Show Answer'}
          </Text>
        </TouchableOpacity>
        
        {showAnswer && (
          <View style={styles.answerContainer}>
            <Text style={styles.answer}>{flashcard.answer}</Text>
          </View>
        )}

        <View style={styles.difficultyContainer}>
          <Text style={styles.difficultyTitle}>How well did you know this?</Text>
          <View style={styles.difficultyButtons}>
            <TouchableOpacity
              style={[styles.difficultyButton, styles.easyButton]}
              onPress={() => handleDifficultyUpdate(1)}
            >
              <Text style={styles.buttonText}>Easy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.difficultyButton, styles.mediumButton]}
              onPress={() => handleDifficultyUpdate(2)}
            >
              <Text style={styles.buttonText}>Medium</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.difficultyButton, styles.hardButton]}
              onPress={() => handleDifficultyUpdate(3)}
            >
              <Text style={styles.buttonText}>Hard</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  card: {
    backgroundColor: COLORS.white,
    margin: SIZES.margin,
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    ...SHADOWS.medium,
  },
  question: {
    ...FONTS.bold,
    fontSize: SIZES.extraLarge,
    marginBottom: SIZES.padding,
  },
  showAnswerButton: {
    backgroundColor: COLORS.primary,
    padding: SIZES.base,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    marginBottom: SIZES.padding,
  },
  showAnswerText: {
    color: COLORS.white,
    ...FONTS.medium,
    fontSize: SIZES.medium,
  },
  answerContainer: {
    backgroundColor: COLORS.gray[100],
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.padding,
  },
  answer: {
    ...FONTS.regular,
    fontSize: SIZES.large,
    lineHeight: SIZES.extraLarge,
  },
  difficultyContainer: {
    marginTop: SIZES.padding,
  },
  difficultyTitle: {
    ...FONTS.medium,
    fontSize: SIZES.large,
    marginBottom: SIZES.base,
    textAlign: 'center',
  },
  difficultyButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  difficultyButton: {
    flex: 1,
    padding: SIZES.base,
    borderRadius: SIZES.radius,
    marginHorizontal: SIZES.base / 2,
    alignItems: 'center',
  },
  easyButton: {
    backgroundColor: COLORS.success,
  },
  mediumButton: {
    backgroundColor: COLORS.warning,
  },
  hardButton: {
    backgroundColor: COLORS.danger,
  },
  buttonText: {
    color: COLORS.white,
    ...FONTS.medium,
    fontSize: SIZES.medium,
  },
}); 