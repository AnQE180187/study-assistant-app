import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, FlatList, TouchableOpacity } from 'react-native';
import { COLORS, SIZES } from '../../constants/themes';
import NoteCard from '../../components/NoteCard';
import DeckCard from '../../components/DeckCard';
import { Ionicons } from '@expo/vector-icons';

const notes = [
  { title: 'Toán tích phân', tag: 'Toán', date: '2024-06-01' },
  { title: 'Lý thuyết Dao động', tag: 'Vật lý', date: '2024-05-30' },
  { title: 'Hóa hữu cơ', tag: 'Hóa', date: '2024-05-28' },
];

const decks = [
  { name: 'Từ vựng IELTS', count: 50, isPublic: true },
  { name: 'Công thức Vật lý', count: 30, isPublic: true },
  { name: 'Lịch sử Việt Nam', count: 20, isPublic: true },
];

const HomeScreen = ({ navigation }: any) => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 32 }}>
      <View style={styles.header}>
        <View>
          <Text style={styles.hello}>Xin chào,</Text>
          <Text style={styles.name}>Nguyễn Văn A</Text>
        </View>
        <TouchableOpacity>
          {/* <Image source={require('../../assets/icon.png')} style={styles.avatar} /> */}
        </TouchableOpacity>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Kế hoạch học tiếp theo</Text>
        <View style={styles.planCard}>
          <Ionicons name="calendar-outline" size={28} color={COLORS.primary} style={{ marginRight: 12 }} />
          <View>
            <Text style={styles.planTitle}>Ôn tập Toán - 20:00 hôm nay</Text>
            <Text style={styles.planDesc}>Chủ đề: Tích phân, 30 phút</Text>
          </View>
          <TouchableOpacity style={styles.startBtn}><Text style={styles.startText}>Bắt đầu</Text></TouchableOpacity>
        </View>
      </View>
      <View style={styles.section}>
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Ghi chú gần đây</Text>
          <TouchableOpacity><Text style={styles.link}>Xem tất cả</Text></TouchableOpacity>
        </View>
        {notes.slice(0, 3).map((n, i) => (
          <NoteCard key={i} title={n.title} tag={n.tag} date={n.date} onEdit={() => { }} onDelete={() => { }} />
        ))}
      </View>
      <View style={styles.section}>
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Bộ flashcard nổi bật</Text>
          <TouchableOpacity><Text style={styles.link}>Xem tất cả</Text></TouchableOpacity>
        </View>
        <FlatList
          data={decks}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(_, i) => i.toString()}
          renderItem={({ item }) => (
            <View style={{ width: 220, marginRight: 12 }}>
              <DeckCard name={item.name} count={item.count} isPublic={item.isPublic} onPress={() => { }} />
            </View>
          )}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SIZES.padding,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  hello: {
    color: COLORS.textSecondary,
    fontSize: 16,
  },
  name: {
    color: COLORS.primary,
    fontSize: 22,
    fontWeight: 'bold',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primaryLight,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 10,
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  link: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  planCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius,
    padding: 18,
    ...SIZES,
    marginBottom: 8,
    ...{
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 2,
    },
  },
  planTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: COLORS.text,
  },
  planDesc: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  startBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginLeft: 'auto',
  },
  startText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default HomeScreen;