import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

const defaultAvatar = 'https://i.pravatar.cc/150?img=3';

const ProfileScreen: React.FC = () => {
  const [avatar, setAvatar] = useState<string>(defaultAvatar);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('Nguyễn Văn A');
  const [email, setEmail] = useState('nguyenvana@email.com');
  const [phone, setPhone] = useState('0123 456 789');

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setAvatar(result.assets[0].uri);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={pickImage}>
        <Image source={{ uri: avatar }} style={styles.avatar} />
        <Text style={styles.avatarText}>Chọn ảnh đại diện</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Thông tin cá nhân</Text>
      <View style={styles.infoContainer}>
        <Text style={styles.label}>Họ và tên:</Text>
        {editing ? (
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Nhập họ tên"
          />
        ) : (
          <Text style={styles.value}>{name}</Text>
        )}
        <Text style={styles.label}>Email:</Text>
        {editing ? (
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Nhập email"
            keyboardType="email-address"
          />
        ) : (
          <Text style={styles.value}>{email}</Text>
        )}
        <Text style={styles.label}>Số điện thoại:</Text>
        {editing ? (
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="Nhập số điện thoại"
            keyboardType="phone-pad"
          />
        ) : (
          <Text style={styles.value}>{phone}</Text>
        )}
      </View>
      <TouchableOpacity
        style={styles.button}
        onPress={() => setEditing(!editing)}
      >
        <Text style={styles.buttonText}>{editing ? 'Lưu' : 'Chỉnh sửa'}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F6FA',
    padding: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#4B7BEC',
  },
  avatarText: {
    color: '#4B7BEC',
    textAlign: 'center',
    marginBottom: 8,
    fontSize: 14,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  infoContainer: {
    width: '100%',
    marginBottom: 32,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    elevation: 2,
  },
  label: {
    fontSize: 16,
    color: '#888',
    marginTop: 8,
  },
  value: {
    fontSize: 18,
    color: '#222',
    fontWeight: '500',
  },
  input: {
    fontSize: 18,
    color: '#222',
    fontWeight: '500',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 4,
    paddingVertical: 2,
  },
  button: {
    backgroundColor: '#4B7BEC',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProfileScreen;