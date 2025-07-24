import React, { useState, useEffect } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  Alert,
} from "react-native";
import {
  Card,
  Title,
  Paragraph,
  useTheme,
  ActivityIndicator,
  Searchbar,
  Chip,
} from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";
import { getAllDecksAdmin, PublicDeck } from "../../services/adminService";

const AdminFlashcardsScreen: React.FC = () => {
  const theme = useTheme();
  const [decks, setDecks] = useState<PublicDeck[]>([]);
  const [filteredDecks, setFilteredDecks] = useState<PublicDeck[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchDecks = async () => {
    try {
      const data = await getAllDecksAdmin();
      console.log("Fetched decks:", data.length);
      console.log("Sample deck structure:", JSON.stringify(data[0], null, 2));

      // Log card counts for debugging
      data.forEach((deck, index) => {
        console.log(
          `Deck ${index + 1}: ${deck.name} - ${
            deck._count?.flashcards || 0
          } cards`
        );
      });

      setDecks(data);
      setFilteredDecks(data);
    } catch (error: any) {
      console.error("Error fetching decks:", error);
      Alert.alert("Error", error.message || "Failed to fetch flashcard decks");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDecks();
    setRefreshing(false);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === "") {
      setFilteredDecks(decks);
    } else {
      const filtered = decks.filter(
        (deck) =>
          (deck.name || deck.title || "")
            .toLowerCase()
            .includes(query.toLowerCase()) ||
          deck.description?.toLowerCase().includes(query.toLowerCase()) ||
          (deck.user?.name || "").toLowerCase().includes(query.toLowerCase())
      );
      setFilteredDecks(filtered);
    }
  };

  // Removed handleViewDeck - no longer needed

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  useEffect(() => {
    fetchDecks();
  }, []);

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  const renderDeckItem = ({ item: deck }: { item: PublicDeck }) => (
    <Card style={styles.deckCard}>
      <Card.Content>
        <View style={styles.deckHeader}>
          <View style={styles.deckInfo}>
            <Title style={styles.deckTitle}>{deck.name || deck.title}</Title>
            <Paragraph style={styles.deckDescription}>
              {deck.description || "No description"}
            </Paragraph>
          </View>
          <View style={styles.cardCountContainer}>
            <Chip
              mode="outlined"
              icon="cards"
              style={[
                styles.flashcardCount,
                {
                  backgroundColor:
                    (deck._count?.flashcards || 0) > 0
                      ? theme.colors.primaryContainer
                      : theme.colors.errorContainer,
                },
              ]}
              textStyle={{
                color:
                  (deck._count?.flashcards || 0) > 0
                    ? theme.colors.onPrimaryContainer
                    : theme.colors.onSurfaceVariant,
                fontWeight: "bold",
                fontSize: 16,
              }}
            >
              {deck._count?.flashcards || 0} cards
            </Chip>
          </View>
        </View>

        <View style={styles.deckMeta}>
          <View style={styles.metaRow}>
            <MaterialIcons
              name="person"
              size={16}
              color={theme.colors.onSurface}
            />
            <Paragraph style={styles.metaText}>
              {deck.user?.name || "Unknown User"} (
              {deck.user?.email || "No email"})
            </Paragraph>
          </View>
          <View style={styles.metaRow}>
            <MaterialIcons
              name="calendar-today"
              size={16}
              color={theme.colors.onSurface}
            />
            <Paragraph style={styles.metaText}>
              Created: {formatDate(deck.createdAt)}
            </Paragraph>
          </View>
        </View>

        {/* Actions removed - just display deck info */}
      </Card.Content>
    </Card>
  );

  const EmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialIcons
        name="library-books"
        size={64}
        color={theme.colors.onSurface}
        style={styles.emptyIcon}
      />
      <Title style={styles.emptyTitle}>No Public Decks Found</Title>
      <Paragraph style={styles.emptyDescription}>
        {searchQuery
          ? "No decks match your search criteria."
          : "There are no public flashcard decks available."}
      </Paragraph>
    </View>
  );

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Searchbar
        placeholder="Search decks by title, description, or author"
        onChangeText={handleSearch}
        value={searchQuery}
        style={styles.searchbar}
      />

      <View style={styles.statsContainer}>
        <Chip
          icon="library-books"
          mode="outlined"
          style={{ backgroundColor: theme.colors.secondaryContainer }}
          textStyle={{
            color: theme.colors.onSecondaryContainer,
            fontWeight: "bold",
          }}
        >
          {filteredDecks.length} Decks
        </Chip>
        <Chip
          icon="cards"
          mode="outlined"
          style={{ backgroundColor: theme.colors.tertiaryContainer }}
          textStyle={{
            color: theme.colors.onTertiaryContainer,
            fontWeight: "bold",
          }}
        >
          {filteredDecks.reduce(
            (total, deck) => total + (deck._count?.flashcards || 0),
            0
          )}{" "}
          Cards Total
        </Chip>
      </View>

      <FlatList
        data={filteredDecks}
        renderItem={renderDeckItem}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={EmptyState}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  searchbar: {
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  listContainer: {
    paddingBottom: 16,
  },
  deckCard: {
    marginBottom: 12,
    elevation: 2,
  },
  deckHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  deckInfo: {
    flex: 1,
    marginRight: 12,
  },
  deckTitle: {
    fontSize: 18,
    marginBottom: 4,
  },
  deckDescription: {
    fontSize: 14,
    opacity: 0.7,
  },
  cardCountContainer: {
    alignItems: "flex-end",
    justifyContent: "center",
  },
  flashcardCount: {
    alignSelf: "flex-start",
    borderWidth: 2,
    borderColor: "transparent",
  },
  deckMeta: {
    marginBottom: 16,
    gap: 8,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  metaText: {
    fontSize: 14,
    opacity: 0.8,
  },
  deckActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  viewButton: {
    minWidth: 120,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 64,
  },
  emptyIcon: {
    opacity: 0.3,
    marginBottom: 16,
  },
  emptyTitle: {
    textAlign: "center",
    marginBottom: 8,
  },
  emptyDescription: {
    textAlign: "center",
    opacity: 0.7,
    paddingHorizontal: 32,
  },
});

export default AdminFlashcardsScreen;
