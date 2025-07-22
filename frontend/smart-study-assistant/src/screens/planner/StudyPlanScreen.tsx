import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import ModalCard from '../../components/ModalCard';
import TimeWheelPickerModal from '../../components/TimeWheelPickerModal';
import { getStudyPlans, createStudyPlan, updateStudyPlan, deleteStudyPlan, toggleStudyPlanCompletion, StudyPlan } from '../../services/studyPlanService';

const StudyPlanScreen = ({ navigation }: any) => {
  const { t } = useTranslation();
  const { currentTheme } = useTheme();
  const [selected, setSelected] = useState(new Date().toISOString().split('T')[0]);
  const [sessions, setSessions] = useState<StudyPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [operationLoading, setOperationLoading] = useState(false);
  const [modal, setModal] = useState<{ type: 'add' | 'edit' | 'delete' | null, index?: number }>({ type: null });
  const [temp, setTemp] = useState({ title: '', startTime: '09:00', endTime: '10:00', note: '' });
  const [timePickerVisible, setTimePickerVisible] = useState(false);
  const [timePickerMode, setTimePickerMode] = useState<'start' | 'end'>('start');

  useEffect(() => {
    fetchStudyPlans();
  }, [selected]);

  const fetchStudyPlans = async () => {
    setLoading(true);
    try {
      const data = await getStudyPlans(selected);
      // Sắp xếp theo thời gian bắt đầu
      const sortedData = data.sort((a, b) => {
        const timeA = new Date(`2000-01-01T${a.startTime}`);
        const timeB = new Date(`2000-01-01T${b.startTime}`);
        return timeA.getTime() - timeB.getTime();
      });
      setSessions(sortedData);
    } catch (error: any) {
      Alert.alert(t('study_plan.error'), error.message || t('study_plan.loadError'));
    } finally {
      setLoading(false);
    }
  };

  // Modal handlers
  const openAdd = () => {
    const now = new Date();
    const currentHour = now.getHours().toString().padStart(2, '0');
    const currentMinute = Math.floor(now.getMinutes() / 30) * 30;
    const currentTime = `${currentHour}:${currentMinute.toString().padStart(2, '0')}`;
    const nextTime = `${currentHour}:${(currentMinute + 30).toString().padStart(2, '0')}`;

    setTemp({ title: '', startTime: currentTime, endTime: nextTime, note: '' });
    setModal({ type: 'add' });
  };

  const openEdit = (i: number) => {
    setTemp({
      title: sessions[i].title,
      startTime: sessions[i].startTime,
      endTime: sessions[i].endTime,
      note: sessions[i].note || ''
    });
    setModal({ type: 'edit', index: i });
  };

  const openDelete = (i: number) => setModal({ type: 'delete', index: i });
  const closeModal = () => setModal({ type: null });

  const openTimePicker = (mode: 'start' | 'end') => {
    setTimePickerMode(mode);
    setTimePickerVisible(true);
  };

  const handleTimeConfirm = (startTime: string, endTime: string) => {
    setTemp(prev => ({ ...prev, startTime, endTime }));
  };

  // CRUD
  const handleAdd = async () => {
    if (!temp.title.trim()) {
      Alert.alert(t('study_plan.error'), t('study_plan.titleRequired'));
      return;
    }

    setOperationLoading(true);
    try {
      const newPlan = await createStudyPlan({
        title: temp.title.trim(),
        date: selected,
        startTime: temp.startTime,
        endTime: temp.endTime,
        note: temp.note.trim() || undefined,
      });
      setSessions([newPlan, ...sessions]);
      closeModal();
      Alert.alert(t('study_plan.success'), t('study_plan.addSuccess'));
    } catch (error: any) {
      Alert.alert(t('study_plan.error'), error.message || t('study_plan.addError'));
    } finally {
      setOperationLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!temp.title.trim()) {
      Alert.alert(t('study_plan.error'), t('study_plan.titleRequired'));
      return;
    }

    if (modal.index !== undefined && sessions[modal.index]) {
      setOperationLoading(true);
      try {
        const updated = await updateStudyPlan(sessions[modal.index].id, {
          title: temp.title.trim(),
          startTime: temp.startTime,
          endTime: temp.endTime,
          note: temp.note.trim() || undefined,
          date: selected, // luôn truyền date hợp lệ
        });
        const newSessions = [...sessions];
        newSessions[modal.index] = updated;
        setSessions(newSessions);
        closeModal();
        Alert.alert(t('study_plan.success'), t('study_plan.updateSuccess'));
      } catch (error: any) {
        Alert.alert(t('study_plan.error'), error.message || t('study_plan.updateError'));
      } finally {
        setOperationLoading(false);
      }
    }
  };

  const handleDelete = async () => {
    if (modal.index !== undefined && sessions[modal.index]) {
      setOperationLoading(true);
      try {
        await deleteStudyPlan(sessions[modal.index].id);
        setSessions(sessions.filter((_, i) => i !== modal.index));
        closeModal();
        Alert.alert(t('study_plan.success'), t('study_plan.deleteSuccess'));
      } catch (error: any) {
        Alert.alert(t('study_plan.error'), error.message || t('study_plan.deleteError'));
      } finally {
        setOperationLoading(false);
      }
    }
  };

  const handleToggleCompletion = async (session: StudyPlan) => {
    try {
      const updated = await toggleStudyPlanCompletion(session.id);
      const newSessions = sessions.map(s =>
        s.id === session.id ? updated : s
      );
      setSessions(newSessions);
    } catch (error: any) {
      Alert.alert(t('study_plan.error'), error.message || t('study_plan.toggleError'));
    }
  };

  const formatDuration = (startTime: string, endTime: string) => {
    const startMinutes = parseInt(startTime.split(':')[0]) * 60 + parseInt(startTime.split(':')[1]);
    const endMinutes = parseInt(endTime.split(':')[0]) * 60 + parseInt(endTime.split(':')[1]);
    const duration = endMinutes - startMinutes;
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    return `${hours}h ${minutes}m`;
  };

  const renderSession = ({ item, index }: { item: StudyPlan; index: number }) => (
    <View style={[styles.sessionCard, item.completed && styles.completedSession]}>
      <TouchableOpacity
        style={styles.completionButton}
        onPress={() => handleToggleCompletion(item)}
      >
        <Ionicons
          name={item.completed ? "checkmark-circle" : "ellipse-outline"}
          size={24}
          color={item.completed ? currentTheme.colors.primary : currentTheme.colors.textSecondary}
        />
      </TouchableOpacity>
      <View style={styles.sessionContent}>
        <Text style={[styles.sessionTitle, item.completed && styles.completedText]}>
          {item.title}
        </Text>
        <Text style={[styles.sessionDesc, item.completed && styles.completedText]}>
          {item.startTime} - {item.endTime} ({formatDuration(item.startTime, item.endTime)})
        </Text>
        {item.note && (
          <Text style={[styles.sessionNote, item.completed && styles.completedText]}>
            {item.note}
          </Text>
        )}
      </View>
      <View style={styles.sessionActions}>
        <TouchableOpacity onPress={() => openEdit(index)} style={{ marginLeft: 8 }}>
          <Ionicons name="create-outline" size={18} color={currentTheme.colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => openDelete(index)} style={{ marginLeft: 8 }}>
          <Ionicons name="trash-outline" size={18} color={currentTheme.colors.error} />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={currentTheme.colors.primary} />
        <Text style={{ marginTop: 16, color: currentTheme.colors.textSecondary }}>{t('study_plan.loading')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('Study plan')}</Text>
      <Calendar
        current={selected}
        onDayPress={day => setSelected(day.dateString)}
        markedDates={{
          [selected]: { selected: true, selectedColor: currentTheme.colors.primary },
          ...sessions.reduce((acc, session) => {
            const dateStr = new Date(session.date).toISOString().split('T')[0];
            acc[dateStr] = {
              marked: true,
              dotColor: session.completed ? currentTheme.colors.primary : currentTheme.colors.secondary
            };
            return acc;
          }, {} as any)
        }}
        theme={{
          todayTextColor: currentTheme.colors.primary,
          arrowColor: currentTheme.colors.primary,
          textDayFontWeight: 'bold',
        }}
        style={styles.calendar}
      />
      <Text style={styles.sectionTitle}>{t('study_plan.sessions_for_day')}</Text>

      {sessions.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Ionicons name="calendar-outline" size={64} color={currentTheme.colors.textSecondary} />
          <Text style={{ marginTop: 16, color: currentTheme.colors.textSecondary, fontSize: 16 }}>
            {t('study_plan.no_study_plans_for_day')}
          </Text>
          <TouchableOpacity style={styles.createFirstBtn} onPress={openAdd}>
            <Text style={styles.createFirstText}>{t('study_plan.add_first_study_plan')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={sessions}
          keyExtractor={(item) => item.id}
          renderItem={renderSession}
          ListEmptyComponent={<Text style={styles.empty}>{t('study_plan.no_sessions')}</Text>}
          contentContainerStyle={{ paddingBottom: 80 }}
          refreshing={loading}
          onRefresh={fetchStudyPlans}
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={openAdd} disabled={operationLoading}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>


      {/* ModalCard cho Thêm/Sửa/Xóa */}
      <ModalCard
        visible={modal.type === 'add'}
        type="add"
        title={t('study_plan.add_study_plan')}
        fields={[
          { label: t('study_plan.title'), value: temp.title, onChange: v => setTemp(t => ({ ...t, title: v })) },
          { label: t('study_plan.note'), value: temp.note, onChange: v => setTemp(t => ({ ...t, note: v })), multiline: true },
        ]}
        extraContent={
          <View style={styles.timeFieldContainer}>
            <Text style={styles.timeFieldLabel}>{t('study_plan.time')}</Text>
            <TouchableOpacity
              style={styles.timeFieldButton}
              onPress={() => openTimePicker('start')}
            >
              <Text style={styles.timeFieldText}>{temp.startTime} - {temp.endTime}</Text>
              <Ionicons name="time-outline" size={20} color={currentTheme.colors.primary} />
            </TouchableOpacity>
          </View>
        }
        onSubmit={handleAdd}
        onCancel={closeModal}
      />
      <ModalCard
        visible={modal.type === 'edit'}
        type="edit"
        title={t('study_plan.edit_study_plan')}
        fields={[
          { label: t('study_plan.title'), value: temp.title, onChange: v => setTemp(t => ({ ...t, title: v })) },
          { label: t('study_plan.note'), value: temp.note, onChange: v => setTemp(t => ({ ...t, note: v })), multiline: true },
        ]}
        extraContent={
          <View style={styles.timeFieldContainer}>
            <Text style={styles.timeFieldLabel}>{t('study_plan.time')}</Text>
            <TouchableOpacity
              style={styles.timeFieldButton}
              onPress={() => openTimePicker('start')}
            >
              <Text style={styles.timeFieldText}>{temp.startTime} - {temp.endTime}</Text>
              <Ionicons name="time-outline" size={20} color={currentTheme.colors.primary} />
            </TouchableOpacity>
          </View>
        }
        onSubmit={handleEdit}
        onCancel={closeModal}
      />
      <ModalCard
        visible={modal.type === 'delete'}
        type="delete"
        title={t('study_plan.delete_study_plan')}
        onSubmit={handleDelete}
        onCancel={closeModal}
      />

      {/* Time Picker Modal */}
      <TimeWheelPickerModal
        visible={timePickerVisible}
        onClose={() => setTimePickerVisible(false)}
        onConfirm={handleTimeConfirm}
        initialStartTime={temp.startTime}
        initialEndTime={temp.endTime}
      />

      {operationLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={currentTheme.colors.primary} />
          <Text style={{ marginTop: 8, color: currentTheme.colors.textSecondary }}>{t('study_plan.processing')}</Text>
        </View>
      )}
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
    color: '#333', // Default text color, will be overridden by ThemeContext
    marginBottom: 12,
  },
  calendar: {
    borderRadius: 10, // Default radius, will be overridden by ThemeContext
    marginBottom: 18,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#333', // Default text color, will be overridden by ThemeContext
    marginBottom: 10,
  },
  sessionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff', // Default card color, will be overridden by ThemeContext
    borderRadius: 10, // Default radius, will be overridden by ThemeContext
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  completedSession: {
    opacity: 0.7,
    backgroundColor: '#e0f7fa', // Default primaryLight, will be overridden by ThemeContext
  },
  completionButton: {
    marginRight: 12,
  },
  sessionContent: {
    flex: 1,
  },
  sessionTitle: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#333', // Default text color, will be overridden by ThemeContext
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#666', // Default textSecondary, will be overridden by ThemeContext
  },
  sessionDesc: {
    color: '#666', // Default textSecondary, will be overridden by ThemeContext
    fontSize: 14,
    marginTop: 2,
  },
  sessionNote: {
    color: '#666', // Default textSecondary, will be overridden by ThemeContext
    fontSize: 13,
    marginTop: 4,
    fontStyle: 'italic',
  },
  sessionActions: {
    flexDirection: 'row',
  },
  empty: {
    color: '#666', // Default textSecondary, will be overridden by ThemeContext
    textAlign: 'center',
    marginTop: 20,
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 32,
    backgroundColor: '#4CAF50', // Default primary, will be overridden by ThemeContext
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
  createFirstBtn: {
    marginTop: 16,
    backgroundColor: '#4CAF50', // Default primary, will be overridden by ThemeContext
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
  timeFieldContainer: {
    marginBottom: 14,
  },
  timeFieldLabel: {
    color: '#333', // Default text color, will be overridden by ThemeContext
    fontSize: 15,
    marginBottom: 4,
    fontWeight: '500',
  },
  timeFieldButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#e0f7fa', // Default primaryLight, will be overridden by ThemeContext
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc', // Default border, will be overridden by ThemeContext
  },
  timeFieldText: {
    fontSize: 16,
    color: '#333', // Default text color, will be overridden by ThemeContext
  },
});

export default StudyPlanScreen;
