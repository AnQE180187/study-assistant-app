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
import { COLORS, SIZES } from '../../constants/themes';
import {
  Flashcard,
  getFlashcardsByNote,
} from "../../services/flashcardService";

const { width, height } = Dimensions.get("window");

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
      const cards = await getFlashcardsByNote(noteId);
      setFlashcards(cards);
    } catch (error) {
      Alert.alert("Lỗi", "Không thể tải flashcards");
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
    setShowBack(false);
    flipAnim.setValue(0);
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleExit} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <TouchableOpacity onPress={handleShuffle} style={styles.iconBtn}>
          <Ionicons name="shuffle" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
      <View style={styles.cardWrap}>
        <TouchableOpacity activeOpacity={0.9} onPress={flipCard}>
          <View style={{ width: width * 0.8, height: height * 0.5 }}>
            {/* Mặt trước */}
            <Animated.View style={[styles.card, {
              transform: [{ rotateY: frontInterpolate }],
              opacity: frontOpacity,
              zIndex: showBack ? 0 : 1,
            }]}> 
              <Text style={styles.cardText}>{currentCard.question}</Text>
            </Animated.View>
            {/* Mặt sau */}
            <Animated.View style={[styles.card, styles.cardBack, {
              transform: [{ rotateY: backInterpolate }],
              opacity: backOpacity,
              zIndex: showBack ? 1 : 0,
            }]}> 
              <Text style={styles.cardText}>{currentCard.answer}</Text>
            </Animated.View>
          </View>
        </TouchableOpacity>
        <Text style={styles.flipHint}>Chạm vào thẻ để lật</Text>
      </View>
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.actionBtn} onPress={handlePrev} disabled={currentIndex === 0}>
          <Ionicons name="arrow-back" size={22} color={currentIndex === 0 ? COLORS.border : COLORS.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.resultBtn, { backgroundColor: COLORS.success }]} onPress={() => handleResult('correct')}>
          <Ionicons name="checkmark" size={22} color="#fff" />
          <Text style={styles.resultText}>Đúng</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.resultBtn, { backgroundColor: COLORS.error }]} onPress={() => handleResult('wrong')}>
          <Ionicons name="close" size={22} color="#fff" />
          <Text style={styles.resultText}>Sai</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={handleNext} disabled={currentIndex === flashcards.length - 1}>
          <Ionicons name="arrow-forward" size={22} color={currentIndex === flashcards.length - 1 ? COLORS.border : COLORS.primary} />
        </TouchableOpacity>
      </View>
      <Text style={styles.progress}>{progress}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SIZES.padding,
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
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
  iconBtn: {
    padding: 8,
  },
  cardWrap: {
    alignItems: 'center',
    marginBottom: 24,
  },
  card: {
    width: width * 0.8,
    height: height * 0.5,
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    position: 'absolute',
    backfaceVisibility: 'hidden',
    padding: 20,
  },
  cardBack: {
    backgroundColor: COLORS.primaryLight,
  },
  cardText: {
    fontSize: 26,
    color: COLORS.text,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingHorizontal: 12,
  },
  flipHint: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginTop: 10,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  actionBtn: {
    padding: 12,
    borderRadius: 999,
    backgroundColor: COLORS.card,
    marginHorizontal: 8,
  },
  resultBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 10,
    marginHorizontal: 8,
  },
  resultText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 6,
    fontSize: 16,
  },
  progress: {
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
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
