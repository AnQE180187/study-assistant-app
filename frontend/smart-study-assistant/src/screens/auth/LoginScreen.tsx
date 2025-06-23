import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import CustomButton from '../../components/CustomButton';
import { COLORS, SIZES } from '../../constants/themes';
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
      <Text style={styles.title}>Đăng nhập</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Mật khẩu"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <CustomButton title="Đăng nhập" onPress={handleLogin} />
      <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')} style={styles.forgot}>
        <Text style={styles.forgotText}>Quên mật khẩu?</Text>
      </TouchableOpacity>
      <Text style={styles.hint}>Tài khoản mẫu: user@email.com / 123456</Text>
      <Text style={styles.or}>Hoặc đăng nhập bằng</Text>
      <View style={styles.socialRow}>
        <CustomButton title="Google" type="secondary" icon="logo-google" onPress={() => { }} />
        <CustomButton title="Facebook" type="secondary" icon="logo-facebook" onPress={() => { }} />
      </View>
      <View style={styles.bottomRow}>
        <Text style={styles.bottomText}>Chưa có tài khoản?</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.register}>Đăng ký</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: SIZES.padding,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 24,
  },
  input: {
    width: '100%',
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius,
    padding: 16,
    fontSize: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  forgot: {
    alignSelf: 'flex-end',
    marginBottom: 10,
  },
  forgotText: {
    color: COLORS.primary,
    fontSize: 14,
  },
  hint: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  or: {
    color: COLORS.textSecondary,
    marginVertical: 10,
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  bottomRow: {
    flexDirection: 'row',
    marginTop: 24,
  },
  bottomText: {
    color: COLORS.textSecondary,
    marginRight: 6,
  },
  register: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
});

export default LoginScreen; 