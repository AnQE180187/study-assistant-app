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
  const [operationLoading, setOperationLoading] = useState(false);
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
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể tải danh sách flashcard');
    } finally {
      setLoading(false);
    }
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
    if (!temp.term.trim() || !temp.definition.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thuật ngữ và định nghĩa');
      return;
    }
    
    setOperationLoading(true);
    try {
      await createFlashcard(deckId, { 
        term: temp.term.trim(), 
        definition: temp.definition.trim() 
      });
      await fetchFlashcards();
      closeModal();
      Alert.alert('Thành công', 'Đã thêm flashcard mới');
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể thêm flashcard');
    } finally {
      setOperationLoading(false);
    }
  };
  
  const handleEdit = async () => {
    if (!temp.term.trim() || !temp.definition.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thuật ngữ và định nghĩa');
      return;
    }
    
    if (modal.index !== undefined && flashcards[modal.index]) {
      setOperationLoading(true);
      try {
        await updateFlashcard(flashcards[modal.index].id, { 
          term: temp.term.trim(), 
          definition: temp.definition.trim() 
        });
        await fetchFlashcards();
        closeModal();
        Alert.alert('Thành công', 'Đã cập nhật flashcard');
      } catch (error: any) {
        Alert.alert('Lỗi', error.message || 'Không thể cập nhật flashcard');
      } finally {
        setOperationLoading(false);
      }
    }
  };
  
  const handleDelete = async () => {
    if (modal.index !== undefined && flashcards[modal.index]) {
      setOperationLoading(true);
      try {
        await deleteFlashcard(flashcards[modal.index].id);
        await fetchFlashcards();
        closeModal();
        Alert.alert('Thành công', 'Đã xóa flashcard');
      } catch (error: any) {
        Alert.alert('Lỗi', error.message || 'Không thể xóa flashcard');
      } finally {
        setOperationLoading(false);
      }
    }
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

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ marginTop: 16, color: COLORS.textSecondary }}>Đang tải...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        <TouchableOpacity onPress={() => (navigation as any).navigate('FlashcardPractice', { deckId, title })}>
          <Ionicons name="play" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity style={styles.addButton} onPress={openAdd} disabled={operationLoading}>
        <Text style={styles.addButtonText}>THÊM FLASHCARD</Text>
      </TouchableOpacity>
      
      {flashcards.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Ionicons name="document-text-outline" size={64} color={COLORS.textSecondary} />
          <Text style={{ marginTop: 16, color: COLORS.textSecondary, fontSize: 16 }}>
            Chưa có flashcard nào
          </Text>
          <TouchableOpacity style={styles.createFirstBtn} onPress={openAdd}>
            <Text style={styles.createFirstText}>Thêm flashcard đầu tiên</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={flashcards}
          renderItem={renderFlashcard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshing={loading}
          onRefresh={fetchFlashcards}
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
      
      {operationLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={{ marginTop: 8, color: COLORS.textSecondary }}>Đang xử lý...</Text>
        </View>
      )}
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  term: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  definition: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 12,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  createFirstBtn: {
    marginTop: 16,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  createFirstText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default FlashcardManagementScreen;
