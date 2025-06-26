import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
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
    } catch (e) {
      // handle error
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
    try {
      const newDeck = await createDeck({
        title: temp.title || '',
        description: temp.description || '',
        tags: temp.tags || [],
        isPublic: !!temp.isPublic,
      });
      setMyDecks([newDeck, ...myDecks]);
      closeModal();
    } catch (e) {}
  };
  const handleEdit = async () => {
    if (modal.index !== undefined && decks[modal.index]) {
      try {
        const updated = await updateDeck(decks[modal.index].id, {
          title: temp.title,
          description: temp.description,
          tags: temp.tags,
          isPublic: temp.isPublic,
        });
        const newDecks = [...decks];
        newDecks[modal.index] = updated;
        setDecks(newDecks);
      } catch (e) {}
    }
    closeModal();
  };
  const handleDelete = async () => {
    if (modal.index !== undefined && decks[modal.index]) {
      try {
        await deleteDeck(decks[modal.index].id);
        setDecks(decks.filter((_, i) => i !== modal.index));
      } catch (e) {}
    }
    closeModal();
  };

  // Chuyển sang màn quản lý flashcard trong deck
  const handleDeckPress = (deck: Deck) => {
    navigation.navigate('FlashcardManagement', {
      deckId: deck.id,
      title: deck.title,
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
      {loading ? <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} /> : (
        <FlatList
          data={decks}
          keyExtractor={item => item.id}
          renderItem={({ item, index }) => (
            <DeckCard
              name={item.title}
              count={item.flashcards?.length || 0}
              isPublic={item.isPublic}
              onPress={() => handleDeckPress(item)}
              onEdit={() => openEdit(index)}
              onDelete={() => openDelete(index)}
              description={item.description}
              tags={item.tags}
            />
          )}
          contentContainerStyle={{ paddingBottom: 80 }}
        />
      )}
      <TouchableOpacity style={styles.fab} onPress={openAdd}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
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
    borderRadius: 999,
    padding: 4,
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 999,
  },
  tabBtnActive: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  tabTextActive: {
    color: '#fff',
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 32,
    backgroundColor: COLORS.primary,
    borderRadius: 999,
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    ...{
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 2,
    },
  },
});

export default FlashcardDecksScreen;
