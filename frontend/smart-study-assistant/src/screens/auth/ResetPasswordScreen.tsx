import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import api from '../../services/api';

const ResetPasswordScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { email, otp } = route.params || {};
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!password) {
      Alert.alert('Lỗi', 'Vui lòng nhập mật khẩu mới');
      return;
    }
    setLoading(true);
    try {
      await api.post('/users/reset-password', { email, otp, newPassword: password });
      Alert.alert('Thành công', 'Đặt lại mật khẩu thành công!');
      navigation.navigate('Login');
    } catch (err: any) {
      Alert.alert('Lỗi', err?.response?.data?.message || 'Không thể đặt lại mật khẩu!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Đặt lại mật khẩu mới</Text>
      <Text style={{ marginBottom: 16 }}>Email: {email}</Text>
      <TextInput
        label="Mật khẩu mới"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
      />
      <Button mode="contained" onPress={handleReset} style={styles.button} loading={loading} disabled={loading}>
        Đặt lại mật khẩu
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

export default ResetPasswordScreen; 