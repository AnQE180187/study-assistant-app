import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { COLORS, SIZES } from '../../constants/themes';
import { Ionicons } from '@expo/vector-icons';
import ModalCard from '../../components/ModalCard';
import { getStudyPlans, createStudyPlan, updateStudyPlan, deleteStudyPlan, toggleStudyPlanCompletion, StudyPlan } from '../../services/studyPlanService';

const StudyPlanScreen = ({ navigation }: any) => {
  const [selected, setSelected] = useState(new Date().toISOString().split('T')[0]);
  const [sessions, setSessions] = useState<StudyPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [operationLoading, setOperationLoading] = useState(false);
  const [modal, setModal] = useState<{ type: 'add' | 'edit' | 'delete' | null, index?: number }>({ type: null });
  const [temp, setTemp] = useState({ title: '', time: '', note: '' });

  useEffect(() => {
    fetchStudyPlans();
  }, [selected]);

  const fetchStudyPlans = async () => {
    setLoading(true);
    try {
      const data = await getStudyPlans(selected);
      setSessions(data);
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể tải lịch học');
    } finally {
      setLoading(false);
    }
  };

  // Modal handlers
  const openAdd = () => {
    setTemp({ title: '', time: '', note: '' });
    setModal({ type: 'add' });
  };
  const openEdit = (i: number) => {
    setTemp({ 
      title: sessions[i].title, 
      time: sessions[i].time, 
      note: sessions[i].note || '' 
    });
    setModal({ type: 'edit', index: i });
  };
  const openDelete = (i: number) => setModal({ type: 'delete', index: i });
  const closeModal = () => setModal({ type: null });

  // CRUD
  const handleAdd = async () => {
    if (!temp.title.trim() || !temp.time.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tiêu đề và giờ học');
      return;
    }
    
    setOperationLoading(true);
    try {
      const newPlan = await createStudyPlan({
        title: temp.title.trim(),
        date: selected,
        time: temp.time.trim(),
        note: temp.note.trim() || undefined,
      });
      setSessions([newPlan, ...sessions]);
      closeModal();
      Alert.alert('Thành công', 'Đã thêm lịch học mới');
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể thêm lịch học');
    } finally {
      setOperationLoading(false);
    }
  };
  
  const handleEdit = async () => {
    if (!temp.title.trim() || !temp.time.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tiêu đề và giờ học');
      return;
    }
    
    if (modal.index !== undefined && sessions[modal.index]) {
      setOperationLoading(true);
      try {
        const updated = await updateStudyPlan(sessions[modal.index].id, {
          title: temp.title.trim(),
          time: temp.time.trim(),
          note: temp.note.trim() || undefined,
        });
        const newSessions = [...sessions];
        newSessions[modal.index] = updated;
        setSessions(newSessions);
        closeModal();
        Alert.alert('Thành công', 'Đã cập nhật lịch học');
      } catch (error: any) {
        Alert.alert('Lỗi', error.message || 'Không thể cập nhật lịch học');
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
        Alert.alert('Thành công', 'Đã xóa lịch học');
      } catch (error: any) {
        Alert.alert('Lỗi', error.message || 'Không thể xóa lịch học');
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
      Alert.alert('Lỗi', error.message || 'Không thể cập nhật trạng thái');
    }
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
          color={item.completed ? COLORS.primary : COLORS.textSecondary} 
        />
      </TouchableOpacity>
      <View style={styles.sessionContent}>
        <Text style={[styles.sessionTitle, item.completed && styles.completedText]}>
          {item.title}
        </Text>
        <Text style={[styles.sessionDesc, item.completed && styles.completedText]}>
          {item.time} - {item.note || 'Không có ghi chú'}
        </Text>
      </View>
      <View style={styles.sessionActions}>
        <TouchableOpacity onPress={() => openEdit(index)} style={{ marginLeft: 8 }}>
          <Ionicons name="create-outline" size={18} color={COLORS.primary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => openDelete(index)} style={{ marginLeft: 8 }}>
          <Ionicons name="trash-outline" size={18} color={COLORS.error} />
        </TouchableOpacity>
      </View>
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
      <Text style={styles.title}>Kế hoạch học tập</Text>
      <Calendar
        current={selected}
        onDayPress={day => setSelected(day.dateString)}
        markedDates={{ 
          [selected]: { selected: true, selectedColor: COLORS.primary },
          ...sessions.reduce((acc, session) => {
            const dateStr = new Date(session.date).toISOString().split('T')[0];
            acc[dateStr] = { 
              marked: true, 
              dotColor: session.completed ? COLORS.primary : COLORS.secondary 
            };
            return acc;
          }, {} as any)
        }}
        theme={{
          todayTextColor: COLORS.primary,
          arrowColor: COLORS.primary,
          textDayFontWeight: 'bold',
        }}
        style={styles.calendar}
      />
      <Text style={styles.sectionTitle}>Session trong ngày</Text>
      
      {sessions.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Ionicons name="calendar-outline" size={64} color={COLORS.textSecondary} />
          <Text style={{ marginTop: 16, color: COLORS.textSecondary, fontSize: 16 }}>
            Không có lịch học nào cho ngày này
          </Text>
          <TouchableOpacity style={styles.createFirstBtn} onPress={openAdd}>
            <Text style={styles.createFirstText}>Thêm lịch học đầu tiên</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={sessions}
          keyExtractor={(item) => item.id}
          renderItem={renderSession}
          ListEmptyComponent={<Text style={styles.empty}>Không có session nào.</Text>}
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
        title="Thêm lịch học"
        fields={[
          { label: 'Tiêu đề', value: temp.title, onChange: v => setTemp(t => ({ ...t, title: v })) },
          { label: 'Giờ', value: temp.time, onChange: v => setTemp(t => ({ ...t, time: v })) },
          { label: 'Ghi chú', value: temp.note, onChange: v => setTemp(t => ({ ...t, note: v })), multiline: true },
        ]}
        onSubmit={handleAdd}
        onCancel={closeModal}
      />
      <ModalCard
        visible={modal.type === 'edit'}
        type="edit"
        title="Sửa lịch học"
        fields={[
          { label: 'Tiêu đề', value: temp.title, onChange: v => setTemp(t => ({ ...t, title: v })) },
          { label: 'Giờ', value: temp.time, onChange: v => setTemp(t => ({ ...t, time: v })) },
          { label: 'Ghi chú', value: temp.note, onChange: v => setTemp(t => ({ ...t, note: v })), multiline: true },
        ]}
        onSubmit={handleEdit}
        onCancel={closeModal}
      />
      <ModalCard
        visible={modal.type === 'delete'}
        type="delete"
        title="Xóa lịch học"
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
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 12,
  },
  calendar: {
    borderRadius: SIZES.radius,
    marginBottom: 18,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 10,
  },
  sessionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius,
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
    backgroundColor: COLORS.primaryLight,
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
    color: COLORS.text,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: COLORS.textSecondary,
  },
  sessionDesc: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  sessionActions: {
    flexDirection: 'row',
  },
  empty: {
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 20,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
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

export default StudyPlanScreen;
