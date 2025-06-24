import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text, Divider } from 'react-native-paper';

const RegisterScreen: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  //.
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
      <Button mode="contained" onPress={() => { }} style={styles.button}>
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