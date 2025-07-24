import { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Custom hook to handle onboarding completion navigation
 * This provides a clean way to navigate after onboarding without using reset actions
 */
export const useOnboardingNavigation = () => {
  const navigation = useNavigation();

  const completeOnboarding = async () => {
    try {
      console.log("🎯 Completing onboarding...");
      
      // Set onboarding as completed
      await AsyncStorage.setItem("hasSeenOnboarding", "true");
      console.log("✅ Onboarding status saved to AsyncStorage");
      
      // Trigger a small delay to ensure AsyncStorage is written
      setTimeout(() => {
        console.log("🔄 Onboarding completed - triggering navigation refresh");
        // The RootNavigator will automatically detect the change and re-render
      }, 100);
      
      return true;
    } catch (error) {
      console.error("❌ Error completing onboarding:", error);
      return false;
    }
  };

  const skipOnboarding = async () => {
    try {
      console.log("⏭️ Skipping onboarding...");
      return await completeOnboarding();
    } catch (error) {
      console.error("❌ Error skipping onboarding:", error);
      return false;
    }
  };

  const resetOnboarding = async () => {
    try {
      console.log("🔄 Resetting onboarding...");
      await AsyncStorage.removeItem("hasSeenOnboarding");
      console.log("✅ Onboarding reset");
      return true;
    } catch (error) {
      console.error("❌ Error resetting onboarding:", error);
      return false;
    }
  };

  return {
    completeOnboarding,
    skipOnboarding,
    resetOnboarding,
  };
};
