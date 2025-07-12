import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, Text, HelperText } from 'react-native-paper';
import * as authService from '../../services/authService';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';

const ForgotPasswordScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setStep('otp');
    } catch (err: any) {
      Alert.alert('Lỗi', err?.response?.data?.message || 'Không thể gửi email!');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      Alert.alert('Lỗi', 'Vui lòng nhập mã OTP');
      return;
    }
    setLoading(true);
    try {
      await authService.verifyOtpForgot(email, otp);
      navigation.navigate('ResetPassword', { email, otp });
    } catch (err: any) {
      Alert.alert('Xác thực OTP thất bại', err?.response?.data?.message || 'Có lỗi xảy ra!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quên mật khẩu</Text>
      {step === 'email' && (
        <>
          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <HelperText type="info" visible={true}>
            Nhập email để nhận hướng dẫn đặt lại mật khẩu.
          </HelperText>
          <Button mode="contained" onPress={handleSubmit} style={styles.button} contentStyle={styles.buttonContent} labelStyle={styles.buttonLabel} loading={loading} disabled={loading}>
            Gửi
          </Button>
        </>
      )}
      {step === 'otp' && (
        <>
          <Text style={{ marginBottom: 16 }}>Mã OTP đã gửi tới: {email}</Text>
          <TextInput
            label="Mã OTP"
            value={otp}
            onChangeText={setOtp}
            style={styles.input}
            keyboardType="numeric"
            maxLength={6}
          />
          <Button mode="contained" onPress={handleVerifyOtp} style={styles.button} contentStyle={styles.buttonContent} labelStyle={styles.buttonLabel} loading={loading} disabled={loading}>
            Xác thực OTP
          </Button>
        </>
      )}
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
  title: {
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
  success: {
    color: 'green',
    marginTop: 16,
    textAlign: 'center',
  },
});

export default ForgotPasswordScreen; 