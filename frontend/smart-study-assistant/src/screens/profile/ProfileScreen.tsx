import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { COLORS, SIZES } from '../../constants/themes';
import { Ionicons } from '@expo/vector-icons';

const ProfileScreen = () => {
  const [lang, setLang] = useState('en');
  return (
    <View style={styles.container}>
      <View style={styles.avatarWrap}>
        {/* <Image source={require('../../assets/icon.png')} style={styles.avatar} /> */}
        <Text style={styles.name}>Nguyễn Văn A</Text>
        <Text style={styles.email}>user@email.com</Text>
        <View style={styles.roleWrap}>
          <Ionicons name="person-circle-outline" size={18} color={COLORS.primary} />
          <Text style={styles.role}>Học sinh</Text>
        </View>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cài đặt</Text>
        <View style={styles.row}>
          <Ionicons name="language-outline" size={22} color={COLORS.primary} style={{ marginRight: 10 }} />
          <Text style={styles.label}>Ngôn ngữ</Text>
          <TouchableOpacity style={styles.langBtn} onPress={() => setLang(lang === 'en' ? 'vi' : 'en')}>
            <Text style={styles.langText}>{lang === 'en' ? 'English' : 'Tiếng Việt'}</Text>
            <Ionicons name="chevron-down" size={18} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={() => { }}>
          <Ionicons name="log-out-outline" size={22} color={COLORS.error} style={{ marginRight: 10 }} />
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SIZES.padding,
  },
  avatarWrap: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: COLORS.primaryLight,
    marginBottom: 12,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  email: {
    color: COLORS.textSecondary,
    fontSize: 15,
    marginBottom: 4,
  },
  roleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  role: {
    color: COLORS.primary,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  section: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius,
    padding: 20,
    ...{
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 2,
    },
  },
  sectionTitle: {
    fontWeight: 'bold',
    color: COLORS.text,
    fontSize: 16,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  label: {
    color: COLORS.text,
    fontSize: 15,
    flex: 1,
  },
  langBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  langText: {
    color: COLORS.primary,
    fontWeight: 'bold',
    marginRight: 4,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  logoutText: {
    color: COLORS.error,
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ProfileScreen;