import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Animated,
} from "react-native";
import {
  Text,
  TextInput,
  Button,
  Card,
  Switch,
  List,
  Avatar,
  Divider,
  IconButton,
} from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { useLanguage } from "../../contexts/LanguageContext";
import LanguageSelector from "../../components/LanguageSelector";
import {
  updateProfile,
  changePassword,
  UserProfile,
} from "../../services/authService";
import DateTimePicker from "@react-native-community/datetimepicker";

const ProfileScreen = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { user, logout, refreshUserProfile } = useAuth();
  const { currentTheme, toggleTheme } = useTheme();
  const { language } = useLanguage();

  // State variables
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showGenderPicker, setShowGenderPicker] = useState(false);
  const [showEducationPicker, setShowEducationPicker] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  // Form fields - Only database fields
  const [name, setName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [gender, setGender] = useState("");
  const [education, setEducation] = useState("");
  const [avatar, setAvatar] = useState("");

  // Password fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    console.log("🔍 ProfileScreen useEffect - user data:", user);
    if (user) {
      console.log("✅ User data found:", {
        name: user.name,
        email: user.email,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        education: user.education,
        avatar: user.avatar,
        role: user.role,
        createdAt: user.createdAt,
      });

      setProfile(user);
      // Only database fields
      setName(user.name || "");
      setDateOfBirth(user.dateOfBirth ? new Date(user.dateOfBirth) : null);
      setGender(user.gender || "");
      setEducation(user.education || "");
      setAvatar(user.avatar || "");
    } else {
      console.log("❌ No user data found in context");
    }
  }, [user]);

  // Refresh user profile when component mounts
  useEffect(() => {
    console.log("🔄 ProfileScreen mounted, refreshing user profile...");
    refreshUserProfile();
  }, []);

  // Helper functions
  const formatDate = (date: string | undefined) => {
    if (!date) return t("profile.notSet");
    const locale = language === "vi" ? "vi-VN" : "en-US";
    return new Date(date).toLocaleDateString(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getEducationLabel = (education: string | undefined) => {
    const educationMap: { [key: string]: string } = {
      ELEMENTARY: t("profile.elementary"),
      MIDDLE_SCHOOL: t("profile.middleSchool"),
      HIGH_SCHOOL: t("profile.highSchool"),
      UNIVERSITY: t("profile.university"),
      GRADUATE: t("profile.graduate"),
      OTHER: t("profile.educationOther"),
    };
    return educationMap[education || ""] || t("profile.notSet");
  };

  const getGenderLabel = (gender: string | undefined) => {
    const genderMap: { [key: string]: string } = {
      male: t("profile.male"),
      female: t("profile.female"),
      other: t("profile.other"),
    };
    return genderMap[gender || ""] || t("profile.notSet");
  };

  const getRoleLabel = (role: string) => {
    return role === "ADMIN" ? t("profile.admin") : t("profile.user");
  };

  const handleUpdateProfile = async () => {
    try {
      setLoading(true);
      const updateData: any = {};

      // Only database fields
      if (name.trim()) updateData.name = name.trim();
      if (dateOfBirth) updateData.dateOfBirth = dateOfBirth.toISOString();
      if (gender) updateData.gender = gender;
      if (education) updateData.education = education;
      if (avatar.trim()) updateData.avatar = avatar.trim();

      const updatedProfile = await updateProfile(updateData);
      setProfile(updatedProfile);
      setIsEditMode(false);

      // Refresh user profile in context
      await refreshUserProfile();

      Alert.alert(t("common.success"), t("profile.updateSuccess"));
    } catch (error: any) {
      Alert.alert(t("common.error"), t("profile.updateError"));
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert(t("common.error"), t("profile.fillAllFields"));
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert(t("common.error"), t("profile.passwordMismatch"));
      return;
    }

    try {
      setLoading(true);
      await changePassword(currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowChangePassword(false);
      Alert.alert(t("common.success"), t("profile.passwordChanged"));
    } catch (error: any) {
      Alert.alert(t("common.error"), error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={[
        styles.container,
        { backgroundColor: currentTheme.colors.background },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Profile Header */}
      <Card
        style={[
          styles.headerCard,
          { backgroundColor: currentTheme.colors.card },
        ]}
        elevation={5}
      >
        <Card.Content style={styles.headerContent}>
          {/* Header Top Row with Edit Button */}
          <View style={styles.headerTopRow}>
            <Text
              style={[styles.headerTitle, { color: currentTheme.colors.text }]}
            >
              {t("profile.title")}
            </Text>
            {!isEditMode && (
              <Button
                mode="contained"
                onPress={() => setIsEditMode(true)}
                style={[
                  styles.headerEditButton,
                  { backgroundColor: currentTheme.colors.primary },
                ]}
                icon="pencil"
                compact
              >
                {t("profile.edit")}
              </Button>
            )}
          </View>

          {/* Profile Info Row */}
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              {profile?.avatar ? (
                <Avatar.Image
                  size={100}
                  source={{ uri: profile.avatar }}
                  style={styles.avatarImage}
                />
              ) : (
                <Avatar.Text
                  size={100}
                  label={profile?.name?.charAt(0).toUpperCase() || "U"}
                  style={[
                    styles.avatarText,
                    { backgroundColor: currentTheme.colors.primary },
                  ]}
                />
              )}
              <View
                style={[styles.statusIndicator, { backgroundColor: "#4CAF50" }]}
              />
            </View>
            <View style={styles.profileInfo}>
              <Text
                style={[
                  styles.profileName,
                  { color: currentTheme.colors.text },
                ]}
              >
                {profile?.name || t("profile.notSet")}
              </Text>
              <Text
                style={[
                  styles.profileEmail,
                  { color: currentTheme.colors.textSecondary },
                ]}
              >
                {profile?.email}
              </Text>
              <View
                style={[
                  styles.profileBadge,
                  { backgroundColor: currentTheme.colors.primary + "20" },
                ]}
              >
                <Text
                  style={[
                    styles.badgeText,
                    { color: currentTheme.colors.primary },
                  ]}
                >
                  {profile?.role === "ADMIN"
                    ? "👑 " + t("profile.admin")
                    : "👤 " + t("profile.user")}
                </Text>
              </View>
              <Text
                style={[
                  styles.joinDate,
                  { color: currentTheme.colors.textSecondary },
                ]}
              >
                📅 {t("profile.joinDate")}: {formatDate(profile?.createdAt)}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Registration Information */}
      <Card
        style={[
          styles.sectionCard,
          { backgroundColor: currentTheme.colors.card },
        ]}
      >
        <Card.Content>
          <Text
            style={[styles.sectionTitle, { color: currentTheme.colors.text }]}
          >
            📋 {t("profile.registrationInfo")}
          </Text>

          {/* Personal Information Section */}
          <View style={styles.infoSection}>
            <Text
              style={[
                styles.sectionSubtitle,
                { color: currentTheme.colors.primary },
              ]}
            >
              👤 {t("profile.personalInfo")}
            </Text>
            <View style={styles.infoGrid}>
              <View style={styles.infoRow}>
                <Text
                  style={[
                    styles.infoLabel,
                    { color: currentTheme.colors.textSecondary },
                  ]}
                >
                  {t("profile.name")}:
                </Text>
                {isEditMode ? (
                  <TextInput
                    value={name}
                    onChangeText={setName}
                    style={[styles.inlineInput, { flex: 1 }]}
                    mode="outlined"
                    dense
                  />
                ) : (
                  <Text
                    style={[
                      styles.infoValue,
                      { color: currentTheme.colors.text },
                    ]}
                  >
                    {profile?.name || t("profile.notSet")}
                  </Text>
                )}
              </View>

              <View style={styles.infoRow}>
                <Text
                  style={[
                    styles.infoLabel,
                    { color: currentTheme.colors.textSecondary },
                  ]}
                >
                  Email:
                </Text>
                <Text
                  style={[
                    styles.infoValue,
                    { color: currentTheme.colors.text },
                  ]}
                >
                  {profile?.email || t("profile.notSet")}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text
                  style={[
                    styles.infoLabel,
                    { color: currentTheme.colors.textSecondary },
                  ]}
                >
                  {t("profile.dateOfBirth")}:
                </Text>
                <View style={{ flex: 1 }}>
                  {isEditMode ? (
                    <View>
                      <TouchableOpacity
                        style={[
                          styles.inlineEditField,
                          { backgroundColor: currentTheme.colors.surface },
                        ]}
                        onPress={() => setShowDatePicker(true)}
                      >
                        <Text
                          style={[
                            styles.editFieldText,
                            { color: currentTheme.colors.text },
                          ]}
                        >
                          {dateOfBirth
                            ? formatDate(dateOfBirth.toISOString())
                            : t("profile.selectDate")}
                        </Text>
                        <Text
                          style={[
                            styles.editIcon,
                            { color: currentTheme.colors.primary },
                          ]}
                        >
                          📅
                        </Text>
                      </TouchableOpacity>
                      {showDatePicker && (
                        <DateTimePicker
                          value={dateOfBirth || new Date()}
                          mode="date"
                          display="default"
                          onChange={(_, selectedDate) => {
                            setShowDatePicker(false);
                            if (selectedDate) {
                              setDateOfBirth(selectedDate);
                            }
                          }}
                        />
                      )}
                    </View>
                  ) : (
                    <Text
                      style={[
                        styles.infoValue,
                        { color: currentTheme.colors.text },
                      ]}
                    >
                      {formatDate(profile?.dateOfBirth)}
                    </Text>
                  )}
                </View>
              </View>
            </View>
          </View>

          {/* Academic Information Section */}
          <View style={styles.infoSection}>
            <Text
              style={[
                styles.sectionSubtitle,
                { color: currentTheme.colors.primary },
              ]}
            >
              🎓 {t("profile.academicInfo")}
            </Text>
            <View style={styles.infoGrid}>
              <View style={styles.infoRow}>
                <Text
                  style={[
                    styles.infoLabel,
                    { color: currentTheme.colors.textSecondary },
                  ]}
                >
                  {t("profile.education")}:
                </Text>
                <View style={{ flex: 1 }}>
                  {isEditMode ? (
                    <View>
                      <TouchableOpacity
                        style={[
                          styles.inlineEditField,
                          { backgroundColor: currentTheme.colors.surface },
                        ]}
                        onPress={() =>
                          setShowEducationPicker(!showEducationPicker)
                        }
                      >
                        <Text
                          style={[
                            styles.editFieldText,
                            { color: currentTheme.colors.text },
                          ]}
                        >
                          {getEducationLabel(education)}
                        </Text>
                        <Text
                          style={[
                            styles.editIcon,
                            { color: currentTheme.colors.primary },
                          ]}
                        >
                          {showEducationPicker ? "▲" : "▼"}
                        </Text>
                      </TouchableOpacity>
                      {showEducationPicker && (
                        <View
                          style={[
                            styles.inlineDropdown,
                            { backgroundColor: currentTheme.colors.surface },
                          ]}
                        >
                          {[
                            {
                              label: t("profile.elementary"),
                              value: "ELEMENTARY",
                            },
                            {
                              label: t("profile.middleSchool"),
                              value: "MIDDLE_SCHOOL",
                            },
                            {
                              label: t("profile.highSchool"),
                              value: "HIGH_SCHOOL",
                            },
                            {
                              label: t("profile.university"),
                              value: "UNIVERSITY",
                            },
                            { label: t("profile.graduate"), value: "GRADUATE" },
                            {
                              label: t("profile.educationOther"),
                              value: "OTHER",
                            },
                            { label: t("profile.noEducation"), value: "" },
                          ].map((option) => (
                            <TouchableOpacity
                              key={option.value}
                              style={[
                                styles.dropdownItem,
                                education === option.value && {
                                  backgroundColor:
                                    currentTheme.colors.primary + "20",
                                },
                              ]}
                              onPress={() => {
                                setEducation(option.value);
                                setShowEducationPicker(false);
                              }}
                            >
                              <Text
                                style={[
                                  styles.dropdownText,
                                  { color: currentTheme.colors.text },
                                  education === option.value && {
                                    fontWeight: "bold",
                                  },
                                ]}
                              >
                                {option.label}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      )}
                    </View>
                  ) : (
                    <Text
                      style={[
                        styles.infoValue,
                        { color: currentTheme.colors.text },
                      ]}
                    >
                      {getEducationLabel(profile?.education)}
                    </Text>
                  )}
                </View>
              </View>

              <View style={styles.infoRow}>
                <Text
                  style={[
                    styles.infoLabel,
                    { color: currentTheme.colors.textSecondary },
                  ]}
                >
                  {t("profile.gender")}:
                </Text>
                <View style={{ flex: 1 }}>
                  {isEditMode ? (
                    <View>
                      <TouchableOpacity
                        style={[
                          styles.inlineEditField,
                          { backgroundColor: currentTheme.colors.surface },
                        ]}
                        onPress={() => setShowGenderPicker(!showGenderPicker)}
                      >
                        <Text
                          style={[
                            styles.editFieldText,
                            { color: currentTheme.colors.text },
                          ]}
                        >
                          {getGenderLabel(gender)}
                        </Text>
                        <Text
                          style={[
                            styles.editIcon,
                            { color: currentTheme.colors.primary },
                          ]}
                        >
                          {showGenderPicker ? "▲" : "▼"}
                        </Text>
                      </TouchableOpacity>
                      {showGenderPicker && (
                        <View
                          style={[
                            styles.inlineDropdown,
                            { backgroundColor: currentTheme.colors.surface },
                          ]}
                        >
                          {[
                            { label: t("profile.male"), value: "male" },
                            { label: t("profile.female"), value: "female" },
                            { label: t("profile.other"), value: "other" },
                          ].map((option) => (
                            <TouchableOpacity
                              key={option.value}
                              style={[
                                styles.dropdownItem,
                                gender === option.value && {
                                  backgroundColor:
                                    currentTheme.colors.primary + "20",
                                },
                              ]}
                              onPress={() => {
                                setGender(option.value);
                                setShowGenderPicker(false);
                              }}
                            >
                              <Text
                                style={[
                                  styles.dropdownText,
                                  { color: currentTheme.colors.text },
                                  gender === option.value && {
                                    fontWeight: "bold",
                                  },
                                ]}
                              >
                                {option.label}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      )}
                    </View>
                  ) : (
                    <Text
                      style={[
                        styles.infoValue,
                        { color: currentTheme.colors.text },
                      ]}
                    >
                      {getGenderLabel(profile?.gender)}
                    </Text>
                  )}
                </View>
              </View>
            </View>
          </View>

          {/* Avatar Section */}
          <View style={styles.infoSection}>
            <Text
              style={[
                styles.sectionSubtitle,
                { color: currentTheme.colors.primary },
              ]}
            >
              �️ Profile Picture
            </Text>
            <View style={styles.infoGrid}>
              <View style={styles.infoRow}>
                <Text
                  style={[
                    styles.infoLabel,
                    { color: currentTheme.colors.textSecondary },
                  ]}
                >
                  {t("profile.avatarUrl")}:
                </Text>
                {isEditMode ? (
                  <TextInput
                    value={avatar}
                    onChangeText={setAvatar}
                    style={[styles.inlineInput, { flex: 1 }]}
                    mode="outlined"
                    dense
                    placeholder="https://example.com/avatar.jpg"
                    keyboardType="url"
                  />
                ) : (
                  <Text
                    style={[
                      styles.infoValue,
                      { color: currentTheme.colors.text },
                    ]}
                  >
                    {avatar || t("profile.noAvatarSet")}
                  </Text>
                )}
              </View>
            </View>
          </View>

          {/* Account Information Section */}
          <View style={styles.infoSection}>
            <Text
              style={[
                styles.sectionSubtitle,
                { color: currentTheme.colors.primary },
              ]}
            >
              🔐 {t("profile.accountInfo")}
            </Text>
            <View style={styles.infoGrid}>
              <View style={styles.infoRow}>
                <Text
                  style={[
                    styles.infoLabel,
                    { color: currentTheme.colors.textSecondary },
                  ]}
                >
                  {t("profile.role")}:
                </Text>
                <Text
                  style={[
                    styles.infoValue,
                    { color: currentTheme.colors.text },
                  ]}
                >
                  {getRoleLabel(profile?.role || "USER")}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text
                  style={[
                    styles.infoLabel,
                    { color: currentTheme.colors.textSecondary },
                  ]}
                >
                  {t("profile.joinDate")}:
                </Text>
                <Text
                  style={[
                    styles.infoValue,
                    { color: currentTheme.colors.text },
                  ]}
                >
                  {formatDate(profile?.createdAt)}
                </Text>
              </View>
            </View>
          </View>

          {/* Save/Cancel buttons - Only show in edit mode */}
          {isEditMode && (
            <View style={styles.editButtons}>
              <Button
                mode="outlined"
                onPress={() => {
                  setIsEditMode(false);
                  // Reset to original values - only database fields
                  if (user) {
                    setName(user.name || "");
                    setDateOfBirth(
                      user.dateOfBirth ? new Date(user.dateOfBirth) : null
                    );
                    setGender(user.gender || "");
                    setEducation(user.education || "");
                    setAvatar(user.avatar || "");
                  }
                }}
                style={styles.cancelButton}
                disabled={loading}
              >
                {t("profile.cancel")}
              </Button>
              <Button
                mode="contained"
                onPress={handleUpdateProfile}
                loading={loading}
                disabled={loading}
                style={styles.saveButton}
              >
                {t("profile.updateProfile")}
              </Button>
            </View>
          )}
        </Card.Content>
      </Card>

      {/* Change Password Section */}
      <Card
        style={[
          styles.sectionCard,
          { backgroundColor: currentTheme.colors.card },
        ]}
      >
        <Card.Content>
          <Text
            style={[styles.sectionTitle, { color: currentTheme.colors.text }]}
          >
            🔐 {t("profile.changePassword")}
          </Text>

          {!showChangePassword ? (
            <Button
              mode="outlined"
              onPress={() => setShowChangePassword(true)}
              style={styles.button}
            >
              {t("profile.changePassword")}
            </Button>
          ) : (
            <>
              <TextInput
                label={t("profile.currentPassword")}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry
                style={styles.input}
                mode="outlined"
              />

              <TextInput
                label={t("profile.newPassword")}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
                style={styles.input}
                mode="outlined"
              />

              <TextInput
                label={t("profile.confirmPassword")}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                style={styles.input}
                mode="outlined"
              />

              <View style={styles.passwordButtons}>
                <Button
                  mode="outlined"
                  onPress={() => {
                    setShowChangePassword(false);
                    setCurrentPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                  }}
                  style={styles.cancelButton}
                >
                  {t("profile.cancel")}
                </Button>
                <Button
                  mode="contained"
                  onPress={handleChangePassword}
                  loading={loading}
                  disabled={loading}
                  style={styles.saveButton}
                >
                  {t("profile.changePassword")}
                </Button>
              </View>
            </>
          )}
        </Card.Content>
      </Card>

      {/* Settings Section */}
      <Card
        style={[
          styles.sectionCard,
          { backgroundColor: currentTheme.colors.card },
        ]}
      >
        <Card.Content>
          <Text
            style={[styles.sectionTitle, { color: currentTheme.colors.text }]}
          >
            ⚙️ {t("profile.settings")}
          </Text>

          <List.Item
            title={t("profile.language")}
            description={t("settings.selectLanguage")}
            right={() => (
              <View style={styles.languageSelector}>
                <LanguageSelector compact={true} showLabel={false} />
              </View>
            )}
          />

          <Divider />

          <List.Item
            title={t("profile.darkMode")}
            description={t("settings.toggleDarkMode")}
            right={() => (
              <Switch
                value={currentTheme.colors.background === "#121212"}
                onValueChange={toggleTheme}
              />
            )}
          />

          <Divider />

          <List.Item
            title={t("profile.logout")}
            description={t("settings.logoutDescription")}
            left={(props) => <List.Icon {...props} icon="logout" />}
            onPress={() => {
              Alert.alert(t("profile.logout"), t("settings.confirmLogout"), [
                { text: t("profile.cancel"), style: "cancel" },
                { text: t("profile.logout"), onPress: logout },
              ]);
            }}
          />
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 8,
  },
  headerCard: {
    marginBottom: 20,
    elevation: 6,
    borderRadius: 16,
    marginHorizontal: 4,
  },
  headerContent: {
    paddingVertical: 8,
  },
  headerTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  headerEditButton: {
    borderRadius: 20,
    elevation: 2,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  avatarContainer: {
    position: "relative",
  },
  avatarImage: {
    borderWidth: 3,
    borderColor: "#fff",
  },
  avatarText: {
    borderWidth: 3,
    borderColor: "#fff",
    elevation: 2,
  },
  statusIndicator: {
    position: "absolute",
    bottom: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: "#fff",
  },
  profileInfo: {
    marginLeft: 20,
    flex: 1,
  },
  profileName: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    marginBottom: 8,
    opacity: 0.8,
  },
  profileBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 6,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: "600",
  },
  joinDate: {
    fontSize: 13,
    opacity: 0.7,
  },
  sectionCard: {
    marginBottom: 20,
    elevation: 3,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  editButton: {
    minWidth: 100,
    borderRadius: 25,
    elevation: 2,
  },
  infoSection: {
    marginBottom: 20,
  },
  sectionSubtitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: "rgba(0,0,0,0.1)",
    letterSpacing: 0.5,
  },
  sectionTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionIcon: {
    margin: 0,
    marginRight: 8,
  },
  sectionTitleText: {
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  infoGrid: {
    paddingLeft: 8,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    minHeight: 40,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    flex: 2,
    textAlign: "right",
  },
  inlineInput: {
    marginLeft: 8,
    height: 40,
  },
  inlinePicker: {
    marginLeft: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 4,
    justifyContent: "center",
  },
  pickerValue: {
    fontSize: 14,
  },
  pickerContainer: {
    marginTop: 16,
    marginBottom: 16,
    padding: 16,
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
  },
  pickerTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    textAlign: "center",
  },
  pickerButton: {
    marginBottom: 8,
    borderRadius: 8,
  },
  genderPicker: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 8,
  },
  genderButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  editButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 2,
    borderTopColor: "rgba(0,0,0,0.1)",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    borderRadius: 25,
    borderWidth: 2,
    elevation: 1,
  },
  saveButton: {
    flex: 1,
    borderRadius: 25,
    elevation: 3,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
  },
  passwordButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  languageSelector: {
    alignItems: "center",
  },
  inlineEditField: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E3F2FD",
    marginTop: 6,
    backgroundColor: "#FAFAFA",
    elevation: 1,
  },
  editFieldText: {
    fontSize: 15,
    flex: 1,
    fontWeight: "500",
  },
  editIcon: {
    fontSize: 18,
    marginLeft: 12,
    fontWeight: "bold",
  },
  inlineDropdown: {
    marginTop: 6,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E3F2FD",
    maxHeight: 220,
    backgroundColor: "#FAFAFA",
    elevation: 3,
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  dropdownText: {
    fontSize: 15,
    fontWeight: "500",
  },
});

export default ProfileScreen;
