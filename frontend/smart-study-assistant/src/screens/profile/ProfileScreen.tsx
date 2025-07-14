import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  Image,
  TouchableOpacity,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Card,
  Switch,
  List,
  Avatar,
  Divider,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  updateProfile,
  changePassword,
  UserProfile,
} from '../../services/authService';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Platform } from 'react-native';
import { lightTheme, darkTheme } from '../../constants/themes';

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { theme, toggleTheme, currentTheme } = useTheme();
  const { language, setLanguage } = useLanguage();

  // Profile state
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [name, setName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [gender, setGender] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showGenderPicker, setShowGenderPicker] = useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  // Loading states
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setProfile(user);
      setName(user.name || '');
      setDateOfBirth(user.dateOfBirth ? new Date(user.dateOfBirth) : null);
      setGender(user.gender || '');
    }
  }, [user]);

  const handleUpdateProfile = async () => {
    if (!name.trim()) {
      Alert.alert('Lỗi', 'Tên không được để trống');
      return;
    }

    setLoading(true);
    try {
      const updatedProfile = await updateProfile({
        name: name.trim(),
        dateOfBirth: dateOfBirth?.toISOString(),
        gender,
      });
      setProfile(updatedProfile);
      Alert.alert('Thành công', 'Cập nhật thông tin thành công!');
    } catch (error: any) {
      Alert.alert('Lỗi', error?.response?.data?.message || 'Không thể cập nhật thông tin');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu mới không khớp');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Lỗi', 'Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    setPasswordLoading(true);
    try {
      await changePassword(currentPassword, newPassword);
      Alert.alert('Thành công', 'Đổi mật khẩu thành công!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordForm(false);
    } catch (error: any) {
      Alert.alert('Lỗi', error?.response?.data?.message || 'Không thể đổi mật khẩu');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất?',
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Đăng xuất', style: 'destructive', onPress: logout },
      ]
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: currentTheme.colors.background }]}>
      {/* Profile Header */}
      <Card style={[styles.profileCard, { backgroundColor: currentTheme.colors.card }]}>
        <Card.Content style={styles.profileHeader}>
          <Avatar.Image
            size={80}
            source={profile?.avatar ? { uri: profile.avatar } : require('../../../assets/default-avatar.png')}
          />
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: currentTheme.colors.text }]}>
              {profile?.name || 'Chưa có tên'}
            </Text>
            <Text style={[styles.profileEmail, { color: currentTheme.colors.textSecondary }]}>
              {profile?.email}
            </Text>
        </View>
        </Card.Content>
      </Card>

      {/* Profile Information */}
      <Card style={[styles.sectionCard, { backgroundColor: currentTheme.colors.card }]}>
        <Card.Content>
          <Text style={[styles.sectionTitle, { color: currentTheme.colors.text }]}>
            Thông tin cá nhân
          </Text>
          
          <TextInput
            label={t('profile.name')}
            value={name}
            onChangeText={setName}
            style={styles.input}
            mode="outlined"
          />

          <TouchableOpacity
            style={styles.dateInput}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={[styles.dateLabel, { color: currentTheme.colors.textSecondary }]}>
              {t('profile.dateOfBirth')}
            </Text>
            <Text style={[styles.dateValue, { color: currentTheme.colors.text }]}>
              {dateOfBirth ? dateOfBirth.toLocaleDateString('vi-VN') : t('profile.selectDate')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.dateInput}
            onPress={() => setShowGenderPicker(true)}
          >
            <Text style={[styles.dateLabel, { color: currentTheme.colors.textSecondary }]}>
              {t('profile.gender')}
            </Text>
            <Text style={[styles.dateValue, { color: currentTheme.colors.text }]}>
              {gender || t('profile.selectGender')}
            </Text>
          </TouchableOpacity>

          {showGenderPicker && (
            <View style={styles.genderPicker}>
              <Button
                mode="outlined"
                onPress={() => {
                  setGender('Nam');
                  setShowGenderPicker(false);
                }}
                style={styles.genderButton}
              >
                {t('profile.male')}
              </Button>
              <Button
                mode="outlined"
                onPress={() => {
                  setGender('Nữ');
                  setShowGenderPicker(false);
                }}
                style={styles.genderButton}
              >
                {t('profile.female')}
              </Button>
              <Button
                mode="outlined"
                onPress={() => {
                  setGender('Khác');
                  setShowGenderPicker(false);
                }}
                style={styles.genderButton}
              >
                {t('profile.other')}
              </Button>
        </View>
          )}

          <Button
            mode="contained"
            onPress={handleUpdateProfile}
            loading={loading}
            disabled={loading}
            style={styles.button}
          >
            {t('profile.updateProfile')}
          </Button>
        </Card.Content>
      </Card>

      {/* Change Password */}
      <Card style={[styles.sectionCard, { backgroundColor: currentTheme.colors.card }]}>
        <Card.Content>
          <Text style={[styles.sectionTitle, { color: currentTheme.colors.text }]}>
            {t('profile.changePassword')}
          </Text>

          {!showPasswordForm ? (
            <Button
              mode="outlined"
              onPress={() => setShowPasswordForm(true)}
              style={styles.button}
            >
              {t('profile.changePassword')}
            </Button>
          ) : (
            <>
              <TextInput
                label={t('profile.currentPassword')}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry
                style={styles.input}
                mode="outlined"
              />

              <TextInput
                label={t('profile.newPassword')}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
                style={styles.input}
                mode="outlined"
              />

              <TextInput
                label={t('profile.confirmNewPassword')}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                style={styles.input}
                mode="outlined"
              />

              <View style={styles.passwordButtons}>
                <Button
                  mode="outlined"
                  onPress={() => setShowPasswordForm(false)}
                  style={[styles.button, styles.cancelButton]}
                >
                  {t('profile.cancel')}
                </Button>
                <Button
                  mode="contained"
                  onPress={handleChangePassword}
                  loading={passwordLoading}
                  disabled={passwordLoading}
                  style={[styles.button, styles.confirmButton]}
                >
                  {t('profile.changePassword')}
                </Button>
      </View>
            </>
          )}
        </Card.Content>
      </Card>

      {/* Settings */}
      <Card style={[styles.sectionCard, { backgroundColor: currentTheme.colors.card }]}>
        <Card.Content>
          <Text style={[styles.sectionTitle, { color: currentTheme.colors.text }]}>
            {t('profile.settings')}
          </Text>

          <List.Item
            title={t('profile.language')}
            description={language === 'vi' ? t('profile.vietnamese') : t('profile.english')}
            right={() => (
              <View style={styles.languageToggle}>
                <Button
                  mode={language === 'vi' ? 'contained' : 'outlined'}
                  onPress={() => setLanguage('vi')}
                  style={styles.languageButton}
                >
                  {t('profile.vi')}
                </Button>
                <Button
                  mode={language === 'en' ? 'contained' : 'outlined'}
                  onPress={() => setLanguage('en')}
                  style={styles.languageButton}
                >
                  {t('profile.en')}
                </Button>
    </View>
            )}
          />

          <Divider />

          <List.Item
            title={t('profile.darkMode')}
            description={theme === 'dark' ? t('profile.on') : t('profile.off')}
            right={() => (
              <Switch
                value={theme === 'dark'}
                onValueChange={toggleTheme}
              />
            )}
          />
        </Card.Content>
      </Card>

      {/* Logout */}
      <Card style={[styles.sectionCard, { backgroundColor: currentTheme.colors.card }]}>
        <Card.Content>
          <Button
            mode="contained"
            onPress={handleLogout}
            style={[styles.button, styles.logoutButton]}
            buttonColor={currentTheme.colors.error}
          >
            {t('profile.logout')}
          </Button>
        </Card.Content>
      </Card>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={dateOfBirth || new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) {
              setDateOfBirth(selectedDate);
            }
          }}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  profileCard: {
    marginBottom: 16,
    elevation: 2,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
  },
  sectionCard: {
    marginBottom: 16,
      elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    marginBottom: 12,
  },
  dateInput: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 4,
    marginBottom: 12,
  },
  dateLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 16,
  },
  button: {
    marginTop: 8,
    borderRadius: 8,
  },
  passwordButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
  },
  confirmButton: {
    flex: 1,
    marginLeft: 8,
  },
  languageToggle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageButton: {
    marginHorizontal: 4,
    minWidth: 40,
  },
  logoutButton: {
    marginTop: 8,
  },
  genderPicker: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
    marginBottom: 12,
  },
  genderButton: {
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
});

export default ProfileScreen;