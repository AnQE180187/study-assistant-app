import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

const WelcomeScreen: React.FC = () => {
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chào mừng đến với Smart Study Assistant!</Text>
      <Text style={styles.subtitle}>Học tập thông minh, hiệu quả và cá nhân hóa.</Text>
      <Button mode="contained" style={styles.button} onPress={() => navigation.navigate('Login')}>
        Đăng nhập
      </Button>
      <Button mode="outlined" style={styles.button} onPress={() => navigation.navigate('Register')}>
        Đăng ký
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F6FA',
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
  },
  button: {
    marginTop: 8,
    width: 200,
  },
});

export default WelcomeScreen; 