import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, Text, Divider } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import * as authService from '../../services/authService';

const RegisterScreen: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const { login } = useAuth();

  const handleRegister = async () => {
    setLoading(true);
    try {
      const res = await authService.register(name, email, password);
      await login(email, password); // tự động đăng nhập sau khi đăng ký
    } catch (err: any) {
      Alert.alert('Đăng ký thất bại', err?.response?.data?.message || 'Có lỗi xảy ra!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Đăng ký</Text>
      <TextInput
        label="Tên"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />
      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        label="Mật khẩu"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
      />
      <Button mode="contained" onPress={handleRegister} style={styles.button} loading={loading} disabled={loading}>
        Đăng ký
      </Button>
      <Divider style={{ marginVertical: 16 }} />
      <Button icon="google" mode="outlined" onPress={() => { }} style={styles.social}>
        Đăng ký với Google
      </Button>
      <Button icon="facebook" mode="outlined" onPress={() => { }} style={styles.social}>
        Đăng ký với Facebook
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#F5F6FA',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    marginBottom: 8,
  },
  button: {
    marginTop: 8,
  },
  social: {
    marginBottom: 8,
  },
});

export default RegisterScreen; 