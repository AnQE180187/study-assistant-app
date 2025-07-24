import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Button, Divider } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import LanguageSelector from '../components/LanguageSelector';
import { useTheme } from '../contexts/ThemeContext';

const TestLanguageScreen: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { currentTheme } = useTheme();

  const testKeys = [
    'app.name',
    'app.tagline',
    'auth.login',
    'auth.register',
    'auth.email',
    'auth.password',
    'common.save',
    'common.cancel',
    'common.loading',
    'common.error',
    'common.success',
    'welcome.feature1',
    'welcome.feature2',
    'welcome.feature3',
    'onboarding.slide1.title',
    'onboarding.slide1.description',
    'profile.settings',
    'profile.language',
    'settings.selectLanguage',
  ];

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.title}>Language Test Screen</Text>
          <Text style={styles.subtitle}>
            Current Language: {i18n.language.toUpperCase()}
          </Text>
          
          <View style={styles.languageSelector}>
            <LanguageSelector />
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Translation Test</Text>
          <Divider style={styles.divider} />
          
          {testKeys.map((key, index) => (
            <View key={index} style={styles.testItem}>
              <Text style={styles.keyText}>{key}:</Text>
              <Text style={styles.valueText}>{t(key)}</Text>
            </View>
          ))}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Language Info</Text>
          <Divider style={styles.divider} />
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Current Language:</Text>
            <Text style={styles.infoValue}>{i18n.language}</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Available Languages:</Text>
            <Text style={styles.infoValue}>
              {Object.keys(i18n.options.resources || {}).join(', ')}
            </Text>
          </View>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Fallback Language:</Text>
            <Text style={styles.infoValue}>{i18n.options.fallbackLng}</Text>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 16,
  },
  languageSelector: {
    alignItems: 'center',
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  divider: {
    marginBottom: 16,
  },
  testItem: {
    marginBottom: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  keyText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
  },
  valueText: {
    fontSize: 16,
    color: '#333',
    marginTop: 4,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingVertical: 4,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'monospace',
  },
});

export default TestLanguageScreen;
