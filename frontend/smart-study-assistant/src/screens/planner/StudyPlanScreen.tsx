import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { COLORS, SIZES } from '../../constants/themes';
import { Ionicons } from '@expo/vector-icons';
import ModalCard from '../../components/ModalCard';

const initialSessions = [
  { title: 'Ôn tập Toán', date: '2024-06-01', time: '20:00', note: 'Toán tích phân' },
  { title: 'Lý thuyết Dao động', date: '2024-06-02', time: '19:00', note: 'Vật lý' },
];

const StudyPlanScreen = ({ navigation }: any) => {
  const [selected, setSelected] = useState('2024-06-01');
  const [sessions, setSessions] = useState(initialSessions);
  const [modal, setModal] = useState<{ type: 'add' | 'edit' | 'delete' | null, index?: number }>({ type: null });
  const [temp, setTemp] = useState({ title: '', time: '', note: '' });

  // Modal handlers
  const openAdd = () => {
    setTemp({ title: '', time: '', note: '' });
    setModal({ type: 'add' });
  };
  const openEdit = (i: number) => {
    setTemp({ title: sessions[i].title, time: sessions[i].time, note: sessions[i].note });
    setModal({ type: 'edit', index: i });
  };
  const openDelete = (i: number) => setModal({ type: 'delete', index: i });
  const closeModal = () => setModal({ type: null });

  // CRUD
  const handleAdd = () => {
    setSessions([{ title: temp.title, date: selected, time: temp.time, note: temp.note }, ...sessions]);
    closeModal();
  };
  const handleEdit = () => {
    if (modal.index !== undefined) {
      const newSessions = [...sessions];
      newSessions[modal.index] = { ...newSessions[modal.index], title: temp.title, time: temp.time, note: temp.note };
      setSessions(newSessions);
    }
    closeModal();
  };
  const handleDelete = () => {
    if (modal.index !== undefined) {
      setSessions(sessions.filter((_, i) => i !== modal.index));
    }
    closeModal();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Kế hoạch học tập</Text>
      <Calendar
        current={selected}
        onDayPress={day => setSelected(day.dateString)}
        markedDates={{ [selected]: { selected: true, selectedColor: COLORS.primary } }}
        theme={{
          todayTextColor: COLORS.primary,
          arrowColor: COLORS.primary,
          textDayFontWeight: 'bold',
        }}
        style={styles.calendar}
      />
      <Text style={styles.sectionTitle}>Session trong ngày</Text>
      <FlatList
        data={sessions.filter(s => s.date === selected)}
        keyExtractor={(_, i) => i.toString()}
        renderItem={({ item, index }) => (
          <View style={styles.sessionCard}>
            <Ionicons name="book-outline" size={22} color={COLORS.primary} style={{ marginRight: 10 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.sessionTitle}>{item.title}</Text>
              <Text style={styles.sessionDesc}>{item.time} - {item.note}</Text>
            </View>
            <TouchableOpacity onPress={() => openEdit(index)} style={{ marginLeft: 8 }}>
              <Ionicons name="create-outline" size={18} color={COLORS.primary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => openDelete(index)} style={{ marginLeft: 8 }}>
              <Ionicons name="trash-outline" size={18} color={COLORS.error} />
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Không có session nào.</Text>}
        contentContainerStyle={{ paddingBottom: 80 }}
      />
      <TouchableOpacity style={styles.fab} onPress={openAdd}>
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
    ...{
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 2,
    },
  },
  sessionTitle: {
    fontWeight: 'bold',
    fontSize: 15,
    color: COLORS.text,
  },
  sessionDesc: {
    color: COLORS.textSecondary,
    fontSize: 14,
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
    ...{
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 2,
    },
  },
});

export default StudyPlanScreen;
