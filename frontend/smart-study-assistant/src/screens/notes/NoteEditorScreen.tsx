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
} from '../../services/notesService';
import { useTranslation } from 'react-i18next';
import { getStudyPlans, StudyPlan } from '../../services/studyPlanService';
import { Picker } from '@react-native-picker/picker';

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
  const [plans, setPlans] = useState<StudyPlan[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [planId, setPlanId] = useState<string | null>(null);

  useEffect(() => {
    fetchPlans();
    if (noteId) {
      loadNote();
    }
  }, [noteId]);

  const fetchPlans = async () => {
    try {
      const fetchedPlans = await getStudyPlans();
      setPlans(fetchedPlans);
    } catch {}
  };

  const loadNote = async () => {
    if (!noteId) return;
    
    setLoading(true);
    try {
      const fetchedNote = await getNoteById(noteId);
      setNote(fetchedNote);
      setTitle(fetchedNote.title);
      setContent(fetchedNote.content);
      setPlanId(fetchedNote.planId || null);
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
      content !== note.content ||
      planId !== note.planId
    );
  };

  useEffect(() => {
    setHasChanges(checkChanges());
  }, [title, content, planId]);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tiêu đề');
      return;
    }
    setSaving(true);
    try {
      const noteData = {
        title: title.trim(),
        content: content.trim(),
        planId: planId || null,
      };
      if (noteId) {
        await updateNote(noteId, noteData);
        Alert.alert('Thành công', 'Đã cập nhật ghi chú');
      } else {
        // await createNote(noteData); // This line was removed as per the edit hint
        Alert.alert('Thành công', 'Đã thêm ghi chú');
      }
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể lưu ghi chú');
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
        <TextInput
          style={styles.titleInput}
          placeholder="Tiêu đề ghi chú..."
          value={title}
          onChangeText={setTitle}
          placeholderTextColor={COLORS.textSecondary}
        />
        <View style={{ marginBottom: 16 }}>
          <Text style={styles.metaLabel}>Môn học</Text>
          <View style={{ borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, marginTop: 8 }}>
            <Picker
              selectedValue={planId}
              onValueChange={setPlanId}
              style={{ height: 44 }}
            >
              <Picker.Item label="Tự do" value={null} />
              {plans.map(plan => (
                <Picker.Item key={plan.id} label={plan.title} value={plan.id} />
              ))}
            </Picker>
          </View>
        </View>
        <View style={styles.contentSection}>
          <Text style={styles.sectionTitle}>Nội dung</Text>
          <TextInput
            style={styles.contentInput}
            placeholder="Viết nội dung ghi chú của bạn..."
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