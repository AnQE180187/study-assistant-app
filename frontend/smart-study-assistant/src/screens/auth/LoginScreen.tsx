import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text, Divider } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';

const DUMMY_USER = { email: 'user@email.com', password: '123456' };

const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation();
  const { login } = useAuth();

  const handleLogin = () => {
    if (email === DUMMY_USER.email && password === DUMMY_USER.password) {
      login(); // chuyển sang AppNavigator
    } else {
      alert('Sai tài khoản hoặc mật khẩu!');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Đăng nhập</Text>
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
      <Button mode="contained" onPress={handleLogin} style={styles.button}>
        Đăng nhập
      </Button>
      <Button onPress={() => navigation.navigate('ForgotPassword')} style={styles.link}>
        Quên mật khẩu?
      </Button>
      <Text style={styles.hint}>Tài khoản mẫu: {DUMMY_USER.email} / {DUMMY_USER.password}</Text>
      <Divider style={{ marginVertical: 16 }} />
      <Button icon="google" mode="outlined" onPress={() => {}} style={styles.social}>
        Đăng nhập với Google
      </Button>
      <Button icon="facebook" mode="outlined" onPress={() => {}} style={styles.social}>
        Đăng nhập với Facebook
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
  link: {
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  social: {
    marginBottom: 8,
  },
  hint: {
    marginTop: 8,
    color: '#888',
    fontSize: 13,
    textAlign: 'center',
  },
});

export default LoginScreen; 