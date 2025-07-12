import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import NoteCard from '../../components/NoteCard';
import DeckCard from '../../components/DeckCard';
import { Ionicons } from '@expo/vector-icons';
import { getNotes, Note } from '../../services/notesService';
import { getDecks, Deck, getPublicDecks } from '../../services/deckService';
import { getStudyPlans, StudyPlan } from '../../services/studyPlanService';
import { AuthContext } from '../../contexts/AuthContext';
import { useFocusEffect } from '@react-navigation/native';

const HomeScreen = ({ navigation }: any) => {
  const { t } = useTranslation();
  const { currentTheme } = useTheme();
  const { user } = useContext<any>(AuthContext);
  const [notes, setNotes] = useState<Note[]>([]);
  const [decks, setDecks] = useState<Deck[]>([]);
  const [plan, setPlan] = useState<StudyPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useFocusEffect(
    React.useCallback(() => {
      fetchData();
    }, [])
  );

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      // Lấy notes mới nhất
      const fetchedNotes = await getNotes({ sortBy: 'createdAt', sortOrder: 'desc' });
      setNotes(fetchedNotes.slice(0, 3));
      // Lấy decks public
      const fetchedDecks = await getPublicDecks();
      setDecks(fetchedDecks.slice(0, 3));
      // Lấy study plan tiếp theo (chưa hoàn thành, ngày hôm nay trở đi)
      const today = new Date().toISOString().slice(0, 10);
      const plans = await getStudyPlans(today);
      const nextPlan = plans.find((p: StudyPlan) => !p.completed) || plans[0] || null;
      setPlan(nextPlan);
    } catch (err: any) {
      setError(t('home.errorLoading'));
      Alert.alert(t('common.error'), err.message || t('home.errorLoading'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: currentTheme.colors.background }]} contentContainerStyle={{ paddingBottom: 32 }}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.hello, { color: currentTheme.colors.textSecondary }]}>{t('home.hello')}</Text>
          <Text style={[styles.name, { color: currentTheme.colors.primary }]}>{user?.name || t('home.user')}</Text>
        </View>
        <TouchableOpacity>
          {/* <Image source={require('../../assets/icon.png')} style={styles.avatar} /> */}
        </TouchableOpacity>
      </View>
      {loading ? (
        <View style={{ alignItems: 'center', marginTop: 40 }}>
          <ActivityIndicator size="large" color={currentTheme.colors.primary} />
          <Text style={[styles.loadingText, { color: currentTheme.colors.textSecondary }]}>{t('home.loading')}</Text>
        </View>
      ) : error ? (
        <View style={{ alignItems: 'center', marginTop: 40 }}>
          <Text style={[styles.errorText, { color: currentTheme.colors.error }]}>{error}</Text>
          <TouchableOpacity onPress={fetchData} style={[styles.retryButton, { backgroundColor: currentTheme.colors.primary }]}>
            <Text style={[styles.retryText, { color: currentTheme.colors.onPrimary }]}>{t('home.retry')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* Kế hoạch học tiếp theo */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: currentTheme.colors.text }]}>{t('home.nextStudyPlan')}</Text>
            {plan ? (
              <View style={[styles.planCard, { backgroundColor: currentTheme.colors.card }]}>
                <Ionicons name="calendar-outline" size={28} color={currentTheme.colors.primary} style={{ marginRight: 12 }} />
                <View>
                  <Text style={[styles.planTitle, { color: currentTheme.colors.text }]}>{plan.title} - {plan.startTime} - {plan.endTime}</Text>
                  <Text style={[styles.planDesc, { color: currentTheme.colors.textSecondary }]}>{plan.note || ''}</Text>
                </View>
                <TouchableOpacity style={[styles.startBtn, { backgroundColor: currentTheme.colors.primary }]} onPress={() => navigation.navigate('Planner')}>
                  <Text style={[styles.startText, { color: currentTheme.colors.onPrimary }]}>{t('home.start')}</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <Text style={[styles.noPlanText, { color: currentTheme.colors.textSecondary }]}>{t('home.noStudyPlan')}</Text>
            )}
          </View>
          {/* Notes gần đây */}
          <View style={styles.section}>
            <View style={styles.sectionRow}>
              <Text style={[styles.sectionTitle, { color: currentTheme.colors.text }]}>{t('home.recentNotes')}</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Notes')}><Text style={[styles.link, { color: currentTheme.colors.primary }]}>{t('home.viewAll')}</Text></TouchableOpacity>
            </View>
            {notes.length === 0 ? (
              <Text style={[styles.noDataText, { color: currentTheme.colors.textSecondary }]}>{t('home.noNotes')}</Text>
            ) : (
              notes.map((n, i) => (
                <NoteCard
                  key={n.id}
                  title={n.title}
                  description={n.description}
                  content={n.content}
                  tags={n.tags}
                  category={n.category}
                  priority={n.priority}
                  color={n.color}
                  isPinned={n.isPinned}
                  isPublic={n.isPublic}
                  createdAt={n.createdAt}
                  onPress={() => navigation.navigate('NoteEditor', { noteId: n.id })}
                />
              ))
            )}
          </View>
          {/* Deck nổi bật */}
          <View style={styles.section}>
            <View style={styles.sectionRow}>
              <Text style={[styles.sectionTitle, { color: currentTheme.colors.text }]}>{t('home.featuredDecks')}</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Flashcards', { tab: 'public' })}><Text style={[styles.link, { color: currentTheme.colors.primary }]}>{t('home.viewAll')}</Text></TouchableOpacity>
            </View>
            <FlatList
              data={decks}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={{ width: 220, marginRight: 12 }}>
                  <DeckCard
                    name={item.title}
                    count={item.flashcards ? item.flashcards.length : 0}
                    isPublic={item.isPublic}
                    onStudy={() => navigation.navigate('FlashcardPractice', { deckId: item.id, title: item.title, isPublic: true })}
                    description={item.description}
                    tags={item.tags}
                    hideManageBtn={true}
                  />
                </View>
              )}
            />
          </View>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  hello: {
    fontSize: 16,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  link: {
    fontWeight: 'bold',
  },
  planCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    elevation: 2,
  },
  planTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  planDesc: {
    fontSize: 14,
  },
  startBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 'auto',
  },
  startText: {
    fontWeight: 'bold',
  },
  loadingText: {
    marginTop: 12,
  },
  errorText: {
    fontSize: 16,
  },
  retryButton: {
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
  },
  retryText: {
    fontWeight: 'bold',
  },
  noPlanText: {
    marginTop: 8,
  },
  noDataText: {
    marginTop: 8,
  },
});

export default HomeScreen;