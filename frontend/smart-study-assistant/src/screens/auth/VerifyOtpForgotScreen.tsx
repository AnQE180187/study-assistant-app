import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import api from '../../services/api';

const VerifyOtpForgotScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { email } = route.params || {};
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!otp) {
      Alert.alert('Lỗi', 'Vui lòng nhập mã OTP');
      return;
    }
    setLoading(true);
    try {
      await api.post('/users/verify-otp-forgot', { email, otp });
      navigation.navigate('ResetPassword', { email, otp });
    } catch (err: any) {
      Alert.alert('Xác thực OTP thất bại', err?.response?.data?.message || 'Có lỗi xảy ra!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Nhập mã OTP</Text>
      <Text style={{ marginBottom: 16 }}>Mã OTP đã gửi tới: {email}</Text>
      <TextInput
        label="Mã OTP"
        value={otp}
        onChangeText={setOtp}
        style={styles.input}
        keyboardType="numeric"
        maxLength={6}
      />
      <Button mode="contained" onPress={handleVerify} style={styles.button} loading={loading} disabled={loading}>
        Xác thực OTP
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#F5F6FA' },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 24, textAlign: 'center' },
  input: { marginBottom: 16 },
  button: { marginTop: 8, borderRadius: 14, overflow: 'hidden', paddingVertical: 14 },
});

export default VerifyOtpForgotScreen; 