import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text, HelperText } from 'react-native-paper';

const ForgotPasswordScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    setSubmitted(true);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quên mật khẩu</Text>
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
      <Button mode="contained" onPress={handleSubmit} style={styles.button}>
        Gửi
      </Button>
      {submitted && <Text style={styles.success}>Đã gửi email hướng dẫn!</Text>}
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
  },
  success: {
    color: 'green',
    marginTop: 16,
    textAlign: 'center',
  },
});

export default ForgotPasswordScreen; 