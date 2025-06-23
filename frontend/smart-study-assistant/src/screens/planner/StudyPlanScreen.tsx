import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Card, Text, Button, FAB } from 'react-native-paper';

const mockPlans: Record<string, { subject: string; time: string; description: string }[]> = {
  '2024-06-01': [
    { subject: 'Toán', time: '14:00', description: 'Ôn tập đạo hàm, tích phân.' },
    { subject: 'Lý', time: '16:00', description: 'Chủ đề: Điện xoay chiều.' },
  ],
  '2024-06-02': [
    { subject: 'Tiếng Anh', time: '16:00', description: 'Luyện nghe và từ vựng.' },
  ],
};

const StudyPlanScreen: React.FC = () => {
  const [selected, setSelected] = useState('2024-06-01');
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Lịch học</Text>
      <Calendar
        onDayPress={day => setSelected(day.dateString)}
        markedDates={{
          ...Object.keys(mockPlans).reduce((acc, date) => ({ ...acc, [date]: { marked: true, dotColor: '#4F8EF7' } }), {}),
          [selected]: { selected: true, selectedColor: '#4F8EF7' },
        }}
        style={styles.calendar}
      />
      <View style={styles.list}>
        {(mockPlans[selected] || []).map((plan, idx) => (
          <Card key={idx} style={styles.card}>
            <Card.Title title={plan.subject} subtitle={plan.time} />
            <Card.Content>
              <Text>{plan.description}</Text>
            </Card.Content>
            <Card.Actions>
              <Button>Chi tiết</Button>
            </Card.Actions>
          </Card>
        ))}
      </View>
      <FAB icon="plus" style={styles.fab} onPress={() => {}} label="Thêm kế hoạch" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6FA',
    padding: 8,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  calendar: {
    marginBottom: 8,
  },
  list: {
    flex: 1,
    paddingHorizontal: 8,
  },
  card: {
    marginBottom: 12,
  },
  fab: {
    marginTop: 16,
    alignSelf: 'center',
  },
});

export default StudyPlanScreen;
