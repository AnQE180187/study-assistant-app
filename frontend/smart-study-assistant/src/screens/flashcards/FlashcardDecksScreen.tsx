import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Alert } from 'react-native';
import { COLORS, SIZES } from '../../constants/themes';
import DeckCard from '../../components/DeckCard';
import { Ionicons } from '@expo/vector-icons';
import ModalCard from '../../components/ModalCard';
import { getDecks, getPublicDecks, createDeck, updateDeck, deleteDeck, Deck } from '../../services/deckService';

const FlashcardDecksScreen = ({ navigation }: any) => {
  const [tab, setTab] = useState<'my' | 'public'>('my');
  const [myDecks, setMyDecks] = useState<Deck[]>([]);
  const [publicDecks, setPublicDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);
  const [operationLoading, setOperationLoading] = useState(false);
  const [modal, setModal] = useState<{ type: 'add' | 'edit' | 'delete' | null, index?: number }>({ type: null });
  const [temp, setTemp] = useState<Partial<Deck>>({ title: '', description: '', tags: [], isPublic: false });

  useEffect(() => {
    fetchDecks();
  }, [tab]);

  const fetchDecks = async () => {
    setLoading(true);
    try {
      if (tab === 'my') {
        const decks = await getDecks();
        setMyDecks(decks);
      } else {
        const decks = await getPublicDecks();
        setPublicDecks(decks);
      }
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể tải danh sách bộ thẻ');
    } finally {
      setLoading(false);
    }
  };

  const decks = tab === 'my' ? myDecks : publicDecks;
  const setDecks = tab === 'my' ? setMyDecks : setPublicDecks;

  // Modal handlers
  const openAdd = () => {
    setTemp({ title: '', description: '', tags: [], isPublic: false });
    setModal({ type: 'add' });
  };
  const openEdit = (i: number) => {
    setTemp({ ...decks[i] });
    setModal({ type: 'edit', index: i });
  };
  const openDelete = (i: number) => setModal({ type: 'delete', index: i });
  const closeModal = () => setModal({ type: null });

  // CRUD
  const handleAdd = async () => {
    if (!temp.title?.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên bộ thẻ');
      return;
    }
    
    setOperationLoading(true);
    try {
      const newDeck = await createDeck({
        title: temp.title.trim(),
        description: temp.description?.trim() || '',
        tags: temp.tags || [],
        isPublic: !!temp.isPublic,
      });
      setMyDecks([newDeck, ...myDecks]);
      closeModal();
      Alert.alert('Thành công', 'Đã tạo bộ thẻ mới');
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể tạo bộ thẻ');
    } finally {
      setOperationLoading(false);
    }
  };
  
  const handleEdit = async () => {
    if (!temp.title?.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên bộ thẻ');
      return;
    }
    
    if (modal.index !== undefined && decks[modal.index]) {
      setOperationLoading(true);
      try {
        const updated = await updateDeck(decks[modal.index].id, {
          title: temp.title.trim(),
          description: temp.description?.trim() || '',
          tags: temp.tags || [],
          isPublic: temp.isPublic,
        });
        const newDecks = [...decks];
        newDecks[modal.index] = updated;
        setDecks(newDecks);
        closeModal();
        Alert.alert('Thành công', 'Đã cập nhật bộ thẻ');
      } catch (error: any) {
        Alert.alert('Lỗi', error.message || 'Không thể cập nhật bộ thẻ');
      } finally {
        setOperationLoading(false);
      }
    }
  };
  
  const handleDelete = async () => {
    if (modal.index !== undefined && decks[modal.index]) {
      setOperationLoading(true);
      try {
        await deleteDeck(decks[modal.index].id);
        setDecks(decks.filter((_, i) => i !== modal.index));
        closeModal();
        Alert.alert('Thành công', 'Đã xóa bộ thẻ');
      } catch (error: any) {
        Alert.alert('Lỗi', error.message || 'Không thể xóa bộ thẻ');
      } finally {
        setOperationLoading(false);
      }
    }
  };

  // Chuyển sang màn quản lý flashcard trong deck
  const handleDeckPress = (deck: Deck) => {
    navigation.navigate('FlashcardManagement', {
      deckId: deck.id,
      title: deck.title,
    });
  };

  // Chuyển sang màn luyện tập flashcard
  const handleStudyPress = (deck: Deck) => {
    console.log('Navigating to FlashcardPractice with deck:', deck.id, deck.title);
    navigation.navigate('FlashcardPractice', {
      deckId: deck.id,
      title: deck.title,
      isPublic: tab === 'public',
    });
  };

  // UI cho nhập tags
  const renderTagInput = () => (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginVertical: 8 }}>
      {(temp.tags || []).map((tag, idx) => (
        <View key={idx} style={{ backgroundColor: COLORS.primaryLight, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4, marginRight: 6, marginBottom: 6, flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ color: COLORS.primary }}>{tag}</Text>
          <TouchableOpacity onPress={() => setTemp(t => ({ ...t, tags: (t.tags || []).filter((_, i) => i !== idx) }))}>
            <Ionicons name="close" size={14} color={COLORS.primary} style={{ marginLeft: 4 }} />
          </TouchableOpacity>
        </View>
      ))}
      <TouchableOpacity onPress={() => {
        const newTag = prompt('Nhập tag mới');
        if (newTag && newTag.trim()) setTemp(t => ({ ...t, tags: [...(t.tags || []), newTag.trim()] }));
      }} style={{ backgroundColor: COLORS.primary, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 }}>
        <Text style={{ color: '#fff' }}>+ Tag</Text>
      </TouchableOpacity>
    </View>
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
      <View style={styles.tabRow}>
        <TouchableOpacity style={[styles.tabBtn, tab === 'my' && styles.tabBtnActive]} onPress={() => setTab('my')}>
          <Text style={[styles.tabText, tab === 'my' && styles.tabTextActive]}>Bộ của tôi</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tabBtn, tab === 'public' && styles.tabBtnActive]} onPress={() => setTab('public')}>
          <Text style={[styles.tabText, tab === 'public' && styles.tabTextActive]}>Công khai</Text>
        </TouchableOpacity>
      </View>
      
      {decks.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Ionicons name="albums-outline" size={64} color={COLORS.textSecondary} />
          <Text style={{ marginTop: 16, color: COLORS.textSecondary, fontSize: 16 }}>
            {tab === 'my' ? 'Chưa có bộ thẻ nào' : 'Chưa có bộ thẻ công khai'}
          </Text>
          {tab === 'my' && (
            <TouchableOpacity style={styles.createFirstBtn} onPress={openAdd}>
              <Text style={styles.createFirstText}>Tạo bộ thẻ đầu tiên</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={decks}
          keyExtractor={item => item.id}
          renderItem={({ item, index }) => (
            <DeckCard
              name={item.title}
              count={item.flashcards?.length || 0}
              isPublic={item.isPublic}
              onManage={tab === 'my' ? () => handleDeckPress(item) : undefined}
              onStudy={() => handleStudyPress(item)}
              onEdit={tab === 'my' ? () => openEdit(index) : undefined}
              onDelete={tab === 'my' ? () => openDelete(index) : undefined}
              description={item.description}
              tags={item.tags}
              hideManageBtn={tab === 'public'}
            />
          )}
          contentContainerStyle={{ paddingBottom: 80 }}
          refreshing={loading}
          onRefresh={fetchDecks}
        />
      )}
      
      {tab === 'my' && (
        <TouchableOpacity style={styles.fab} onPress={openAdd} disabled={operationLoading}>
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      )}
      
      {/* ModalCard cho Thêm/Sửa/Xóa */}
      <ModalCard
        visible={modal.type === 'add'}
        type="add"
        title="Thêm bộ flashcard"
        fields={[
          { label: 'Tên bộ', value: temp.title || '', onChange: v => setTemp(t => ({ ...t, title: v })) },
          { label: 'Mô tả', value: temp.description || '', onChange: v => setTemp(t => ({ ...t, description: v })) },
        ]}
        extraContent={renderTagInput()}
        isPublic={temp.isPublic}
        onTogglePublic={() => setTemp(t => ({ ...t, isPublic: !t.isPublic }))}
        onSubmit={handleAdd}
        onCancel={closeModal}
      />
      <ModalCard
        visible={modal.type === 'edit'}
        type="edit"
        title="Sửa bộ flashcard"
        fields={[
          { label: 'Tên bộ', value: temp.title || '', onChange: v => setTemp(t => ({ ...t, title: v })) },
          { label: 'Mô tả', value: temp.description || '', onChange: v => setTemp(t => ({ ...t, description: v })) },
        ]}
        extraContent={renderTagInput()}
        isPublic={temp.isPublic}
        onTogglePublic={() => setTemp(t => ({ ...t, isPublic: !t.isPublic }))}
        onSubmit={handleEdit}
        onCancel={closeModal}
      />
      <ModalCard
        visible={modal.type === 'delete'}
        type="delete"
        title="Xóa bộ flashcard"
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
    backgroundColor: COLORS.background,
    padding: SIZES.padding,
  },
  tabRow: {
    flexDirection: 'row',
    marginBottom: 18,
    backgroundColor: COLORS.primaryLight,
    borderRadius: 12,
    padding: 4,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabBtnActive: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#fff',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: COLORS.primary,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
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

export default FlashcardDecksScreen;
