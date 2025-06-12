import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider } from 'react-native-paper';
import { AppNavigator } from './navigation/AppNavigator';
import { COLORS } from './constants/theme';

const App = () => {
  return (
    <SafeAreaProvider>
      <PaperProvider
        theme={{
          colors: {
            primary: COLORS.primary,
            accent: COLORS.secondary,
          },
        }}
      >
        <AppNavigator />
      </PaperProvider>
    </SafeAreaProvider>
  );
};

export default App; 