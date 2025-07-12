import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  Animated,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import {
  Flashcard,
  getFlashcardsByDeck,
  getPublicFlashcardsByDeck,
} from "../../services/flashcardService";

const { width, height } = Dimensions.get("window");

type FlashcardStackParamList = {
  FlashcardPractice: {
    deckId: string;
    title: string;
    flashcards?: Flashcard[];
    isPublic?: boolean;
  };
};

type NavigationProp = StackNavigationProp<
  FlashcardStackParamList,
  "FlashcardPractice"
>;
type RouteProp1 = RouteProp<FlashcardStackParamList, "FlashcardPractice">;

interface RouteParams {
  deckId: string;
  title: string;
  flashcards?: Flashcard[];
  isPublic?: boolean;
}

type DifficultyRating = "easy" | "medium" | "hard";

const FlashcardPracticeScreen: React.FC = () => {
  const { t } = useTranslation();
  const { currentTheme } = useTheme();
  const route = useRoute<RouteProp1>();
  const navigation = useNavigation<NavigationProp>();
  const { deckId, title, flashcards: routeFlashcards, isPublic } = route.params;
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showBack, setShowBack] = useState(false);
  const [results, setResults] = useState<Record<string, 'correct' | 'wrong'>>({});
  const [shuffled, setShuffled] = useState(false);
  const flipAnim = useRef(new Animated.Value(0)).current;
  const [flipDeg, setFlipDeg] = useState(0);
  const [completedCards, setCompletedCards] = useState<Set<string>>(new Set());
  const [ratings, setRatings] = useState<Record<string, DifficultyRating>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (routeFlashcards) {
      setFlashcards(routeFlashcards);
    } else {
      loadFlashcards();
    }
  }, []);

  const loadFlashcards = async () => {
    setLoading(true);
    try {
      let cards;
      if (isPublic) {
        cards = await getPublicFlashcardsByDeck(deckId);
      } else {
        cards = await getFlashcardsByDeck(deckId);
      }
      setFlashcards(cards);
    } catch (error: any) {
      Alert.alert(t('flashcards.error'), error.message || t('flashcards.loadError'));
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const currentCard = flashcards[currentIndex];

  // Flip card chuẩn Quizlet
  const flipCard = () => {
    Animated.timing(flipAnim, {
      toValue: showBack ? 0 : 1,
      duration: 400,
      useNativeDriver: true,
    }).start(() => setShowBack(!showBack));
  };

  const frontInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });
  const backInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });
  const frontOpacity = flipAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0, 0],
  });
  const backOpacity = flipAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0, 1],
  });

  // Progress
  const progress = `${currentIndex + 1} / ${flashcards.length}`;

  // Đánh giá đúng/sai
  const handleResult = (type: 'correct' | 'wrong') => {
    setResults({ ...results, [currentCard.id]: type });
    if (currentIndex < flashcards.length - 1) {
      setShowBack(false);
      flipAnim.setValue(0);
      setCurrentIndex(currentIndex + 1);
    } else {
      showCompletionSummary();
    }
  };

  // Chuyển thẻ
  const handlePrev = () => {
    if (currentIndex > 0) {
      setShowBack(false);
      flipAnim.setValue(0);
      setCurrentIndex(currentIndex - 1);
    }
  };
  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setShowBack(false);
      flipAnim.setValue(0);
      setCurrentIndex(currentIndex + 1);
    }
  };

  // Shuffle
  const handleShuffle = () => {
    setShuffled(true);
    setShowBack(false);
    flipAnim.setValue(0);
    // Đảo mảng đơn giản (demo)
    const shuffledCards = [...flashcards].sort(() => Math.random() - 0.5);
    setFlashcards(shuffledCards);
    setCurrentIndex(0);
  };

  const showCompletionSummary = () => {
    const correctAnswers = Object.values(results).filter((result) => result === 'correct').length;
    const totalQuestions = flashcards.length;
    const correctPercentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

    Alert.alert(
      t('flashcards.completed'),
      t('flashcards.result', { correct: correctAnswers, total: totalQuestions, percentage: correctPercentage }),
      [
        { text: t('flashcards.practiceAgain'), onPress: resetSession },
        { text: t('flashcards.goBack'), onPress: () => navigation.goBack() },
      ]
    );
  };
  const resetSession = () => {
    setCurrentIndex(0);
    setCompletedCards(new Set());
    setRatings({});
    setResults({});
    setShowBack(false);
    flipAnim.setValue(0);
  };

  const handleExit = () => {
    Alert.alert(t('flashcards.exitConfirm'), t('flashcards.exitWarning'), [
      { text: t('common.cancel'), style: "cancel" },
      { text: t('flashcards.exit'), onPress: () => navigation.goBack() },
    ]);
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: currentTheme.colors.background }]}>
        <Text style={[styles.loadingText, { color: currentTheme.colors.textSecondary }]}>{t('flashcards.loading')}</Text>
      </View>
    );
  }
  if (flashcards.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: currentTheme.colors.background }]}>
        <Text style={[styles.emptyText, { color: currentTheme.colors.textSecondary }]}>
          {t('flashcards.noFlashcards')}
        </Text>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: currentTheme.colors.primary }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>{t('flashcards.goBack')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleExit} style={styles.exitButton}>
          <Ionicons name="close" size={24} color={currentTheme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: currentTheme.colors.text }]} numberOfLines={1}>{title}</Text>
        <TouchableOpacity onPress={handleShuffle} style={styles.shuffleButton}>
          <Ionicons name="shuffle" size={24} color={currentTheme.colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Progress */}
      <View style={styles.progressContainer}>
        <Text style={[styles.progressText, { color: currentTheme.colors.text }]}>{progress}</Text>
        <View style={[styles.progressBar, { backgroundColor: currentTheme.colors.border }]}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${((currentIndex + 1) / flashcards.length) * 100}%`,
                backgroundColor: currentTheme.colors.primary
              }
            ]}
          />
        </View>
      </View>

      {/* Flashcard */}
      <View style={styles.cardContainer}>
        <TouchableOpacity onPress={flipCard} style={styles.cardWrapper}>
          <Animated.View
            style={[
              styles.card,
              styles.cardFront,
              { backgroundColor: currentTheme.colors.card },
              {
                transform: [{ rotateY: frontInterpolate }],
                opacity: frontOpacity,
              },
            ]}
          >
            <Text style={[styles.cardText, { color: currentTheme.colors.text }]}>{currentCard?.term}</Text>
            <Text style={[styles.cardHint, { color: currentTheme.colors.textSecondary }]}>{t('flashcards.pressToShowDefinition')}</Text>
          </Animated.View>
          <Animated.View
            style={[
              styles.card,
              styles.cardBack,
              { backgroundColor: currentTheme.colors.primary },
              {
                transform: [{ rotateY: backInterpolate }],
                opacity: backOpacity,
              },
            ]}
          >
            <Text style={[styles.cardText, { color: currentTheme.colors.onPrimary }]}>{currentCard?.definition}</Text>
            <Text style={[styles.cardHint, { color: currentTheme.colors.onPrimary + '80' }]}>{t('flashcards.pressToShowTerm')}</Text>
          </Animated.View>
        </TouchableOpacity>
      </View>

      {/* Navigation */}
      <View style={styles.navigation}>
        <TouchableOpacity
          onPress={handlePrev}
          disabled={currentIndex === 0}
          style={[styles.navButton, { backgroundColor: currentTheme.colors.card }, currentIndex === 0 && styles.navButtonDisabled]}
        >
          <Ionicons name="chevron-back" size={24} color={currentIndex === 0 ? currentTheme.colors.textSecondary : currentTheme.colors.text} />
        </TouchableOpacity>

        <View style={styles.resultButtons}>
          <TouchableOpacity
            style={[styles.resultButton, styles.wrongButton]}
            onPress={() => handleResult('wrong')}
          >
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.resultButton, styles.correctButton]}
            onPress={() => handleResult('correct')}
          >
            <Ionicons name="checkmark" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={handleNext}
          disabled={currentIndex === flashcards.length - 1}
          style={[styles.navButton, { backgroundColor: currentTheme.colors.card }, currentIndex === flashcards.length - 1 && styles.navButtonDisabled]}
        >
          <Ionicons name="chevron-forward" size={24} color={currentIndex === flashcards.length - 1 ? currentTheme.colors.textSecondary : currentTheme.colors.text} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginHorizontal: 16,
  },
  exitButton: {
    padding: 8,
  },
  shuffleButton: {
    padding: 8,
  },
  progressContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  progressText: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
  cardContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  cardWrapper: {
    width: "100%",
    height: 300,
  },
  card: {
    width: "100%",
    height: "100%",
    borderRadius: 16,
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    backfaceVisibility: "hidden",
  },
  cardFront: {
    position: "absolute",
  },
  cardBack: {
    position: "absolute",
  },
  cardText: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 28,
  },
  cardHint: {
    fontSize: 14,
    marginTop: 16,
    textAlign: "center",
  },
  navigation: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  navButton: {
    padding: 12,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  resultButtons: {
    flexDirection: "row",
    gap: 16,
  },
  resultButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  wrongButton: {
    backgroundColor: "#ff4757",
  },
  correctButton: {
    backgroundColor: "#2ed573",
  },
  loadingText: {
    fontSize: 18,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 20,
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  backButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
});

export default FlashcardPracticeScreen;
