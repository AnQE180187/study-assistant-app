import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../constants/themes';
import {
  Note,
  getNoteById,
  updateNote,
  deleteNote,
  getCategories,
  createNote,
} from '../../services/notesService';
import { useTranslation } from 'react-i18next';

interface RouteParams {
  noteId?: string;
}

const NoteEditorScreen: React.FC = () => {
  const { t } = useTranslation();
  const route = useRoute();
  const navigation = useNavigation();
  const { noteId } = route.params as RouteParams;
  
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [categories, setCategories] = useState<string[]>(['Chung']);
  const [showCategoryInput, setShowCategoryInput] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Chung');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [tags, setTags] = useState<string[]>([]);
  const [isPublic, setIsPublic] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    fetchCategories();
    if (noteId) {
      loadNote();
    }
  }, [noteId]);

  const fetchCategories = async () => {
    try {
      const fetchedCategories = await getCategories();
      setCategories([t('notes.general'), ...fetchedCategories.filter(cat => cat !== t('notes.general'))]);
    } catch (error: any) {
      console.error(t('notes.error'), error);
    }
  };

  const loadNote = async () => {
    if (!noteId) return;
    
    setLoading(true);
    try {
      const fetchedNote = await getNoteById(noteId);
      setNote(fetchedNote);
      setTitle(fetchedNote.title);
      setDescription(fetchedNote.description || '');
      setContent(fetchedNote.content);
      setCategory(fetchedNote.category);
      setPriority(fetchedNote.priority);
      setTags(fetchedNote.tags || []);
      setIsPublic(fetchedNote.isPublic);
      setIsPinned(fetchedNote.isPinned);
    } catch (error: any) {
      Alert.alert(t('notes.error'), error.message || t('notes.loadError'));
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const checkChanges = () => {
    if (!note) return true;
    
    return (
      title !== note.title ||
      description !== (note.description || '') ||
      content !== note.content ||
      category !== note.category ||
      priority !== note.priority ||
      JSON.stringify(tags) !== JSON.stringify(note.tags || []) ||
      isPublic !== note.isPublic ||
      isPinned !== note.isPinned
    );
  };

  useEffect(() => {
    setHasChanges(checkChanges());
  }, [title, description, content, category, priority, tags, isPublic, isPinned]);

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
      setHasChanges(true);
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
    setHasChanges(true);
  };

  const handleAddCategory = () => {
    setShowCategoryInput(true);
    setNewCategory('');
  };

  const handleCreateCategory = () => {
    if (!newCategory.trim()) {
      Alert.alert(t('notes.error'), t('notes.categoryNameRequired'));
      return;
    }
    
    if (categories.includes(newCategory.trim())) {
      Alert.alert(t('notes.error'), t('notes.categoryExists'));
      return;
    }
    
    setCategories([...categories, newCategory.trim()]);
    setCategory(newCategory.trim());
    setShowCategoryInput(false);
    setNewCategory('');
    setHasChanges(true);
    Alert.alert(t('notes.success'), t('notes.categoryAdded'));
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert(t('notes.error'), t('notes.titleRequired'));
      return;
    }

    setSaving(true);
    try {
      const noteData = {
        title: title.trim(),
        description: description.trim(),
        content: content.trim(),
        category,
        priority,
        tags,
        isPublic,
        isPinned,
      };

      if (noteId) {
        await updateNote(noteId, noteData);
        Alert.alert(t('notes.success'), t('notes.editSuccess'));
      } else {
        await createNote(noteData);
        Alert.alert(t('notes.success'), t('notes.addSuccess'));
      }
      
      setHasChanges(false);
      navigation.goBack();
    } catch (error: any) {
      Alert.alert(t('notes.error'), error.message || t('notes.addError'));
    } finally {
      setSaving(false);
    }
  };

  const deleteNoteHandler = async () => {
    if (!noteId) return;
    
    Alert.alert(
      t('notes.deleteNote'),
      t('notes.deleteConfirm') || 'Bạn có chắc chắn muốn xóa ghi chú này không?',
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.confirm'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteNote(noteId);
              Alert.alert(t('notes.success'), t('notes.deleteSuccess'));
              navigation.goBack();
            } catch (error: any) {
              Alert.alert(t('notes.error'), error.message || t('notes.deleteError'));
            }
          },
        },
      ]
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#FF6B6B';
      case 'medium': return '#FFA726';
      case 'low': return '#66BB6A';
      default: return COLORS.textSecondary;
    }
  };

  const handleBack = () => {
    if (hasChanges) {
      Alert.alert(
        t('common.cancel'),
        t('notes.unsavedChanges') || 'Bạn có thay đổi chưa lưu. Bạn có muốn thoát không?',
        [
          { text: t('common.cancel'), style: 'cancel' },
          { text: t('common.confirm'), onPress: () => navigation.goBack() },
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ marginTop: 16, color: COLORS.textSecondary }}>{t('notes.loading')}</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        
        <View style={styles.headerActions}>
          {noteId && (
            <TouchableOpacity onPress={deleteNoteHandler} style={styles.actionBtn}>
              <Ionicons name="trash-outline" size={24} color={COLORS.error} />
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            onPress={handleSave} 
            style={[styles.saveBtn, !hasChanges && styles.saveBtnDisabled]}
            disabled={!hasChanges || saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="checkmark" size={24} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Title */}
        <TextInput
          style={styles.titleInput}
          placeholder={t('notes.titlePlaceholder') || 'Tiêu đề ghi chú...'}
          value={title}
          onChangeText={setTitle}
          placeholderTextColor={COLORS.textSecondary}
        />

        {/* Description */}
        <TextInput
          style={styles.descriptionInput}
          placeholder={t('notes.descriptionPlaceholder') || 'Mô tả ngắn gọn (tùy chọn)...'}
          value={description}
          onChangeText={setDescription}
          placeholderTextColor={COLORS.textSecondary}
          multiline
        />

        {/* Priority and Category */}
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>{t('notes.priority')}</Text>
            <View style={styles.priorityContainer}>
              {(['low', 'medium', 'high'] as const).map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[
                    styles.priorityBtn,
                    priority === p && { backgroundColor: getPriorityColor(p) }
                  ]}
                  onPress={() => setPriority(p)}
                >
                  <Text style={[
                    styles.priorityText,
                    priority === p && styles.priorityTextActive
                  ]}>
                    {p === 'low' ? t('notes.priorityLow') : p === 'medium' ? t('notes.priorityMedium') : t('notes.priorityHigh')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.metaItem}>
            <View style={styles.metaLabelRow}>
              <Text style={styles.metaLabel}>{t('notes.category')}</Text>
              <TouchableOpacity onPress={handleAddCategory} style={styles.addCategoryBtn}>
                <Ionicons name="add" size={16} color={COLORS.primary} />
                <Text style={styles.addCategoryText}>{t('notes.addCategory')}</Text>
              </TouchableOpacity>
            </View>
            {showCategoryInput ? (
              <View style={styles.categoryInputContainer}>
                <TextInput
                  style={styles.categoryInput}
                  placeholder={t('notes.categoryNamePlaceholder') || 'Nhập tên danh mục mới...'}
                  value={newCategory}
                  onChangeText={setNewCategory}
                  onSubmitEditing={handleCreateCategory}
                  returnKeyType="done"
                />
                <TouchableOpacity onPress={handleCreateCategory} style={styles.createCategoryBtn}>
                  <Ionicons name="checkmark" size={16} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShowCategoryInput(false)} style={styles.cancelCategoryBtn}>
                  <Ionicons name="close" size={16} color={COLORS.textSecondary} />
                </TouchableOpacity>
              </View>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.categoryBtn, category === cat && styles.categoryBtnActive]}
                    onPress={() => setCategory(cat)}
                  >
                    <Text style={[styles.categoryText, category === cat && styles.categoryTextActive]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        </View>

        {/* Tags */}
        <View style={styles.tagsSection}>
          <Text style={styles.sectionTitle}>{t('notes.tags')}</Text>
          <View style={styles.tagsContainer}>
            {tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
                <TouchableOpacity onPress={() => removeTag(tag)}>
                  <Ionicons name="close" size={14} color={COLORS.primary} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
          <View style={styles.addTagContainer}>
            <TextInput
              style={styles.tagInput}
              placeholder={t('notes.addTagPlaceholder') || 'Thêm tag...'}
              value={newTag}
              onChangeText={setNewTag}
              onSubmitEditing={addTag}
              returnKeyType="done"
            />
            <TouchableOpacity onPress={addTag} style={styles.addTagBtn}>
              <Ionicons name="add" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Toggles */}
        <View style={styles.togglesSection}>
          <TouchableOpacity 
            style={styles.toggleRow} 
            onPress={() => setIsPublic(!isPublic)}
          >
            <Ionicons 
              name={isPublic ? 'earth' : 'lock-closed'} 
              size={20} 
              color={isPublic ? COLORS.primary : COLORS.textSecondary} 
            />
            <Text style={[styles.toggleText, isPublic && styles.toggleTextActive]}>
              {isPublic ? t('notes.public') : t('notes.private')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.toggleRow} 
            onPress={() => setIsPinned(!isPinned)}
          >
            <Ionicons 
              name={isPinned ? 'pin' : 'pin-outline'} 
              size={20} 
              color={isPinned ? COLORS.primary : COLORS.textSecondary} 
            />
            <Text style={[styles.toggleText, isPinned && styles.toggleTextActive]}>
              {isPinned ? t('notes.pinned') : t('notes.pin')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.contentSection}>
          <Text style={styles.sectionTitle}>{t('notes.content')}</Text>
          <TextInput
            style={styles.contentInput}
            placeholder={t('notes.contentPlaceholder') || 'Viết nội dung ghi chú của bạn...'}
            value={content}
            onChangeText={setContent}
            placeholderTextColor={COLORS.textSecondary}
            multiline
            textAlignVertical="top"
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  backBtn: {
    padding: 8,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionBtn: {
    padding: 8,
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    padding: 8,
  },
  saveBtnDisabled: {
    backgroundColor: COLORS.textSecondary,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  titleInput: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
    paddingVertical: 8,
  },
  descriptionInput: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 20,
    paddingVertical: 8,
    minHeight: 40,
  },
  metaRow: {
    marginBottom: 20,
  },
  metaItem: {
    marginBottom: 16,
  },
  metaLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  priorityContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityBtn: {
    flex: 1,
    backgroundColor: COLORS.primaryLight,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  priorityText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  priorityTextActive: {
    color: '#fff',
  },
  categoryBtn: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  categoryBtnActive: {
    backgroundColor: COLORS.primary,
  },
  categoryText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
  },
  categoryTextActive: {
    color: '#fff',
  },
  tagsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  tag: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tagText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '500',
  },
  addTagContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  tagInput: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  addTagBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  togglesSection: {
    marginBottom: 20,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 8,
  },
  toggleText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  toggleTextActive: {
    color: COLORS.primary,
    fontWeight: '500',
  },
  contentSection: {
    marginBottom: 20,
  },
  contentInput: {
    backgroundColor: COLORS.card,
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: COLORS.text,
    minHeight: 200,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  metaLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addCategoryBtn: {
    padding: 8,
  },
  addCategoryText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
  },
  categoryInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryInput: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  createCategoryBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelCategoryBtn: {
    padding: 8,
  },
});

export default NoteEditorScreen; 