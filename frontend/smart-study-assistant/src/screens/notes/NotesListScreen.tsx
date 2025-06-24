import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity } from 'react-native';
import { COLORS, SIZES } from '../../constants/themes';
import NoteCard from '../../components/NoteCard';
import { Ionicons } from '@expo/vector-icons';
import ModalCard from '../../components/ModalCard';

const initialNotes = [
  { title: 'Toán tích phân', tag: 'Toán', date: '2024-06-01' },
  { title: 'Lý thuyết Dao động', tag: 'Vật lý', date: '2024-05-30' },
  { title: 'Hóa hữu cơ', tag: 'Hóa', date: '2024-05-28' },
  { title: 'Sinh học tế bào', tag: 'Sinh', date: '2024-05-25' },
];

const tags = ['Tất cả', 'Toán', 'Vật lý', 'Hóa', 'Sinh'];
 
const NotesListScreen = ({ navigation }: any) => {
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState('Tất cả');
  const [notes, setNotes] = useState(initialNotes);
  const [modal, setModal] = useState<{ type: 'add' | 'edit' | 'delete' | null, index?: number }>({ type: null });
  const [temp, setTemp] = useState({ title: '', tag: tags[1] });

  const filteredNotes = notes.filter(
    n => (selectedTag === 'Tất cả' || n.tag === selectedTag) && n.title.toLowerCase().includes(search.toLowerCase())
  );

  // Modal handlers
  const openAdd = () => {
    setTemp({ title: '', tag: tags[1] });
    setModal({ type: 'add' });
  };
  const openEdit = (i: number) => {
    setTemp({ title: notes[i].title, tag: notes[i].tag });
    setModal({ type: 'edit', index: i });
  };
  const openDelete = (i: number) => setModal({ type: 'delete', index: i });
  const closeModal = () => setModal({ type: null });

  // CRUD
  const handleAdd = () => {
    setNotes([{ title: temp.title, tag: temp.tag, date: new Date().toISOString().slice(0, 10) }, ...notes]);
    closeModal();
  };
  const handleEdit = () => {
    if (modal.index !== undefined) {
      const newNotes = [...notes];
      newNotes[modal.index] = { ...newNotes[modal.index], title: temp.title, tag: temp.tag };
      setNotes(newNotes);
    }
    closeModal();
  };
  const handleDelete = () => {
    if (modal.index !== undefined) {
      setNotes(notes.filter((_, i) => i !== modal.index));
    }
    closeModal();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ghi chú của bạn</Text>
      <TextInput
        style={styles.input}
        placeholder="Tìm kiếm ghi chú..."
        value={search}
        onChangeText={setSearch}
      />
      <View style={styles.tagRow}>
        {tags.map(tag => (
          <TouchableOpacity
            key={tag}
            style={[styles.tagBtn, selectedTag === tag && styles.tagBtnActive]}
            onPress={() => setSelectedTag(tag)}
          >
            <Text style={[styles.tagText, selectedTag === tag && styles.tagTextActive]}>{tag}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <FlatList
        data={filteredNotes}
        keyExtractor={(_, i) => i.toString()}
        renderItem={({ item, index }) => (
          <NoteCard
            title={item.title}
            tag={item.tag}
            date={item.date}
            onEdit={() => openEdit(index)}
            onDelete={() => openDelete(index)}
          />
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
        title="Thêm ghi chú"
        fields={[
          { label: 'Tiêu đề', value: temp.title, onChange: v => setTemp(t => ({ ...t, title: v })) },
          { label: 'Tag', value: temp.tag, onChange: v => setTemp(t => ({ ...t, tag: v })) },
        ]}
        onSubmit={handleAdd}
        onCancel={closeModal}
      />
      <ModalCard
        visible={modal.type === 'edit'}
        type="edit"
        title="Sửa ghi chú"
        fields={[
          { label: 'Tiêu đề', value: temp.title, onChange: v => setTemp(t => ({ ...t, title: v })) },
          { label: 'Tag', value: temp.tag, onChange: v => setTemp(t => ({ ...t, tag: v })) },
        ]}
        onSubmit={handleEdit}
        onCancel={closeModal}
      />
      <ModalCard
        visible={modal.type === 'delete'}
        type="delete"
        title="Xóa ghi chú"
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
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 16,
  },
  input: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius,
    padding: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
  },
  tagRow: {
    flexDirection: 'row',
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  tagBtn: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  tagBtnActive: {
    backgroundColor: COLORS.primary,
  },
  tagText: {
    color: COLORS.primary,
    fontSize: 14,
  },
  tagTextActive: {
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

export default NotesListScreen;