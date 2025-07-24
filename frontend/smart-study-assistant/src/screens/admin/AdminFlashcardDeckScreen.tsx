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
  Divider,
} from "react-native-paper";
import { useRoute, RouteProp } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import {
  getAdminFlashcardsByDeck,
  AdminFlashcard,
  createFlashcard,
  updateFlashcard,
  deleteFlashcard,
} from "../../services/adminService";
import { RootStackParamList } from "../../navigation/types";

type AdminFlashcardDeckRouteProp = RouteProp<
  RootStackParamList,
  "AdminFlashcardDeck"
>;

const AdminFlashcardDeckScreen: React.FC = () => {
  const theme = useTheme();
  const route = useRoute<AdminFlashcardDeckRouteProp>();
  const { deckId, title } = route.params;

  const [flashcards, setFlashcards] = useState<AdminFlashcard[]>([]);
  const [filteredFlashcards, setFilteredFlashcards] = useState<
    AdminFlashcard[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // CRUD states
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingFlashcard, setEditingFlashcard] =
    useState<AdminFlashcard | null>(null);
  const [newTerm, setNewTerm] = useState("");
  const [newDefinition, setNewDefinition] = useState("");
  const [menuVisible, setMenuVisible] = useState<{ [key: string]: boolean }>(
    {}
  );

  const fetchFlashcards = async () => {
    try {
      console.log(`Fetching flashcards for deck: ${deckId}`);
      const data = await getAdminFlashcardsByDeck(deckId);
      console.log(`Received ${data.length} flashcards`);
      setFlashcards(data);
      setFilteredFlashcards(data);
    } catch (error: any) {
      console.error("Error fetching flashcards:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch flashcards";
      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchFlashcards();
    setRefreshing(false);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === "") {
      setFilteredFlashcards(flashcards);
    } else {
      const filtered = flashcards.filter(
        (flashcard) =>
          flashcard.term.toLowerCase().includes(query.toLowerCase()) ||
          flashcard.definition.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredFlashcards(filtered);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // CRUD handlers
  const handleCreateFlashcard = async () => {
    if (!newTerm.trim() || !newDefinition.trim()) {
      Alert.alert("Error", "Please fill in both term and definition");
      return;
    }

    try {
      await createFlashcard(deckId, {
        term: newTerm.trim(),
        definition: newDefinition.trim(),
      });

      setNewTerm("");
      setNewDefinition("");
      setShowCreateDialog(false);
      await fetchFlashcards();
      Alert.alert("Success", "Flashcard created successfully");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to create flashcard");
    }
  };

  const handleEditFlashcard = async () => {
    if (!editingFlashcard || !newTerm.trim() || !newDefinition.trim()) {
      Alert.alert("Error", "Please fill in both term and definition");
      return;
    }

    try {
      await updateFlashcard(editingFlashcard.id, {
        term: newTerm.trim(),
        definition: newDefinition.trim(),
      });

      setEditingFlashcard(null);
      setNewTerm("");
      setNewDefinition("");
      setShowEditDialog(false);
      await fetchFlashcards();
      Alert.alert("Success", "Flashcard updated successfully");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to update flashcard");
    }
  };

  const handleDeleteFlashcard = (flashcard: AdminFlashcard) => {
    Alert.alert(
      "Delete Flashcard",
      `Are you sure you want to delete "${flashcard.term}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteFlashcard(flashcard.id);
              await fetchFlashcards();
              Alert.alert("Success", "Flashcard deleted successfully");
            } catch (error: any) {
              Alert.alert(
                "Error",
                error.message || "Failed to delete flashcard"
              );
            }
          },
        },
      ]
    );
  };

  const openEditDialog = (flashcard: AdminFlashcard) => {
    setEditingFlashcard(flashcard);
    setNewTerm(flashcard.term);
    setNewDefinition(flashcard.definition);
    setShowEditDialog(true);
    setMenuVisible({ ...menuVisible, [flashcard.id]: false });
  };

  const toggleMenu = (flashcardId: string) => {
    setMenuVisible({
      ...menuVisible,
      [flashcardId]: !menuVisible[flashcardId],
    });
  };

  useEffect(() => {
    fetchFlashcards();
  }, [deckId]);

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  const renderFlashcardItem = ({
    item: flashcard,
  }: {
    item: AdminFlashcard;
  }) => (
    <Card style={styles.flashcardCard}>
      <Card.Content>
        <View style={styles.flashcardHeader}>
          <Title style={styles.flashcardTerm}>{flashcard.term}</Title>
          <View style={styles.flashcardActions}>
            <Chip mode="outlined" icon="cards" style={styles.flashcardChip}>
              Flashcard
            </Chip>
            <Menu
              visible={menuVisible[flashcard.id] || false}
              onDismiss={() => toggleMenu(flashcard.id)}
              anchor={
                <IconButton
                  icon="dots-vertical"
                  size={20}
                  onPress={() => toggleMenu(flashcard.id)}
                />
              }
            >
              <Menu.Item
                onPress={() => openEditDialog(flashcard)}
                title="Edit"
                leadingIcon="pencil"
              />
              <Menu.Item
                onPress={() => handleDeleteFlashcard(flashcard)}
                title="Delete"
                leadingIcon="delete"
              />
            </Menu>
          </View>
        </View>

        <Divider style={styles.divider} />

        <View style={styles.flashcardContent}>
          <Paragraph style={styles.definitionLabel}>Definition:</Paragraph>
          <Paragraph style={styles.flashcardDefinition}>
            {flashcard.definition}
          </Paragraph>
        </View>

        <View style={styles.flashcardMeta}>
          <View style={styles.metaRow}>
            <MaterialIcons
              name="calendar-today"
              size={16}
              color={theme.colors.onSurface}
            />
            <Paragraph style={styles.metaText}>
              Created: {formatDate(flashcard.createdAt)}
            </Paragraph>
          </View>
          {flashcard.updatedAt !== flashcard.createdAt && (
            <View style={styles.metaRow}>
              <MaterialIcons
                name="edit"
                size={16}
                color={theme.colors.onSurface}
              />
              <Paragraph style={styles.metaText}>
                Updated: {formatDate(flashcard.updatedAt)}
              </Paragraph>
            </View>
          )}
        </View>
      </Card.Content>
    </Card>
  );

  const EmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialIcons
        name="style"
        size={64}
        color={theme.colors.onSurface}
        style={styles.emptyIcon}
      />
      <Title style={styles.emptyTitle}>No Flashcards Found</Title>
      <Paragraph style={styles.emptyDescription}>
        {searchQuery
          ? "No flashcards match your search criteria."
          : `This deck "${title}" doesn't contain any flashcards yet.`}
      </Paragraph>
      {!searchQuery && (
        <Paragraph style={styles.emptyHint}>
          Users can add flashcards to this deck from the main app.
        </Paragraph>
      )}
    </View>
  );

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Searchbar
        placeholder="Search flashcards by term or definition"
        onChangeText={handleSearch}
        value={searchQuery}
        style={styles.searchbar}
      />

      <View style={styles.statsContainer}>
        <Chip icon="style" mode="outlined">
          {filteredFlashcards.length} Flashcards
        </Chip>
        <Chip icon="cards" mode="outlined">
          {title}
        </Chip>
      </View>

      <FlatList
        data={filteredFlashcards}
        renderItem={renderFlashcardItem}
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
  flashcardCard: {
    marginBottom: 12,
    elevation: 2,
  },
  flashcardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  flashcardTerm: {
    fontSize: 18,
    flex: 1,
    marginRight: 12,
  },
  flashcardChip: {
    alignSelf: "flex-start",
  },
  divider: {
    marginBottom: 12,
  },
  flashcardContent: {
    marginBottom: 16,
  },
  definitionLabel: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  flashcardDefinition: {
    fontSize: 16,
    lineHeight: 24,
  },
  flashcardMeta: {
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
  emptyHint: {
    textAlign: "center",
    opacity: 0.5,
    paddingHorizontal: 32,
    marginTop: 8,
    fontSize: 12,
  },
});

export default AdminFlashcardDeckScreen;
