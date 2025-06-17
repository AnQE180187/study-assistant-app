import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { FlashcardSet, StudyMode } from '../../types';

// Static data for testing
const FLASHCARD_SETS: Record<string, FlashcardSet> = {
  '1': {
    id: '1',
    title: 'Basic Math',
    description: 'Basic arithmetic operations and concepts',
    category: 'Mathematics',
    isPublic: true,
    cardCount: 10,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'user1',
  },
  // Add more sets as needed
};

export default function FlashcardSetScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [selectedMode, setSelectedMode] = useState<StudyMode>('learn');

  const flashcardSet = FLASHCARD_SETS[id];

  if (!flashcardSet) {
    return (
      <View style={styles.container}>
        <Text>Flashcard set not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>{flashcardSet.title}</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.description}>{flashcardSet.description}</Text>

        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{flashcardSet.cardCount}</Text>
            <Text style={styles.statLabel}>Cards</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {new Date(flashcardSet.updatedAt).toLocaleDateString()}
            </Text>
            <Text style={styles.statLabel}>Last Updated</Text>
          </View>
        </View>

        <View style={styles.categories}>
          <Text style={styles.categoryLabel}>Category:</Text>
          <View style={styles.category}>
            <Text style={styles.categoryText}>{flashcardSet.category}</Text>
          </View>
        </View>

        <View style={styles.studyOptions}>
          <Text style={styles.sectionTitle}>Study Options</Text>
          <View style={styles.modeButtons}>
            <TouchableOpacity
              style={[
                styles.modeButton,
                selectedMode === 'learn' && styles.selectedMode,
              ]}
              onPress={() => setSelectedMode('learn')}
            >
              <Text
                style={[
                  styles.modeButtonText,
                  selectedMode === 'learn' && styles.selectedModeText,
                ]}
              >
                Learn
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.modeButton,
                selectedMode === 'quiz' && styles.selectedMode,
              ]}
              onPress={() => setSelectedMode('quiz')}
            >
              <Text
                style={[
                  styles.modeButtonText,
                  selectedMode === 'quiz' && styles.selectedModeText,
                ]}
              >
                Quiz
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.studyButton}
            onPress={() =>
              router.push({
                pathname: '/flashcard/study/[id]',
                params: { id, mode: selectedMode },
              })
            }
          >
            <Text style={styles.studyButtonText}>Start Studying</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.addButton}
            onPress={() =>
              router.push({
                pathname: '/flashcard/[id]/new',
                params: { id },
              })
            }
          >
            <Ionicons name="add" size={24} color="#fff" />
            <Text style={styles.addButtonText}>Add Cards</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    padding: 16,
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  stats: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4A90E2',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  categories: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  categoryLabel: {
    fontSize: 16,
    color: '#333',
    marginRight: 8,
  },
  category: {
    backgroundColor: '#E8F0FE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryText: {
    color: '#4A90E2',
    fontSize: 14,
  },
  studyOptions: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  modeButtons: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 4,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  selectedMode: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  modeButtonText: {
    fontSize: 16,
    color: '#666',
  },
  selectedModeText: {
    color: '#4A90E2',
    fontWeight: '600',
  },
  actionButtons: {
    gap: 12,
  },
  studyButton: {
    backgroundColor: '#4A90E2',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  studyButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  addButton: {
    backgroundColor: '#4A90E2',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
}); 