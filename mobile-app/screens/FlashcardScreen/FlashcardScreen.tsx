import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
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

export const FlashcardScreen = () => {
  const navigation = useNavigation();
  const [flashcards, setFlashcards] = React.useState<Flashcard[]>([]);
  const [refreshing, setRefreshing] = React.useState(false);

  const loadFlashcards = async () => {
    try {
      const data = await FlashcardService.getFlashcards();
      setFlashcards(data);
    } catch (error) {
      console.error('Error loading flashcards:', error);
    }
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await loadFlashcards();
    setRefreshing(false);
  }, []);

  React.useEffect(() => {
    loadFlashcards();
  }, []);

  const renderFlashcard = ({ item }: { item: Flashcard }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('FlashcardDetail', { id: item.id })}
    >
      <Text style={styles.question}>{item.question}</Text>
      <View style={styles.cardFooter}>
        <Text style={styles.difficulty}>
          Difficulty: {item.difficulty}
        </Text>
        {item.nextReview && (
          <Text style={styles.nextReview}>
            Next Review: {new Date(item.nextReview).toLocaleDateString()}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Flashcards</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('CreateFlashcard')}
        >
          <Text style={styles.addButtonText}>+ New Flashcard</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={flashcards}
        renderItem={renderFlashcard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: SIZES.padding,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  title: {
    ...FONTS.bold,
    fontSize: SIZES.extraLarge,
    marginBottom: SIZES.base,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    padding: SIZES.base,
    borderRadius: SIZES.radius,
    alignItems: 'center',
  },
  addButtonText: {
    color: COLORS.white,
    ...FONTS.medium,
    fontSize: SIZES.medium,
  },
  list: {
    padding: SIZES.padding,
  },
  card: {
    backgroundColor: COLORS.white,
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.base,
    ...SHADOWS.light,
  },
  question: {
    ...FONTS.medium,
    fontSize: SIZES.large,
    marginBottom: SIZES.base,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  difficulty: {
    ...FONTS.regular,
    fontSize: SIZES.small,
    color: COLORS.gray[600],
  },
  nextReview: {
    ...FONTS.regular,
    fontSize: SIZES.small,
    color: COLORS.gray[600],
  },
}); 