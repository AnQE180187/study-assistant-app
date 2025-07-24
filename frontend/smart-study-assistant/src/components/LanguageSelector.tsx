import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
  Animated,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../contexts/ThemeContext";

const { width, height } = Dimensions.get("window");

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

interface LanguageSelectorProps {
  style?: any;
  showLabel?: boolean;
  compact?: boolean;
}

const languages: Language[] = [
  {
    code: "en",
    name: "English",
    nativeName: "English",
    flag: "🇺🇸",
  },
  {
    code: "vi",
    name: "Vietnamese",
    nativeName: "Tiếng Việt",
    flag: "🇻🇳",
  },
];

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  style,
  showLabel = true,
  compact = false,
}) => {
  const { i18n, t } = useTranslation();
  const { currentTheme } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  const currentLanguage =
    languages.find((lang) => lang.code === i18n.language) || languages[0];

  const changeLanguage = async (languageCode: string) => {
    try {
      await i18n.changeLanguage(languageCode);
      await AsyncStorage.setItem("language", languageCode); // Sử dụng key đúng
      setModalVisible(false);

      // Animate fade out
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } catch (error) {
      console.error("Error changing language:", error);
    }
  };

  const openModal = () => {
    setModalVisible(true);
    // Animate fade in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeModal = () => {
    // Animate fade out
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false);
    });
  };

  const renderModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={closeModal}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={styles.modalBackdrop}
          onPress={closeModal}
          activeOpacity={1}
        />
        <Animated.View style={[styles.modalContainer, { opacity: fadeAnim }]}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <View style={styles.headerIcon}>
                <MaterialIcons name="language" size={24} color="#667eea" />
              </View>
              <Text style={styles.modalTitle}>
                {t("settings.selectLanguage")}
              </Text>
              <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                <MaterialIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Language Options */}
            <View style={styles.languageList}>
              {languages.map((language, index) => (
                <TouchableOpacity
                  key={language.code}
                  style={[
                    styles.languageItem,
                    i18n.language === language.code && styles.selectedLanguage,
                    index === 0 && styles.firstItem,
                    index === languages.length - 1 && styles.lastItem,
                  ]}
                  onPress={() => changeLanguage(language.code)}
                  activeOpacity={0.7}
                >
                  <View style={styles.languageInfo}>
                    <View style={styles.flagContainer}>
                      <Text style={styles.languageFlag}>{language.flag}</Text>
                    </View>
                    <View style={styles.languageText}>
                      <Text style={styles.languageName}>
                        {language.nativeName}
                      </Text>
                      <Text style={styles.languageSubname}>
                        {language.name}
                      </Text>
                    </View>
                  </View>
                  {i18n.language === language.code && (
                    <View style={styles.checkContainer}>
                      <MaterialIcons
                        name="check-circle"
                        size={24}
                        color="#4CAF50"
                      />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Footer */}
            <View style={styles.modalFooter}>
              <Text style={styles.footerText}>
                {t("settings.languageAppliedImmediately")}
              </Text>
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );

  if (compact) {
    return (
      <TouchableOpacity
        style={[
          styles.compactButton,
          {
            backgroundColor: currentTheme.colors.surface,
            borderColor: currentTheme.colors.border,
          },
          style,
        ]}
        onPress={openModal}
      >
        <Text style={styles.flag}>{currentLanguage.flag}</Text>
        <MaterialIcons
          name="expand-more"
          size={16}
          color={currentTheme.colors.textSecondary}
        />
        {renderModal()}
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={[
          styles.selector,
          {
            backgroundColor: currentTheme.colors.surface,
            borderColor: currentTheme.colors.border,
          },
        ]}
        onPress={openModal}
      >
        <View style={styles.currentLanguage}>
          <Text style={styles.flag}>{currentLanguage.flag}</Text>
          {showLabel && (
            <View style={styles.languageTextContainer}>
              <Text
                style={[
                  styles.currentLanguageName,
                  { color: currentTheme.colors.text },
                ]}
              >
                {currentLanguage.nativeName}
              </Text>
              <Text
                style={[
                  styles.currentLanguageCode,
                  { color: currentTheme.colors.textSecondary },
                ]}
              >
                {currentLanguage.code.toUpperCase()}
              </Text>
            </View>
          )}
        </View>
        <MaterialIcons
          name="expand-more"
          size={20}
          color={currentTheme.colors.textSecondary}
        />
      </TouchableOpacity>
      {renderModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  selector: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  currentLanguage: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 8,
  },
  flag: {
    fontSize: 24,
    marginRight: 8,
  },
  languageTextContainer: {
    alignItems: "flex-start",
  },
  currentLanguageName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  currentLanguageCode: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  compactButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    backgroundColor: "white",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 34,
    maxHeight: height * 0.7,
  },
  modalContent: {
    paddingTop: 8,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F8F9FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1A1A",
    flex: 1,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
  },
  languageList: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  languageItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginVertical: 4,
    borderRadius: 16,
    backgroundColor: "#FAFAFA",
    borderWidth: 2,
    borderColor: "transparent",
  },
  firstItem: {
    marginTop: 8,
  },
  lastItem: {
    marginBottom: 8,
  },
  selectedLanguage: {
    backgroundColor: "#F0F8FF",
    borderColor: "#4CAF50",
  },
  languageInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  flagContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  languageFlag: {
    fontSize: 24,
  },
  languageText: {
    flex: 1,
  },
  languageName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 2,
  },
  languageSubname: {
    fontSize: 14,
    color: "#666",
  },
  checkContainer: {
    marginLeft: 12,
  },
  modalFooter: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    marginTop: 8,
  },
  footerText: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
    fontStyle: "italic",
  },
});

export default LanguageSelector;
