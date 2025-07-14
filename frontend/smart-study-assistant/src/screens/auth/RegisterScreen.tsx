import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, Text, Divider } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import * as authService from '../../services/authService';

const RegisterScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'register' | 'verify'>('register');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const handleSendOtp = async () => {
    if (!email || !password) {
      Alert.alert('Lỗi', 'Vui lòng nhập email và mật khẩu');
      return;
    }
    setLoading(true);
    try {
      await authService.sendOtp(email);
      setStep('verify');
      Alert.alert('Thành công', 'Đã gửi mã OTP tới email. Vui lòng kiểm tra email và nhập mã OTP để hoàn tất đăng ký.');
    } catch (err: any) {
      Alert.alert('Gửi OTP thất bại', err?.response?.data?.message || 'Có lỗi xảy ra!');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!otp) {
      Alert.alert('Lỗi', 'Vui lòng nhập mã OTP');
      return;
    }
    setLoading(true);
    try {
      await authService.verifyOtpAndRegister(email, otp, password);
      Alert.alert('Thành công', 'Đăng ký thành công. Bạn có thể đăng nhập.');
      navigation.navigate('Login');
    } catch (err: any) {
      Alert.alert('Xác thực OTP thất bại', err?.response?.data?.message || 'Có lỗi xảy ra!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Đăng ký</Text>
      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
        editable={step === 'register'}
      />
      <TextInput
        label="Mật khẩu"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
        editable={step === 'register'}
      />
      {step === 'register' && (
        <Button mode="contained" onPress={handleSendOtp} style={styles.button} contentStyle={styles.buttonContent} labelStyle={styles.buttonLabel} loading={loading} disabled={loading}>
          Gửi mã OTP
        </Button>
      )}
      {step === 'verify' && (
        <>
          <Text style={{ marginTop: 16, marginBottom: 8, textAlign: 'center' }}>Mã OTP đã gửi tới: {email}</Text>
          <TextInput
            label="Mã OTP"
            value={otp}
            onChangeText={setOtp}
            style={styles.input}
            keyboardType="numeric"
            maxLength={6}
          />
          <Button mode="contained" onPress={handleVerify} style={styles.button} contentStyle={styles.buttonContent} labelStyle={styles.buttonLabel} loading={loading} disabled={loading}>
            Xác thực & Đăng ký
      </Button>
        </>
      )}
      <Divider style={{ marginVertical: 16 }} />
      <Button icon="google" mode="outlined" onPress={() => { }} style={styles.social} contentStyle={styles.socialContent} labelStyle={styles.socialLabel} disabled={step === 'verify'}>
        Đăng ký với Google
      </Button>
      <Button icon="facebook" mode="outlined" onPress={() => { }} style={styles.social} contentStyle={styles.socialContent} labelStyle={styles.socialLabel} disabled={step === 'verify'}>
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
    borderRadius: 14,
    overflow: 'hidden',
  },
  buttonContent: {
    paddingVertical: 14,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.2,
  },
  social: {
    marginBottom: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  socialContent: {
    paddingVertical: 12,
  },
  socialLabel: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
});

export default RegisterScreen; 