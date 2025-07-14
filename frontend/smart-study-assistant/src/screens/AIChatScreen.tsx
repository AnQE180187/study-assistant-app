import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { Picker } from '@react-native-picker/picker';
import { useFocusEffect } from '@react-navigation/native';

interface Deck {
  id: string;
  title: string;
}

interface FlashcardResult {
  success: boolean;
  data?: { term: string; definition: string };
  error?: any;
}

const AIChatScreen: React.FC = () => {
  const { t } = useTranslation();
  const { currentTheme } = useTheme();
  const { token } = useAuth();
  const [keyword, setKeyword] = useState('');
  const [decks, setDecks] = useState<Deck[]>([]);
  const [selectedDeck, setSelectedDeck] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<FlashcardResult[]>([]);
  // Xóa state flashcardCount
  const [language, setLanguage] = useState('vi'); // mặc định tiếng Việt

  // Thay useEffect bằng useFocusEffect để reload deck khi màn hình được focus
  useFocusEffect(
    React.useCallback(() => {
      let isActive = true;
      api.get('/decks')
        .then(res => { if (isActive) setDecks(res.data); })
        .catch(() => { if (isActive) setDecks([]); });
      return () => { isActive = false; };
    }, [])
  );

  const handleGenerate = async () => {
    if (!keyword.trim() || !selectedDeck) {
      Alert.alert(t('error'), t('flashcards.ai_input_required'));
      return;
    }
    setLoading(true);
    setResults([]);
    try {
      const res = await api.post('/ai/generate-flashcards', { keyword, deckId: selectedDeck, count: 10, language });
      setResults(res.data.results);
      Alert.alert(t('success'), t('flashcards.ai_generate_success', { count: res.data.count }));
    } catch (e: any) {
      console.log('AI error:', e);
      let msg = e.response?.data?.message || e.message || t('flashcards.ai_unknown_error');
      if (msg.includes('Gemini')) {
        msg = t('flashcards.ai_gemini_error') + ': ' + msg;
      }
      Alert.alert(t('error'), msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={[styles.container, { backgroundColor: currentTheme.colors.background }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.inner}>
        <Text style={[styles.title, { color: currentTheme.colors.text }]}>{t('flashcards.ai_title')}</Text>
        <TextInput
          style={[styles.input, { backgroundColor: currentTheme.colors.surface, color: currentTheme.colors.text }]}
          placeholder={t('flashcards.ai_placeholder')}
          placeholderTextColor={currentTheme.colors.textSecondary}
          value={keyword}
          onChangeText={setKeyword}
          editable={!loading}
        />
        <Picker
          selectedValue={selectedDeck}
          onValueChange={setSelectedDeck}
          enabled={!loading}
          style={{ color: currentTheme.colors.text, backgroundColor: currentTheme.colors.surface, marginVertical: 8 }}
        >
          <Picker.Item label={t('flashcards.select_deck')} value="" />
          {decks.map(deck => (
            <Picker.Item key={deck.id} label={deck.title} value={deck.id} />
          ))}
        </Picker>
        <Picker
          selectedValue={language}
          onValueChange={setLanguage}
          enabled={!loading}
          style={{ color: currentTheme.colors.text, backgroundColor: currentTheme.colors.surface, marginVertical: 8 }}
        >
          <Picker.Item label="Tiếng Việt" value="vi" />
          <Picker.Item label="English" value="en" />
          <Picker.Item label="日本語" value="ja" />
        </Picker>
        {/* Xóa TextInput chọn số lượng flashcards khỏi UI */}
        <TouchableOpacity style={[styles.button, { backgroundColor: currentTheme.colors.primary }]} onPress={handleGenerate} disabled={loading || !keyword.trim() || !selectedDeck}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{t('flashcards.ai_generate')}</Text>}
        </TouchableOpacity>
        <FlatList
          data={results}
          keyExtractor={(_, idx) => idx + ''}
          renderItem={({ item, index }) => (
            <View style={[styles.resultItem, { backgroundColor: item.success ? currentTheme.colors.success : currentTheme.colors.error }]}> 
              <Text style={{ color: currentTheme.colors.text, fontWeight: 'bold' }}>{t('flashcards.flashcard')} #{index + 1}</Text>
              {item.success ? (
                <>
                  <Text style={{ color: currentTheme.colors.text }}>{t('flashcards.term')}: {item.data?.term}</Text>
                  <Text style={{ color: currentTheme.colors.text }}>{t('flashcards.definition')}: {item.data?.definition}</Text>
                </>
              ) : (
                <Text style={{ color: currentTheme.colors.text }}>{t('flashcards.ai_error')}: {item.error}</Text>
              )}
            </View>
          )}
          style={{ marginTop: 16 }}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  input: { borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 8 },
  button: { borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  resultItem: { borderRadius: 8, padding: 12, marginBottom: 10 },
});

export default AIChatScreen; 