import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";
import colors from "../../constants/colors";
import FlashcardItem from "../../components/FlashcardItem";
import {
  Flashcard,
  getFlashcardsByNote,
} from "../../services/flashcardService";

const { width } = Dimensions.get("window");

type FlashcardStackParamList = {
  FlashcardPractice: {
    noteId: string;
    title: string;
    flashcards?: Flashcard[];
  };
};

type NavigationProp = StackNavigationProp<
  FlashcardStackParamList,
  "FlashcardPractice"
>;
type RouteProp1 = RouteProp<FlashcardStackParamList, "FlashcardPractice">;

interface RouteParams {
  noteId: string;
  title: string;
  flashcards?: Flashcard[];
}

type DifficultyRating = "easy" | "medium" | "hard";

const FlashcardPracticeScreen: React.FC = () => {
  const route = useRoute<RouteProp1>();
  const navigation = useNavigation<NavigationProp>();
  const { noteId, title, flashcards: routeFlashcards } = route.params;
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isShuffled, setIsShuffled] = useState(false);
  const [completedCards, setCompletedCards] = useState<Set<string>>(new Set());
  const [ratings, setRatings] = useState<Record<string, DifficultyRating>>({});
  const [loading, setLoading] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);

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
      const cards = await getFlashcardsByNote(noteId);
      setFlashcards(cards);
    } catch (error) {
      Alert.alert("Lỗi", "Không thể tải flashcards");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const handleShuffle = () => {
    const shuffled = shuffleArray(flashcards);
    setFlashcards(shuffled);
    setCurrentIndex(0);
    setIsShuffled(!isShuffled);
  };
  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowAnswer(false); // Reset answer view for next card
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowAnswer(false); // Reset answer view for previous card
    }
  };

  const toggleAnswer = () => {
    setShowAnswer(!showAnswer);
  };
  const handleRating = (rating: DifficultyRating) => {
    const currentCard = flashcards[currentIndex];
    setRatings((prev) => ({ ...prev, [currentCard.id]: rating }));
    setCompletedCards((prev) => new Set([...prev, currentCard.id]));

    // Auto advance to next card and reset answer view
    setTimeout(() => {
      if (currentIndex < flashcards.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setShowAnswer(false);
      } else {
        // Show completion screen
        showCompletionSummary();
      }
    }, 500);
  };

  const showCompletionSummary = () => {
    const easyCards = Object.values(ratings).filter((r) => r === "easy").length;
    const mediumCards = Object.values(ratings).filter(
      (r) => r === "medium"
    ).length;
    const hardCards = Object.values(ratings).filter((r) => r === "hard").length;

    Alert.alert(
      "Hoàn thành!",
      `Bạn đã hoàn thành ${completedCards.size}/${flashcards.length} thẻ\n\n` +
        `Dễ: ${easyCards} thẻ\n` +
        `Trung bình: ${mediumCards} thẻ\n` +
        `Khó: ${hardCards} thẻ`,
      [
        { text: "Luyện lại", onPress: resetSession },
        { text: "Quay lại", onPress: () => navigation.goBack() },
      ]
    );
  };
  const resetSession = () => {
    setCurrentIndex(0);
    setCompletedCards(new Set());
    setRatings({});
    setShowAnswer(false);
  };

  const handleExit = () => {
    Alert.alert("Thoát luyện tập?", "Tiến độ của bạn sẽ không được lưu lại", [
      { text: "Hủy", style: "cancel" },
      { text: "Thoát", onPress: () => navigation.goBack() },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Đang tải...</Text>
      </View>
    );
  }
  if (flashcards.length === 0) {
    return (
      <View style={styles.container}>
        {" "}
        <Text style={styles.emptyText}>
          Không có flashcard nào để luyện tập
        </Text>
        <TouchableOpacity
          style={[
            styles.emptyBackButton,
            {
              backgroundColor: "#FFA726",
              paddingHorizontal: 24,
              paddingVertical: 12,
              borderRadius: 24,
            },
          ]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentCard = flashcards[currentIndex];
  const progress = ((currentIndex + 1) / flashcards.length) * 100;
  const isCompleted = completedCards.has(currentCard.id);
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleExit} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
      </View>

      {/* Main Card Container */}
      <View style={styles.mainCardContainer}>
        {/* Card */}
        <View style={styles.practiceCard}>
          <View style={styles.cardContent}>
            <Text style={styles.cardText}>
              {showAnswer ? currentCard.answer : currentCard.question}
            </Text>
          </View>{" "}
          {/* Navigation arrows */}
          <View style={styles.cardNavigation}>
            <TouchableOpacity
              style={[
                styles.navButton,
                currentIndex === 0 && styles.navButtonDisabled,
              ]}
              onPress={handlePrevious}
              disabled={currentIndex === 0}
            >
              <Text style={styles.navButtonText}>‹</Text>
            </TouchableOpacity>
            <Text style={styles.cardCounter}>
              {currentIndex + 1}/{flashcards.length}
            </Text>
            <TouchableOpacity
              style={[
                styles.navButton,
                currentIndex === flashcards.length - 1 &&
                  styles.navButtonDisabled,
              ]}
              onPress={handleNext}
              disabled={currentIndex === flashcards.length - 1}
            >
              <Text style={styles.navButtonText}>›</Text>
            </TouchableOpacity>{" "}
          </View>
        </View>

        {/* Show Answer Button */}
        <TouchableOpacity
          style={styles.showAnswerButton}
          onPress={toggleAnswer}
        >
          <Text style={styles.showAnswerText}>
            {showAnswer ? "Show Question" : "Show Answer"}
          </Text>{" "}
        </TouchableOpacity>

        {/* Rating Buttons - Only show when answer is visible */}
        {showAnswer && (
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingTitle}>How difficult was this card?</Text>
            <View style={styles.ratingButtons}>
              <TouchableOpacity
                style={[styles.ratingButton, styles.easyButton]}
                onPress={() => handleRating("easy")}
              >
                <Text style={styles.ratingButtonText}>Easy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.ratingButton, styles.mediumButton]}
                onPress={() => handleRating("medium")}
              >
                <Text style={styles.ratingButtonText}>Medium</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.ratingButton, styles.hardButton]}
                onPress={() => handleRating("hard")}
              >
                <Text style={styles.ratingButtonText}>Hard</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  backButton: {
    marginRight: 16,
  },
  backText: {
    fontSize: 24,
    color: "#333",
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  mainCardContainer: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  practiceCard: {
    backgroundColor: "#4A5D23", // Dark green color like in design
    borderRadius: 16,
    padding: 40,
    minHeight: 300,
    justifyContent: "center",
    marginBottom: 40,
  },
  cardContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  cardText: {
    fontSize: 20,
    color: "#fff",
    textAlign: "center",
    lineHeight: 28,
    fontWeight: "500",
  },
  cardNavigation: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
  },
  navButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  navButtonDisabled: {
    opacity: 0.3,
  },
  navButtonText: {
    fontSize: 24,
    color: "#fff",
    fontWeight: "bold",
  },
  cardCounter: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "500",
  },
  showAnswerButton: {
    backgroundColor: "#4CAF50", // Green color like in design
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: "center",
  },
  showAnswerText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  ratingContainer: {
    marginTop: 20,
    padding: 20,
  },
  ratingTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
    marginBottom: 16,
  },
  ratingButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  ratingButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 4,
  },
  easyButton: {
    backgroundColor: "#4CAF50",
  },
  mediumButton: {
    backgroundColor: "#FF9800",
  },
  hardButton: {
    backgroundColor: "#F44336",
  },
  ratingButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  emptyText: {
    fontSize: 18,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  emptyBackButton: {
    alignSelf: "center",
  },
  backButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default FlashcardPracticeScreen;
