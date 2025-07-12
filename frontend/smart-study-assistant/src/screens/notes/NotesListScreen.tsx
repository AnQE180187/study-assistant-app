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
  deleteNote,
  togglePin,
  getNoteStats,
  getCategories
} from '../../services/notesService';

const NotesListScreen = ({ navigation }: any) => {
  const { t } = useTranslation();
  const { currentTheme } = useTheme();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(t('notes.all'));
  const [selectedPriority, setSelectedPriority] = useState(t('notes.all'));
  const [showPinnedOnly, setShowPinnedOnly] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [categories, setCategories] = useState<string[]>([t('notes.all')]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [modal, setModal] = useState<{ type: 'add' | 'edit' | 'delete' | 'category' | null, index?: number }>({ type: null });
  const [temp, setTemp] = useState({
    title: '',
    description: '',
    content: '',
    category: t('notes.general'),
    priority: 'medium' as 'low' | 'medium' | 'high',
    tags: [] as string[],
    isPublic: false,
    isPinned: false
  });
  const [newCategory, setNewCategory] = useState('');

  const priorities = [t('notes.all'), 'low', 'medium', 'high'];

  useEffect(() => {
    fetchNotes();
    fetchCategories();
  }, [search, selectedCategory, selectedPriority, showPinnedOnly]);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (search) params.search = search;
      if (selectedCategory !== t('notes.all')) params.category = selectedCategory;
      if (selectedPriority !== t('notes.all')) params.priority = selectedPriority;
      if (showPinnedOnly) params.isPinned = true;

      const fetchedNotes = await getNotes(params);
      setNotes(fetchedNotes);
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể tải danh sách ghi chú');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const fetchedCategories = await getCategories();
      setCategories([t('notes.all'), ...fetchedCategories.filter(cat => cat !== t('notes.all'))]);
    } catch (error: any) {
      console.error('Error fetching categories:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchNotes(), fetchCategories()]);
    setRefreshing(false);
  };

  const filteredNotes = notes.filter(note => {
    if (selectedCategory !== t('notes.all') && note.category !== selectedCategory) return false;
    if (selectedPriority !== t('notes.all') && note.priority !== selectedPriority) return false;
    if (showPinnedOnly && !note.isPinned) return false;
    return true;
  });

  // Modal handlers
  const openAdd = () => {
    setTemp({
      title: '',
      description: '',
      content: '',
      category: t('notes.general'),
      priority: 'medium',
      tags: [],
      isPublic: false,
      isPinned: false
    });
    setModal({ type: 'add' });
  };

  const openEdit = (i: number) => {
    const note = filteredNotes[i];
    setTemp({
      title: note.title,
      description: note.description || '',
      content: note.content,
      category: note.category,
      priority: note.priority,
      tags: note.tags || [],
      isPublic: note.isPublic,
      isPinned: note.isPinned
    });
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
      const newNote = await createNote({
        title: temp.title.trim(),
        description: temp.description?.trim() || '',
        content: temp.content?.trim() || '',
        category: temp.category,
        priority: temp.priority,
        tags: temp.tags,
        isPublic: temp.isPublic,
        isPinned: temp.isPinned,
      });
      setNotes([newNote, ...notes]);
      closeModal();
      Alert.alert('Thành công', 'Đã tạo ghi chú mới');
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể tạo ghi chú');
    }
  };

  const handleEdit = async () => {
    if (!temp.title?.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tiêu đề');
      return;
    }

    if (modal.index !== undefined && filteredNotes[modal.index]) {
      try {
        const updated = await updateNote(filteredNotes[modal.index].id, {
          title: temp.title.trim(),
          description: temp.description?.trim() || '',
          content: temp.content?.trim() || '',
          category: temp.category,
          priority: temp.priority,
          tags: temp.tags,
          isPublic: temp.isPublic,
          isPinned: temp.isPinned,
        });
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
    if (modal.index !== undefined && modal.index >= 0 && filteredNotes[modal.index!]) {
      try {
        await deleteNote(filteredNotes[modal.index!].id);
        setNotes(notes.filter(n => n.id !== filteredNotes[modal.index!].id));
        closeModal();
        Alert.alert('Thành công', 'Đã xóa ghi chú');
      } catch (error: any) {
        Alert.alert('Lỗi', error.message || 'Không thể xóa ghi chú');
      }
    }
  };

  const handleTogglePin = async (noteId: string) => {
    try {
      const updated = await togglePin(noteId);
      const newNotes = [...notes];
      const noteIndex = notes.findIndex(n => n.id === updated.id);
      if (noteIndex !== -1) {
        newNotes[noteIndex] = updated;
        setNotes(newNotes);
      }
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể thay đổi trạng thái ghim');
    }
  };

  const handleAddCategory = () => {
    setNewCategory('');
    setModal({ type: 'category' });
  };

  const handleCreateCategory = () => {
    if (!newCategory.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên danh mục');
      return;
    }

    if (categories.includes(newCategory.trim())) {
      Alert.alert('Lỗi', 'Danh mục này đã tồn tại');
      return;
    }

    setCategories([...categories, newCategory.trim()]);
    setTemp(t => ({ ...t, category: newCategory.trim() }));
    setModal({ type: null });
    Alert.alert('Thành công', 'Đã tạo danh mục mới');
  };

  const handleNotePress = (note: Note) => {
    navigation.navigate('NoteEditor', { noteId: note.id });
  };

  // UI cho nhập tags
  const renderTagInput = () => (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginVertical: 8 }}>
      {(temp.tags || []).map((tag, idx) => (
        <View key={idx} style={{ backgroundColor: currentTheme.colors.primary + '20', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4, marginRight: 6, marginBottom: 6, flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ color: currentTheme.colors.primary }}>{tag}</Text>
          <TouchableOpacity onPress={() => setTemp(t => ({ ...t, tags: (t.tags || []).filter((_, i) => i !== idx) }))}>
            <Ionicons name="close" size={14} color={currentTheme.colors.primary} style={{ marginLeft: 4 }} />
          </TouchableOpacity>
        </View>
      ))}
      <TouchableOpacity onPress={() => {
        const newTag = prompt('Nhập tag mới');
        if (newTag && newTag.trim()) setTemp(t => ({ ...t, tags: [...(t.tags || []), newTag.trim()] }));
      }} style={{ backgroundColor: currentTheme.colors.primary, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 }}>
        <Text style={{ color: '#fff' }}>+ Tag</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading && notes.length === 0) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={currentTheme.colors.primary} />
        <Text style={{ marginTop: 16, color: currentTheme.colors.textSecondary }}>Đang tải...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ghi chú của bạn</Text>

      {/* Search */}
      <TextInput
        style={styles.input}
        placeholder="Tìm kiếm ghi chú..."
        value={search}
        onChangeText={setSearch}
      />

      {/* Filters */}
      <View style={styles.filtersContainer}>
        {/* Category filter */}
        <View style={styles.filterSection}>
          <View style={styles.filterHeader}>
            <Text style={styles.filterLabel}>Danh mục:</Text>
            <TouchableOpacity onPress={handleAddCategory} style={styles.addCategoryBtn}>
              <Ionicons name="add" size={16} color={currentTheme.colors.primary} />
              <Text style={styles.addCategoryText}>Thêm</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            horizontal
            data={categories}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.filterBtn, selectedCategory === item && styles.filterBtnActive]}
                onPress={() => setSelectedCategory(item)}
              >
                <Text style={[styles.filterText, selectedCategory === item && styles.filterTextActive]}>
                  {item}
                </Text>
              </TouchableOpacity>
            )}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterList}
          />
        </View>

        {/* Priority filter */}
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>Độ ưu tiên:</Text>
          <FlatList
            horizontal
            data={priorities}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.filterBtn, selectedPriority === item && styles.filterBtnActive]}
                onPress={() => setSelectedPriority(item)}
              >
                <Text style={[styles.filterText, selectedPriority === item && styles.filterTextActive]}>
                  {item === t('notes.all') ? t('notes.all') : item}
                </Text>
              </TouchableOpacity>
            )}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterList}
          />
        </View>

        {/* Pinned filter */}
        <TouchableOpacity
          style={[styles.pinnedFilter, showPinnedOnly && styles.pinnedFilterActive]}
          onPress={() => setShowPinnedOnly(!showPinnedOnly)}
        >
          <Ionicons
            name={showPinnedOnly ? "pin" : "pin-outline"}
            size={16}
            color={showPinnedOnly ? '#fff' : currentTheme.colors.primary}
          />
          <Text style={[styles.pinnedFilterText, showPinnedOnly && styles.pinnedFilterTextActive]}>
            {t('notes.onlyPinned')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Notes List */}
      {filteredNotes.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Ionicons name="document-text-outline" size={64} color={currentTheme.colors.textSecondary} />
          <Text style={{ marginTop: 16, color: currentTheme.colors.textSecondary, fontSize: 16 }}>
            {loading ? t('notes.loading') : t('notes.noNotes')}
          </Text>
          {!loading && (
            <TouchableOpacity style={styles.createFirstBtn} onPress={openAdd}>
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
              description={item.description}
              content={item.content}
              tags={item.tags}
              category={item.category}
              priority={item.priority}
              color={item.color}
              isPinned={item.isPinned}
              isPublic={item.isPublic}
              createdAt={item.createdAt}
              onPress={() => handleNotePress(item)}
              onEdit={() => openEdit(index)}
              onDelete={() => openDelete(index)}
              onTogglePin={() => handleTogglePin(item.id)}
            />
          )}
          contentContainerStyle={{ paddingBottom: 80 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={openAdd}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Modals */}
      <ModalCard
        visible={modal.type === 'add'}
        type="add"
        title={t('notes.addNote')}
        fields={[
          { label: t('notes.title'), value: temp.title, onChange: v => setTemp(t => ({ ...t, title: v })) },
          { label: t('notes.description'), value: temp.description, onChange: v => setTemp(t => ({ ...t, description: v })) },
          { label: t('notes.content'), value: temp.content, onChange: v => setTemp(t => ({ ...t, content: v })), multiline: true },
          {
            label: t('notes.category'),
            value: temp.category,
            onChange: v => setTemp(t => ({ ...t, category: v })),
            type: 'category',
            categories: categories,
            onAddCategory: handleAddCategory
          },
        ]}
        extraContent={renderTagInput()}
        isPinned={temp.isPinned}
        onTogglePinned={() => setTemp(t => ({ ...t, isPinned: !t.isPinned }))}
        priority={temp.priority}
        onPriorityChange={(priority) => setTemp(t => ({ ...t, priority }))}
        onSubmit={handleAdd}
        onCancel={closeModal}
      />

      <ModalCard
        visible={modal.type === 'edit'}
        type="edit"
        title={t('notes.editNote')}
        fields={[
          { label: t('notes.title'), value: temp.title, onChange: v => setTemp(t => ({ ...t, title: v })) },
          { label: t('notes.description'), value: temp.description, onChange: v => setTemp(t => ({ ...t, description: v })) },
          { label: t('notes.content'), value: temp.content, onChange: v => setTemp(t => ({ ...t, content: v })), multiline: true },
          {
            label: t('notes.category'),
            value: temp.category,
            onChange: v => setTemp(t => ({ ...t, category: v })),
            type: 'category',
            categories: categories,
            onAddCategory: handleAddCategory
          },
        ]}
        extraContent={renderTagInput()}
        isPinned={temp.isPinned}
        onTogglePinned={() => setTemp(t => ({ ...t, isPinned: !t.isPinned }))}
        priority={temp.priority}
        onPriorityChange={(priority) => setTemp(t => ({ ...t, priority }))}
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

      {/* Add Category Modal */}
      <ModalCard
        visible={modal.type === 'category'}
        type="add"
        title={t('notes.addCategory')}
        fields={[
          { label: t('notes.categoryName'), value: newCategory, onChange: setNewCategory },
        ]}
        onSubmit={handleCreateCategory}
        onCancel={closeModal}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5', // Default background, will be overridden by ThemeContext
    padding: 20, // Default padding, will be overridden by ThemeContext
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333', // Default color, will be overridden by ThemeContext
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#fff', // Default background, will be overridden by ThemeContext
    borderRadius: 8, // Default radius, will be overridden by ThemeContext
    padding: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0', // Default border, will be overridden by ThemeContext
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
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555', // Default color, will be overridden by ThemeContext
  },
  addCategoryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0f7fa', // Default background, will be overridden by ThemeContext
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  addCategoryText: {
    color: '#007bff', // Default color, will be overridden by ThemeContext
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  filterList: {
    paddingRight: 16,
  },
  filterBtn: {
    backgroundColor: '#e0f7fa', // Default background, will be overridden by ThemeContext
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  filterBtnActive: {
    backgroundColor: '#007bff', // Default background, will be overridden by ThemeContext
  },
  filterText: {
    color: '#007bff', // Default color, will be overridden by ThemeContext
    fontSize: 14,
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#fff',
  },
  pinnedFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0f7fa', // Default background, will be overridden by ThemeContext
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: 'flex-start',
  },
  pinnedFilterActive: {
    backgroundColor: '#007bff', // Default background, will be overridden by ThemeContext
  },
  pinnedFilterText: {
    color: '#007bff', // Default color, will be overridden by ThemeContext
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  pinnedFilterTextActive: {
    color: '#fff',
  },
  createFirstBtn: {
    backgroundColor: '#007bff', // Default background, will be overridden by ThemeContext
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginTop: 16,
  },
  createFirstText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 32,
    backgroundColor: '#007bff', // Default background, will be overridden by ThemeContext
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