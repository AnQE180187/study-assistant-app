import React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import { Provider as ReduxProvider } from 'react-redux';
import RootNavigator from './src/navigation/RootNavigator';
import { AuthProvider } from './src/contexts/AuthContext';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { LanguageProvider } from './src/contexts/LanguageContext';
import { lightTheme, darkTheme } from './src/constants/themes';
import store from './src/store/store';
import './src/services/i18n'; // Import i18n to initialize translations

export default function App() {
  return (
    <ReduxProvider store={store}>
    <AuthProvider>
        <ThemeProvider>
          <LanguageProvider>
            <PaperProvider>
      <RootNavigator />
            </PaperProvider>
          </LanguageProvider>
        </ThemeProvider>
    </AuthProvider>
    </ReduxProvider>
  );
}
