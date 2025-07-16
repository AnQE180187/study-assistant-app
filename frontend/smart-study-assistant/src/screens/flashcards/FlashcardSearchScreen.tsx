import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import colors from "../../constants/colors";
import FlashcardItem from "../../components/FlashcardItem";
import {
  Flashcard,
  searchFlashcards,
  getFlashcardsByDifficulty,
} from "../../services/flashcardService";
import { useTranslation } from 'react-i18next';

const FlashcardSearchScreen: React.FC = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<
    "all" | "easy" | "medium" | "hard"
  >("all");

  useEffect(() => {
    if (searchQuery.trim()) {
      handleSearch();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const results = await searchFlashcards(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error("Error searching flashcards:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = async (
    filter: "all" | "easy" | "medium" | "hard"
  ) => {
    setSelectedFilter(filter);
    setLoading(true);

    try {
      if (filter === "all") {
        if (searchQuery.trim()) {
          const results = await searchFlashcards(searchQuery);
          setSearchResults(results);
        } else {
          setSearchResults([]);
        }
      } else {
        const results = await getFlashcardsByDifficulty(filter);
        setSearchResults(results);
      }
    } catch (error) {
      console.error("Error filtering flashcards:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCardPress = (flashcard: Flashcard) => {
    // Navigate to practice mode with single card or deck
    (navigation as any).navigate("FlashcardPractice", {
      noteId: flashcard.deckId,
      title: "Flashcard",
      flashcards: [flashcard],
    });
  };

  const renderFlashcard = ({ item }: { item: Flashcard }) => (
    <TouchableOpacity onPress={() => handleCardPress(item)} activeOpacity={0.7}>
      <View style={styles.searchResultItem}>
        <FlashcardItem question={item.term} answer={item.definition} />
        <View style={styles.cardMeta}>
          <Text style={styles.noteTitle}>Flashcard</Text>
          <Text style={styles.category}>General</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => {
    if (loading) return null;

    if (!searchQuery.trim() && selectedFilter === "all") {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>🔍 {t('flashcards.searchTitle')}</Text>
          <Text style={styles.emptySubtitle}>{t('flashcards.searchSubtitle')}</Text>
        </View>
      );
    }

    if (searchResults.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>{t('flashcards.noResults')}</Text>
          <Text style={styles.emptySubtitle}>{t('flashcards.noResultsSubtitle')}</Text>
        </View>
      );
    }

    return null;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← {t('common.back')}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{t('flashcards.search')}</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder={t('flashcards.searchPlaceholder')}
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoFocus
        />
      </View>

      {/* Filter Buttons */}
      <View style={styles.filtersContainer}>
        <Text style={styles.filterLabel}>{t('flashcards.difficulty')}</Text>
        <View style={styles.filterButtons}>
          {[
            { key: "all", label: t('flashcards.all') },
            { key: "easy", label: t('flashcards.easy') },
            { key: "medium", label: t('flashcards.medium') },
            { key: "hard", label: t('flashcards.hard') },
          ].map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.filterButton,
                selectedFilter === filter.key && styles.filterButtonActive,
              ]}
              onPress={() => handleFilterChange(filter.key as any)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  selectedFilter === filter.key &&
                    styles.filterButtonTextActive,
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Results */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Đang tìm kiếm...</Text>
        </View>
      ) : (
        <FlatList
          data={searchResults}
          renderItem={renderFlashcard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
        />
      )}

      {/* Results Count */}
      {searchResults.length > 0 && !loading && (
        <View style={styles.resultsCount}>
          <Text style={styles.resultsCountText}>
            Tìm thấy {searchResults.length} kết quả
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
  },
  placeholder: {
    width: 60,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  filtersContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  filterButtons: {
    flexDirection: "row",
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterButtonText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "600",
  },
  filterButtonTextActive: {
    color: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  listContainer: {
    padding: 20,
    paddingTop: 0,
  },
  searchResultItem: {
    marginBottom: 16,
  },
  cardMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    paddingHorizontal: 4,
  },
  noteTitle: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: "600",
  },
  category: {
    fontSize: 12,
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
    fontSize: 20,
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
  },
  resultsCount: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "rgba(0,0,0,0.8)",
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: "center",
  },
  resultsCountText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default FlashcardSearchScreen;
