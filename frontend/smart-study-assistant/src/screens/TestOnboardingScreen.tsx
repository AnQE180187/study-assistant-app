import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Button, Text, Card } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useOnboardingNavigation } from '../hooks/useOnboardingNavigation';

const TestOnboardingScreen: React.FC = () => {
  const [onboardingStatus, setOnboardingStatus] = useState<string>('checking...');
  const { completeOnboarding, skipOnboarding, resetOnboarding } = useOnboardingNavigation();

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const value = await AsyncStorage.getItem('hasSeenOnboarding');
      setOnboardingStatus(value || 'null');
    } catch (error) {
      setOnboardingStatus('error');
    }
  };

  const handleReset = async () => {
    Alert.alert(
      'Reset Onboarding',
      'This will reset onboarding status and restart the app flow.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            const success = await resetOnboarding();
            if (success) {
              Alert.alert('Success', 'Onboarding has been reset. Restart the app to see onboarding again.');
              checkOnboardingStatus();
            } else {
              Alert.alert('Error', 'Failed to reset onboarding');
            }
          },
        },
      ]
    );
  };

  const handleComplete = async () => {
    const success = await completeOnboarding();
    if (success) {
      Alert.alert('Success', 'Onboarding marked as completed');
      checkOnboardingStatus();
    } else {
      Alert.alert('Error', 'Failed to complete onboarding');
    }
  };

  const handleSkip = async () => {
    const success = await skipOnboarding();
    if (success) {
      Alert.alert('Success', 'Onboarding skipped');
      checkOnboardingStatus();
    } else {
      Alert.alert('Error', 'Failed to skip onboarding');
    }
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.title}>Onboarding Test Screen</Text>
          
          <View style={styles.statusContainer}>
            <Text style={styles.statusLabel}>Current Status:</Text>
            <Text style={styles.statusValue}>{onboardingStatus}</Text>
          </View>

          <View style={styles.buttonContainer}>
            <Button 
              mode="outlined" 
              onPress={checkOnboardingStatus}
              style={styles.button}
            >
              Refresh Status
            </Button>

            <Button 
              mode="contained" 
              onPress={handleComplete}
              style={styles.button}
            >
              Mark as Completed
            </Button>

            <Button 
              mode="contained" 
              onPress={handleSkip}
              style={styles.button}
            >
              Mark as Skipped
            </Button>

            <Button 
              mode="outlined" 
              onPress={handleReset}
              style={[styles.button, styles.resetButton]}
              buttonColor="#ff6b6b"
            >
              Reset Onboarding
            </Button>
          </View>

          <View style={styles.infoContainer}>
            <Text style={styles.infoTitle}>Status Values:</Text>
            <Text style={styles.infoText}>• "true" = Onboarding completed</Text>
            <Text style={styles.infoText}>• "null" = Never set (first time)</Text>
            <Text style={styles.infoText}>• "checking..." = Loading</Text>
          </View>
        </Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  card: {
    marginTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  statusValue: {
    fontSize: 16,
    fontFamily: 'monospace',
    color: '#007AFF',
  },
  buttonContainer: {
    gap: 12,
    marginBottom: 20,
  },
  button: {
    marginVertical: 4,
  },
  resetButton: {
    marginTop: 8,
  },
  infoContainer: {
    padding: 16,
    backgroundColor: '#e8f4f8',
    borderRadius: 8,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
});

export default TestOnboardingScreen;
