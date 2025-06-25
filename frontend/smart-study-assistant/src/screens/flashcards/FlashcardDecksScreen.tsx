import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { COLORS, SIZES } from '../../constants/themes';
import DeckCard from '../../components/DeckCard';
import { Ionicons } from '@expo/vector-icons';
import ModalCard from '../../components/ModalCard';

const initialMyDecks = [
  { name: 'Từ vựng IELTS', count: 3, isPublic: false, flashcards: [
    { id: '1', question: 'What is IELTS?', answer: 'International English Language Testing System' },
    { id: '2', question: 'IELTS band scale?', answer: '0-9' },
    { id: '3', question: 'IELTS Academic or General?', answer: 'Both' },
  ] },
  { name: 'Công thức Vật lý', count: 2, isPublic: false, flashcards: [
    { id: '1', question: 'F = ?', answer: 'ma' },
    { id: '2', question: 'Công suất P = ?', answer: 'A/t' },
  ] },
];
const initialPublicDecks = [
  { name: 'Lịch sử Việt Nam', count: 2, isPublic: true, flashcards: [
    { id: '1', question: 'Năm 1945 có sự kiện gì?', answer: 'Cách mạng tháng Tám' },
    { id: '2', question: 'Bác Hồ đọc Tuyên ngôn độc lập ở đâu?', answer: 'Quảng trường Ba Đình' },
  ] },
  { name: 'Từ vựng TOEIC', count: 2, isPublic: true, flashcards: [
    { id: '1', question: 'TOEIC là gì?', answer: 'Test of English for International Communication' },
    { id: '2', question: 'TOEIC tối đa bao nhiêu điểm?', answer: '990' },
  ] },
];

const FlashcardDecksScreen = ({ navigation }: any) => {
  const [tab, setTab] = useState<'my' | 'public'>('my');
  const [myDecks, setMyDecks] = useState(initialMyDecks);
  const [publicDecks, setPublicDecks] = useState(initialPublicDecks);
  const [modal, setModal] = useState<{ type: 'add' | 'edit' | 'delete' | null, index?: number }>({ type: null });
  const [temp, setTemp] = useState({ name: '', count: 0 });

  const decks = tab === 'my' ? myDecks : publicDecks;
  const setDecks = tab === 'my' ? setMyDecks : setPublicDecks;

  // Modal handlers
  const openAdd = () => {
    setTemp({ name: '', count: 0 });
    setModal({ type: 'add' });
  };
  const openEdit = (i: number) => {
    setTemp({ name: decks[i].name, count: decks[i].count });
    setModal({ type: 'edit', index: i });
  };
  const openDelete = (i: number) => setModal({ type: 'delete', index: i });
  const closeModal = () => setModal({ type: null });

  // CRUD
  const handleAdd = () => {
    setDecks([{ name: temp.name, count: temp.count, isPublic: tab === 'public', flashcards: [] }, ...decks]);
    closeModal();
  };
  const handleEdit = () => {
    if (modal.index !== undefined) {
      const newDecks = [...decks];
      newDecks[modal.index] = { ...newDecks[modal.index], name: temp.name, count: temp.count };
      setDecks(newDecks);
    }
    closeModal();
  };
  const handleDelete = () => {
    if (modal.index !== undefined) {
      setDecks(decks.filter((_, i) => i !== modal.index));
    }
    closeModal();
  };

  // Chuyển sang màn học flashcard
  const handlePractice = (deck: any) => {
    navigation.navigate('FlashcardPractice', {
      noteId: deck.name,
      title: deck.name,
      flashcards: deck.flashcards,
    });
  };

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
      <FlatList
        data={decks}
        keyExtractor={(_, i) => i.toString()}
        renderItem={({ item, index }) => (
          <DeckCard name={item.name} count={item.count} isPublic={item.isPublic} onPress={() => handlePractice(item)} />
        )}
        contentContainerStyle={{ paddingBottom: 80 }}
      />
      <TouchableOpacity style={styles.fab} onPress={openAdd}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
      {/* ModalCard cho Thêm/Sửa/Xóa */}
      <ModalCard
        visible={modal.type === 'add'}
        type="add"
        title="Thêm bộ flashcard"
        fields={[
          { label: 'Tên bộ', value: temp.name, onChange: v => setTemp(t => ({ ...t, name: v })) },
        ]}
        onSubmit={handleAdd}
        onCancel={closeModal}
      />
      <ModalCard
        visible={modal.type === 'edit'}
        type="edit"
        title="Sửa bộ flashcard"
        fields={[
          { label: 'Tên bộ', value: temp.name, onChange: v => setTemp(t => ({ ...t, name: v })) },
        ]}
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
