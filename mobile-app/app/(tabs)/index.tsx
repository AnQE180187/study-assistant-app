import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { FlashcardSet } from '../../types';

// Static data for testing
const FLASHCARD_SETS: FlashcardSet[] = [
  {
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
];

export default function HomeScreen() {
  const renderFlashcardSet = ({ item }: { item: FlashcardSet }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        router.push({
          pathname: '/flashcard/[id]',
          params: { id: item.id },
        })
      }
    >
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.cardFooter}>
          <View style={styles.category}>
            <Text style={styles.categoryText}>{item.category}</Text>
          </View>
          <Text style={styles.cardCount}>{item.cardCount} cards</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Study Materials</Text>
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/flashcard/new')}
          >
            <Ionicons name="add-circle-outline" size={24} color="#4A90E2" />
            <Text style={styles.actionButtonText}>Flashcards</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/notes/new')}
          >
            <Ionicons name="document-text-outline" size={24} color="#4A90E2" />
            <Text style={styles.actionButtonText}>Notes</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/schedules/new')}
          >
            <Ionicons name="calendar-outline" size={24} color="#4A90E2" />
            <Text style={styles.actionButtonText}>Schedule</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={FLASHCARD_SETS}
        renderItem={renderFlashcardSet}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  actionButtonText: {
    marginTop: 4,
    fontSize: 12,
    color: '#4A90E2',
    fontWeight: '600',
  },
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardContent: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  category: {
    backgroundColor: '#E8F0FE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryText: {
    color: '#4A90E2',
    fontSize: 12,
    fontWeight: '600',
  },
  cardCount: {
    fontSize: 12,
    color: '#666',
  },
});


