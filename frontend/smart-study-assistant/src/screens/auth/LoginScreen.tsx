import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const LoginScreen: React.FC = () => (
  <View style={styles.container}>
    <Text style={styles.title}>Đăng nhập</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F6FA',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
  },
});

export default LoginScreen; 