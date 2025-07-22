import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import NoteCard from '../../components/NoteCard';
import { Ionicons } from '@expo/vector-icons';
import ModalCard from '../../components/ModalCard';
import {
  Note,
  getNotes,
  createNote,
  updateNote,
  deleteNote
} from '../../services/notesService';
import { getStudyPlans, StudyPlan } from '../../services/studyPlanService';

const NotesListScreen = ({ navigation }: any) => {
  const { t } = useTranslation();
  const { currentTheme } = useTheme();
  const [search, setSearch] = useState('');
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [modal, setModal] = useState<{ type: 'add' | 'edit' | 'delete' | null, index?: number }>({ type: null });
  const [plans, setPlans] = useState<StudyPlan[]>([]);
  const [temp, setTemp] = useState<{ title: string; content: string; planId: string }>({
    title: '',
    content: '',
    planId: '', // luôn là string, '' là tự do
  });
  const [selectedPlanId, setSelectedPlanId] = useState(''); // '' là tất cả
  const [showAllPlans, setShowAllPlans] = useState(false);

  useEffect(() => {
    fetchNotes();
    fetchPlans();
  }, [search]);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (search) params.search = search;
      if (selectedPlanId) params.planId = selectedPlanId;

      const fetchedNotes = await getNotes(params);
      setNotes(fetchedNotes);
    } catch (error: any) {
      Alert.alert(t('notes.error'), error.message || t('notes.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const fetchPlans = async () => {
    try {
      const fetchedPlans = await getStudyPlans();
      setPlans(fetchedPlans);
    } catch {}
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchNotes()]);
    setRefreshing(false);
  };

  // Modal handlers
  const openAdd = () => {
    setTemp({ title: '', content: '', planId: '' });
    setModal({ type: 'add' });
  };

  const openEdit = (i: number) => {
    const note = notes[i];
    setTemp({ title: note.title, content: note.content, planId: note.planId || '' });
    setModal({ type: 'edit', index: i });
  };

  const openDelete = (i: number) => setModal({ type: 'delete', index: i });
  const closeModal = () => setModal({ type: null });

  // CRUD operations
  const handleAdd = async () => {
    if (!temp.title?.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tiêu đề');
      return;
    }
    try {
      const payload = {
        title: temp.title.trim(),
        content: temp.content?.trim() || '',
      };
      if (temp.planId) payload['planId'] = temp.planId;
      const newNote = await createNote(payload);
      setNotes([newNote, ...notes]);
      closeModal();
      Alert.alert('Thành công', 'Đã thêm ghi chú');
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể thêm ghi chú');
    }
  };

  const handleEdit = async () => {
    if (!temp.title?.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tiêu đề');
      return;
    }
    if (modal.index !== undefined && notes[modal.index]) {
      try {
        const payload = {
          title: temp.title.trim(),
          content: temp.content?.trim() || '',
        };
        if (temp.planId) payload['planId'] = temp.planId;
        const updated = await updateNote(notes[modal.index].id, payload);
        const newNotes = [...notes];
        const noteIndex = notes.findIndex(n => n.id === updated.id);
        if (noteIndex !== -1) {
          newNotes[noteIndex] = updated;
          setNotes(newNotes);
        }
        closeModal();
        Alert.alert('Thành công', 'Đã cập nhật ghi chú');
      } catch (error: any) {
        Alert.alert('Lỗi', error.message || 'Không thể cập nhật ghi chú');
      }
    }
  };

  const handleDelete = async () => {
    if (modal.index !== undefined && modal.index >= 0 && notes[modal.index!]) {
      try {
        await deleteNote(notes[modal.index!].id);
        setNotes(notes.filter(n => n.id !== notes[modal.index!].id));
        closeModal();
        Alert.alert(t('notes.success'), t('notes.deleteSuccess'));
      } catch (error: any) {
        Alert.alert(t('notes.error'), error.message || t('notes.deleteError'));
      }
    }
  };

  const handleNotePress = (note: Note) => {
    navigation.navigate('NoteEditor', { noteId: note.id });
  };

  if (loading && notes.length === 0) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={currentTheme.colors.primary} />
        <Text style={{ marginTop: 16, color: currentTheme.colors.textSecondary }}>{t('notes.loading')}</Text>
      </View>
    );
  }

  const filteredNotes = selectedPlanId === ''
    ? notes
    : selectedPlanId === '__free__'
      ? notes.filter(n => !n.planId)
      : notes.filter(n => n.planId === selectedPlanId);

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.colors.background }]}>
      <Text style={[styles.title, { color: currentTheme.colors.text }]}>{t('notes.yourNotes')}</Text>

      {/* Search */}
      <TextInput
        style={[styles.input, { 
          backgroundColor: currentTheme.colors.card,
          color: currentTheme.colors.text,
          borderColor: currentTheme.colors.border
        }]}
        placeholder={t('notes.searchPlaceholder')}
        placeholderTextColor={currentTheme.colors.textSecondary}
        value={search}
        onChangeText={setSearch}
      />

      {/* Filters */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16, alignItems: 'center' }}>
        <TouchableOpacity
          style={{
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 16,
            backgroundColor: selectedPlanId === '' ? currentTheme.colors.primary : currentTheme.colors.primary + '20',
            marginRight: 8,
            marginBottom: 8,
          }}
          onPress={() => setSelectedPlanId('')}
        >
          <Text style={{ color: selectedPlanId === '' ? '#fff' : currentTheme.colors.primary, fontWeight: 'bold' }}>Tất cả</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 16,
            backgroundColor: selectedPlanId === '__free__' ? currentTheme.colors.primary : currentTheme.colors.primary + '20',
            marginRight: 8,
            marginBottom: 8,
          }}
          onPress={() => setSelectedPlanId('__free__')}
        >
          <Text style={{ color: selectedPlanId === '__free__' ? '#fff' : currentTheme.colors.primary, fontWeight: 'bold' }}>Tự do</Text>
        </TouchableOpacity>
        {(showAllPlans ? plans : plans.slice(0, 4)).map(plan => (
          <TouchableOpacity
            key={plan.id}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 16,
              backgroundColor: selectedPlanId === plan.id ? currentTheme.colors.primary : currentTheme.colors.primary + '20',
              marginRight: 8,
              marginBottom: 8,
            }}
            onPress={() => setSelectedPlanId(plan.id)}
          >
            <Text style={{ color: selectedPlanId === plan.id ? '#fff' : currentTheme.colors.primary }}>{plan.title}</Text>
          </TouchableOpacity>
        ))}
        {plans.length > 4 && (
          <TouchableOpacity
            style={{
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 16,
              backgroundColor: currentTheme.colors.primary + '20',
              marginRight: 8,
              marginBottom: 8,
            }}
            onPress={() => setShowAllPlans(!showAllPlans)}
          >
            <Text style={{ color: currentTheme.colors.primary, fontWeight: 'bold' }}>{showAllPlans ? 'Less' : 'More'}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Notes List */}
      {filteredNotes.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Ionicons name="document-text-outline" size={64} color={currentTheme.colors.textSecondary} />
          <Text style={{ marginTop: 16, color: currentTheme.colors.textSecondary, fontSize: 16 }}>
            {loading ? t('notes.loading') : t('notes.noNotes')}
          </Text>
          {!loading && (
            <TouchableOpacity style={[styles.createFirstBtn, { backgroundColor: currentTheme.colors.primary }]} onPress={openAdd}>
              <Text style={styles.createFirstText}>{t('notes.createFirstNote')}</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={filteredNotes}
          keyExtractor={item => item.id}
          renderItem={({ item, index }) => (
            <NoteCard
              title={item.title}
              content={item.content}
              onPress={() => handleNotePress(item)}
              onEdit={() => openEdit(index)}
              onDelete={() => openDelete(index)}
            />
          )}
          contentContainerStyle={{ paddingBottom: 80 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}

      {/* FAB */}
      <TouchableOpacity style={[styles.fab, { backgroundColor: currentTheme.colors.primary }]} onPress={openAdd}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Modals */}
      <ModalCard
        visible={modal.type === 'add'}
        type="add"
        title="Thêm ghi chú"
        fields={[
          { label: 'Tiêu đề', value: temp.title, onChange: v => setTemp(t => ({ ...t, title: v })) },
          { label: 'Môn học', value: temp.planId, onChange: v => setTemp(t => ({ ...t, planId: v })), type: 'dropdown', options: [{ label: 'Tự do', value: '' }, ...plans.map(p => ({ label: p.title, value: p.id }))] },
          { label: 'Nội dung', value: temp.content, onChange: v => setTemp(t => ({ ...t, content: v })), multiline: true },
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
          { label: 'Môn học', value: temp.planId, onChange: v => setTemp(t => ({ ...t, planId: v })), type: 'dropdown', options: [{ label: 'Tự do', value: '' }, ...plans.map(p => ({ label: p.title, value: p.id }))] },
          { label: 'Nội dung', value: temp.content, onChange: v => setTemp(t => ({ ...t, content: v })), multiline: true },
        ]}
        onSubmit={handleEdit}
        onCancel={closeModal}
      />

      <ModalCard
        visible={modal.type === 'delete'}
        type="delete"
        title={t('notes.deleteNote')}
        onSubmit={handleDelete}
        onCancel={closeModal}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 12,
  },
  filtersContainer: {
    marginBottom: 16,
  },
  filterSection: {
    marginBottom: 12,
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  addCategoryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  addCategoryText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  filterList: {
    paddingRight: 16,
  },
  filterBtn: {
    backgroundColor: '#e0f7fa',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  filterBtnActive: {
    backgroundColor: '#007bff',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#fff',
  },
  pinnedFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0f7fa',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: 'flex-start',
  },
  pinnedFilterActive: {
    backgroundColor: '#007bff',
  },
  pinnedFilterText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  pinnedFilterTextActive: {
    color: '#fff',
  },
  createFirstBtn: {
    backgroundColor: '#007bff',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginTop: 16,
  },
  createFirstText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 32,
    borderRadius: 999,
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
});

export default NotesListScreen;