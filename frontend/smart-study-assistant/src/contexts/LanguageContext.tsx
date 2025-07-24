import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { updateLanguage } from "../services/authService";
import i18n from "../services/i18n";

type Language = "vi" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

interface LanguageProviderProps {
  children: React.ReactNode;
  initialLanguage?: Language;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({
  children,
  initialLanguage = "en",
}) => {
  const [language, setLanguageState] = useState<Language>(initialLanguage);

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem("language");
      if (savedLanguage && (savedLanguage === "vi" || savedLanguage === "en")) {
        setLanguageState(savedLanguage);
        i18n.changeLanguage(savedLanguage);
      } else {
        // Set default to English if no saved language
        setLanguageState("en");
        i18n.changeLanguage("en");
      }
    } catch (error) {
      console.error("Error loading language:", error);
      // Fallback to English on error
      setLanguageState("en");
      i18n.changeLanguage("en");
    }
  };

  const setLanguage = async (newLanguage: Language) => {
    try {
      setLanguageState(newLanguage);
      i18n.changeLanguage(newLanguage);
      await AsyncStorage.setItem("language", newLanguage);
      // Sync with backend if user is logged in
      try {
        await updateLanguage(newLanguage);
      } catch (error) {
        console.error("Error syncing language with backend:", error);
      }
    } catch (error) {
      console.error("Error saving language:", error);
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};
