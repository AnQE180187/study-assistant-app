import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import ModalCard from '../../components/ModalCard';
import { getFlashcardsByDeck, createFlashcard, updateFlashcard, deleteFlashcard, Flashcard } from '../../services/flashcardService';
import { COLORS } from '../../constants/themes';

type FlashcardStackParamList = {
  FlashcardManagement: { deckId: string; title: string };
};
type NavigationProp = StackNavigationProp<FlashcardStackParamList, "FlashcardManagement">;
type RouteProps = RouteProp<FlashcardStackParamList, "FlashcardManagement">;

const FlashcardManagementScreen: React.FC = () => {
  const route = useRoute<RouteProps>();
  const navigation = useNavigation<NavigationProp>();
  const { deckId, title } = route.params;

  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ type: 'add' | 'edit' | 'delete' | null, index?: number }>({ type: null });
  const [temp, setTemp] = useState<{ term: string; definition: string }>({ term: '', definition: '' });

  useEffect(() => {
    fetchFlashcards();
    // eslint-disable-next-line
  }, [deckId]);

  const fetchFlashcards = async () => {
    setLoading(true);
    try {
      const data = await getFlashcardsByDeck(deckId);
      setFlashcards(data);
    } catch (e) {}
    setLoading(false);
  };

  const openAdd = () => {
    setTemp({ term: '', definition: '' });
    setModal({ type: 'add' });
  };
  const openEdit = (i: number) => {
    setTemp({ term: flashcards[i].term, definition: flashcards[i].definition });
    setModal({ type: 'edit', index: i });
  };
  const openDelete = (i: number) => setModal({ type: 'delete', index: i });
  const closeModal = () => setModal({ type: null });

  const handleAdd = async () => {
    try {
      await createFlashcard(deckId, { term: temp.term, definition: temp.definition });
      await fetchFlashcards();
      closeModal();
    } catch (e) {}
  };
  const handleEdit = async () => {
    if (modal.index !== undefined && flashcards[modal.index]) {
      try {
        await updateFlashcard(flashcards[modal.index].id, { term: temp.term, definition: temp.definition });
        await fetchFlashcards();
      } catch (e) {}
    }
    closeModal();
  };
  const handleDelete = async () => {
    if (modal.index !== undefined && flashcards[modal.index]) {
      try {
        await deleteFlashcard(flashcards[modal.index].id);
        await fetchFlashcards();
      } catch (e) {}
    }
    closeModal();
  };

  const renderFlashcard = ({ item, index }: { item: Flashcard; index: number }) => (
    <TouchableOpacity
      style={styles.flashcardItem}
      onPress={() => openEdit(index)}
      onLongPress={() => openDelete(index)}
    >
      <Text style={styles.term}>{item.term}</Text>
      <Text style={styles.definition}>{item.definition}</Text>
      <View style={styles.actionRow}>
        <TouchableOpacity onPress={() => openEdit(index)}>
          <Ionicons name="create-outline" size={20} color={COLORS.primary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => openDelete(index)} style={{ marginLeft: 16 }}>
          <Ionicons name="trash-outline" size={20} color={COLORS.error || 'red'} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
      </View>
      <TouchableOpacity style={styles.addButton} onPress={openAdd}>
        <Text style={styles.addButtonText}>THÊM FLASHCARD</Text>
      </TouchableOpacity>
      {loading ? <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} /> : (
        <FlatList
          data={flashcards}
          renderItem={renderFlashcard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
      {/* Modal cho Thêm/Sửa/Xóa flashcard */}
      <ModalCard
        visible={modal.type === 'add'}
        type="add"
        title="Thêm flashcard"
        fields={[
          { label: 'Thuật ngữ', value: temp.term, onChange: v => setTemp(t => ({ ...t, term: v })) },
          { label: 'Định nghĩa', value: temp.definition, onChange: v => setTemp(t => ({ ...t, definition: v })), multiline: true },
        ]}
        onSubmit={handleAdd}
        onCancel={closeModal}
      />
      <ModalCard
        visible={modal.type === 'edit'}
        type="edit"
        title="Sửa flashcard"
        fields={[
          { label: 'Thuật ngữ', value: temp.term, onChange: v => setTemp(t => ({ ...t, term: v })) },
          { label: 'Định nghĩa', value: temp.definition, onChange: v => setTemp(t => ({ ...t, definition: v })), multiline: true },
        ]}
        onSubmit={handleEdit}
        onCancel={closeModal}
      />
      <ModalCard
        visible={modal.type === 'delete'}
        type="delete"
        title="Xóa flashcard"
        onSubmit={handleDelete}
        onCancel={closeModal}
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
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginLeft: 16,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: "center",
    marginBottom: 20,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  listContainer: {
    paddingHorizontal: 20,
  },
  flashcardItem: {
    backgroundColor: COLORS.card,
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 16,
    minHeight: 80,
    justifyContent: "center",
    ...{
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 2,
    },
  },
  term: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: "bold",
    marginBottom: 4,
  },
  definition: {
    fontSize: 15,
    color: COLORS.text,
    marginBottom: 8,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
});

export default FlashcardManagementScreen;
