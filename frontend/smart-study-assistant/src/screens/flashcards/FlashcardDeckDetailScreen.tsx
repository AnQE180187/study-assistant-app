import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";
import colors from "../../constants/colors";
import FlashcardItem from "../../components/FlashcardItem";
import {
  Flashcard,
  getFlashcardsByNote,
  deleteFlashcard,
  generateFlashcardsFromNote,
} from "../../services/flashcardService";
import { useTranslation } from 'react-i18next';

type FlashcardStackParamList = {
  FlashcardDeckDetail: { noteId: string; title: string };
  FlashcardPractice: { noteId: string; title: string; flashcards: Flashcard[] };
  CreateFlashcard: { noteId?: string; onCreated?: () => void };
  EditFlashcard: { flashcard: Flashcard; onUpdate?: () => void };
};

type NavigationProp = StackNavigationProp<
  FlashcardStackParamList,
  "FlashcardDeckDetail"
>;
type RouteProp1 = RouteProp<FlashcardStackParamList, "FlashcardDeckDetail">;

interface RouteParams {
  noteId: string;
  title: string;
}

const FlashcardDeckDetailScreen: React.FC = () => {
  const { t } = useTranslation();
  const route = useRoute<RouteProp1>();
  const navigation = useNavigation<NavigationProp>();
  const { noteId, title } = route.params;

  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadFlashcards = async () => {
    try {
      const cards = await getFlashcardsByNote(noteId);
      setFlashcards(cards);
    } catch (error) {
      Alert.alert("Lỗi", "Không thể tải flashcards");
      console.error("Error loading flashcards:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadFlashcards();
  }, []);
  const handleEdit = (flashcard: Flashcard) => {
    navigation.navigate("EditFlashcard", {
      flashcard,
      onUpdate: loadFlashcards,
    });
  };

  const handleDelete = (flashcard: Flashcard) => {
    Alert.alert("Xóa flashcard", "Bạn có chắc chắn muốn xóa flashcard này?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteFlashcard(flashcard.id);
            setFlashcards((prev) =>
              prev.filter((card) => card.id !== flashcard.id)
            );
            Alert.alert("Thành công", "Đã xóa flashcard");
          } catch (error) {
            Alert.alert("Lỗi", "Không thể xóa flashcard");
          }
        },
      },
    ]);
  };

  const handleGenerateFromAI = () => {
    Alert.alert(
      t('flashcards.ai_title'),
      t('flashcards.ai_confirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.confirm'),
          onPress: async () => {
            try {
              setLoading(true);
              await generateFlashcardsFromNote(noteId);
              await loadFlashcards();
              Alert.alert(t('flashcards.success'), t('flashcards.ai_generate_success'));
            } catch (error) {
              Alert.alert(t('flashcards.error'), t('flashcards.ai_error'));
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };
  const handleCreateManual = () => {
    navigation.navigate("CreateFlashcard", {
      noteId,
      onCreated: loadFlashcards,
    });
  };

  const handlePractice = () => {
    if (flashcards.length === 0) {
      Alert.alert(t('common.info'), t('flashcards.noFlashcards'));
      return;
    }
    navigation.navigate("FlashcardPractice", {
      noteId,
      title,
      flashcards,
    });
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadFlashcards();
  };

  const renderFlashcard = ({ item }: { item: Flashcard }) => (
    <FlashcardItem
      question={item.term}
      answer={item.definition}
      showActions={true}
      onEdit={() => handleEdit(item)}
      onDelete={() => handleDelete(item)}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>{t('flashcards.noFlashcards')}</Text>
      <Text style={styles.emptySubtitle}>{t('flashcards.emptySubtitle')}</Text>
      <View style={styles.emptyActions}>
        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreateManual}
        >
          <Text style={styles.createButtonText}>{t('flashcards.createManual')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.aiButton}
          onPress={handleGenerateFromAI}
        >
          <Text style={styles.aiButtonText}>{t('flashcards.createAI')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>← {t('common.back')}</Text>
          </TouchableOpacity>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>{t('common.loading')}</Text>
        </View>
      </View>
    );
  }
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
      </View>

      <View style={styles.mainOptions}>
        <TouchableOpacity style={styles.optionButton} onPress={handlePractice}>
          <Text style={styles.optionButtonText}>{t('flashcards.studyMode')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.optionButton}
          onPress={() => {
            navigation.navigate("FlashcardManagement" as any, {
              noteId,
              title,
            });
          }}
        >
          <Text style={styles.optionButtonText}>{t('flashcards.manageFlashcards')}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.editButton} onPress={handleCreateManual}>
        <Text style={styles.editButtonText}>{t('common.edit')}</Text>
      </TouchableOpacity>
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
    fontSize: 16,
    color: colors.primary,
    fontWeight: "600",
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
    textAlign: "center",
    marginHorizontal: 12,
  },
  practiceButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  practiceButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  stats: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  statsText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  actions: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  aiActionButton: {
    backgroundColor: colors.secondary,
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  listContainer: {
    padding: 20,
    paddingTop: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 12,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
  },
  emptyActions: {
    flexDirection: "row",
    gap: 12,
  },
  createButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
  },
  createButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  aiButton: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
  },
  aiButtonText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "600",
  },
  mainOptions: {
    paddingHorizontal: 20,
    paddingVertical: 40,
    gap: 20,
  },
  optionButton: {
    backgroundColor: "#FFE082", // Yellow color like in design
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
  },
  optionButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  editButton: {
    backgroundColor: "#333",
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 40,
  },
  editButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 1,
  },
});

export default FlashcardDeckDetailScreen;
