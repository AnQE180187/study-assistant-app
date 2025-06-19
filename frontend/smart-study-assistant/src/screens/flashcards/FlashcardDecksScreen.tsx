import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  TextInput,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import colors from "../../constants/colors";
import DeckCard from "../../components/DeckCard";
import CreateDeckModal from "../../components/CreateDeckModal";
import {
  getFlashcardDecks,
  FlashcardDeck,
} from "../../services/flashcardService";

type FlashcardStackParamList = {
  FlashcardDecks: undefined;
  FlashcardDeckDetail: { noteId: string; title: string };
  FlashcardPractice: { noteId: string; title: string; flashcards: any[] };
  CreateFlashcard: { noteId?: string; onCreated?: () => void };
  NotesSelection: undefined;
};

type NavigationProp = StackNavigationProp<FlashcardStackParamList>;

const FlashcardDecksScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [decks, setDecks] = useState<FlashcardDeck[]>([]);
  const [filteredDecks, setFilteredDecks] = useState<FlashcardDeck[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const loadDecks = async () => {
    try {
      const flashcardDecks = await getFlashcardDecks();
      setDecks(flashcardDecks);
      setFilteredDecks(flashcardDecks);
    } catch (error) {
      Alert.alert("Lỗi", "Không thể tải danh sách bộ flashcards");
      console.error("Error loading decks:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  useEffect(() => {
    loadDecks();
  }, []);
  // Search functionality
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === "") {
      setFilteredDecks(decks);
    } else {
      const filtered = decks.filter(
        (deck) =>
          deck.noteTitle.toLowerCase().includes(query.toLowerCase()) ||
          deck.category?.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredDecks(filtered);
    }
  };
  const handleDeckPress = (deck: FlashcardDeck) => {
    // Navigate to deck details/edit screen
    navigation.navigate("FlashcardDeckDetail", {
      noteId: deck.noteId,
      title: deck.noteTitle,
    });
  };

  const handlePractice = (deck: FlashcardDeck) => {
    if (deck.totalCards === 0) {
      Alert.alert("Thông báo", "Bộ flashcard này chưa có thẻ nào để luyện tập");
      return;
    }
    // Navigate to practice screen
    navigation.navigate("FlashcardPractice", {
      noteId: deck.noteId,
      title: deck.noteTitle,
      flashcards: deck.flashcards,
    });
  };
  const handleCreateNew = () => {
    setShowCreateModal(true);
  };

  const handleCreateDeck = (name: string, description: string) => {
    // TODO: Implement actual deck creation
    console.log("Creating deck:", { name, description });
    Alert.alert("Success", "Deck created successfully!");
    loadDecks(); // Refresh the list
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDecks();
  };

  const renderDeck = ({ item }: { item: FlashcardDeck }) => (
    <DeckCard
      title={item.noteTitle}
      category={item.category}
      totalCards={item.totalCards}
      onPress={() => handleDeckPress(item)}
      onPractice={() => handlePractice(item)}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>Chưa có bộ flashcard nào</Text>
      <Text style={styles.emptySubtitle}>
        Tạo flashcard từ ghi chú của bạn để bắt đầu học tập hiệu quả
      </Text>
      <TouchableOpacity style={styles.createButton} onPress={handleCreateNew}>
        <Text style={styles.createButtonText}>Tạo flashcard đầu tiên</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Bộ Flashcards</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </View>
    );
  }
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Flashcards</Text>
      </View>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons
            name="search"
            size={20}
            color="#999"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search your set of flashcards"
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>
      </View>
      <FlatList
        data={filteredDecks}
        renderItem={renderDeck}
        keyExtractor={(item) => item.noteId}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={renderEmptyState}
      />
      {/* Floating Add Button */}
      <TouchableOpacity style={styles.floatingButton} onPress={handleCreateNew}>
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>
      {/* Create Deck Modal */}
      <CreateDeckModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateDeck}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  searchButtonText: {
    fontSize: 20,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  addButtonText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
  listContainer: {
    padding: 20,
    paddingTop: 0,
    paddingBottom: 100,
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
  createButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  createButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  floatingButton: {
    position: "absolute",
    bottom: 30,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FFA726",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
});

export default FlashcardDecksScreen;
