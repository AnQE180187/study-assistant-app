import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import en from "../locales/en.json";
import vi from "../locales/vi.json";

const resources = {
  en: {
    translation: en,
  },
  vi: {
    translation: vi,
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "en", // default language
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

// Load saved language from AsyncStorage
const loadSavedLanguage = async () => {
  try {
    const savedLanguage = await AsyncStorage.getItem("language");
    if (savedLanguage && (savedLanguage === "vi" || savedLanguage === "en")) {
      i18n.changeLanguage(savedLanguage);
    } else {
      // Set default to English if no saved language
      i18n.changeLanguage("en");
    }
  } catch (error) {
    console.error("Error loading saved language:", error);
    // Fallback to English on error
    i18n.changeLanguage("en");
  }
};

// Initialize saved language
loadSavedLanguage();

export default i18n;
