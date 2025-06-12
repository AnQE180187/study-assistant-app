import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, FONTS, SIZES, SHADOWS } from '../../constants/theme';
import FlashcardService from '../../services/flashcardService';

export const CreateFlashcardScreen = () => {
  const navigation = useNavigation();
  const [noteId, setNoteId] = React.useState('');
  const [question, setQuestion] = React.useState('');
  const [answer, setAnswer] = React.useState('');
  const [difficulty, setDifficulty] = React.useState(1);

  const handleCreate = async () => {
    if (!noteId || !question || !answer) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      await FlashcardService.createFlashcard({
        noteId,
        question,
        answer,
        difficulty,
      });
      navigation.goBack();
    } catch (error) {
      console.error('Error creating flashcard:', error);
      Alert.alert('Error', 'Failed to create flashcard');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.label}>Note ID</Text>
        <TextInput
          style={styles.input}
          value={noteId}
          onChangeText={setNoteId}
          placeholder="Enter note ID"
          placeholderTextColor={COLORS.gray[400]}
        />

        <Text style={styles.label}>Question</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={question}
          onChangeText={setQuestion}
          placeholder="Enter question"
          placeholderTextColor={COLORS.gray[400]}
          multiline
          numberOfLines={4}
        />

        <Text style={styles.label}>Answer</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={answer}
          onChangeText={setAnswer}
          placeholder="Enter answer"
          placeholderTextColor={COLORS.gray[400]}
          multiline
          numberOfLines={6}
        />

        <Text style={styles.label}>Difficulty</Text>
        <View style={styles.difficultyContainer}>
          <TouchableOpacity
            style={[
              styles.difficultyButton,
              difficulty === 1 && styles.selectedDifficulty,
            ]}
            onPress={() => setDifficulty(1)}
          >
            <Text style={[
              styles.difficultyText,
              difficulty === 1 && styles.selectedDifficultyText,
            ]}>
              Easy
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.difficultyButton,
              difficulty === 2 && styles.selectedDifficulty,
            ]}
            onPress={() => setDifficulty(2)}
          >
            <Text style={[
              styles.difficultyText,
              difficulty === 2 && styles.selectedDifficultyText,
            ]}>
              Medium
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.difficultyButton,
              difficulty === 3 && styles.selectedDifficulty,
            ]}
            onPress={() => setDifficulty(3)}
          >
            <Text style={[
              styles.difficultyText,
              difficulty === 3 && styles.selectedDifficultyText,
            ]}>
              Hard
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.createButton} onPress={handleCreate}>
          <Text style={styles.createButtonText}>Create Flashcard</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  form: {
    padding: SIZES.padding,
  },
  label: {
    ...FONTS.medium,
    fontSize: SIZES.medium,
    marginBottom: SIZES.base,
    color: COLORS.gray[800],
  },
  input: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.gray[300],
    borderRadius: SIZES.radius,
    padding: SIZES.base,
    marginBottom: SIZES.padding,
    fontSize: SIZES.medium,
    color: COLORS.gray[900],
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  difficultyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SIZES.padding * 1.5,
  },
  difficultyButton: {
    flex: 1,
    padding: SIZES.base,
    borderRadius: SIZES.radius,
    marginHorizontal: SIZES.base / 2,
    alignItems: 'center',
    backgroundColor: COLORS.gray[100],
    borderWidth: 1,
    borderColor: COLORS.gray[300],
  },
  selectedDifficulty: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  difficultyText: {
    ...FONTS.medium,
    fontSize: SIZES.medium,
    color: COLORS.gray[800],
  },
  selectedDifficultyText: {
    color: COLORS.white,
  },
  createButton: {
    backgroundColor: COLORS.primary,
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    ...SHADOWS.light,
  },
  createButtonText: {
    color: COLORS.white,
    ...FONTS.bold,
    fontSize: SIZES.large,
  },
}); 