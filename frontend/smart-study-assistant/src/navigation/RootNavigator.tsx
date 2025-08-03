import React, { useEffect, useState, useCallback } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { AppState } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AuthNavigator from "./AuthNavigator";
import AppNavigator from "./AppNavigator";
import OnboardingScreen from "../screens/onboarding/OnboardingScreen";
import { useAuth } from "../contexts/AuthContext";
import FlashcardPracticeScreen from "../screens/flashcards/FlashcardPracticeScreen";
import FlashcardManagementScreen from "../screens/flashcards/FlashcardManagementScreen";
import FlashcardDeckDetailScreen from "../screens/flashcards/FlashcardDeckDetailScreen";
import StudyPlanScreen from "../screens/planner/StudyPlanScreen";
import NotesListScreen from "../screens/notes/NotesListScreen";
import NoteEditorScreen from "../screens/notes/NoteEditorScreen";
import PaymentScreen from "../screens/payment/PaymentScreen";

const RootStack = createStackNavigator();

const RootNavigator = () => {
  const { token, user } = useAuth();
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(
    null
  );
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true);

  // 🔁 Optimized onboarding status checker
  const checkOnboardingStatus = useCallback(async () => {
    try {
      setIsCheckingOnboarding(true);
      const value = await AsyncStorage.getItem("hasSeenOnboarding");
      const newValue = value === "true";

      if (hasSeenOnboarding !== newValue) {
        console.log(
          "📱 Onboarding status changed:",
          hasSeenOnboarding,
          "→",
          newValue
        );
        setHasSeenOnboarding(newValue);
      }
    } catch (error) {
      console.error("❌ Error checking onboarding status:", error);
      if (hasSeenOnboarding !== false) {
        setHasSeenOnboarding(false);
      }
    } finally {
      setIsCheckingOnboarding(false);
    }
  }, [hasSeenOnboarding]);

  // 📲 Initial check on mount
  useEffect(() => {
    checkOnboardingStatus();
  }, [checkOnboardingStatus]);

  // 🌀 Listen to app state change (resume)
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === "active") {
        checkOnboardingStatus();
      }
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );
    return () => subscription.remove();
  }, [checkOnboardingStatus]);

  // ⏱ Check every 2s ONLY when onboarding has not been completed
  useEffect(() => {
    if (hasSeenOnboarding !== false) return;

    console.log("🔄 Setting up onboarding interval...");
    const interval = setInterval(() => {
      console.log("🔍 Checking for onboarding completion...");
      checkOnboardingStatus();
    }, 3000);

    return () => {
      console.log("🛑 Clearing onboarding interval");
      clearInterval(interval);
    };
  }, [hasSeenOnboarding, checkOnboardingStatus]);

  // ⏳ Wait while loading onboarding status
  if (hasSeenOnboarding === null || isCheckingOnboarding) {
    return null; // Or return a loading screen if needed
  }

  console.log("🎬 RootNavigator Render:", {
    hasSeenOnboarding,
    token,
  });

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {!hasSeenOnboarding ? (
          <RootStack.Screen name="Onboarding" component={OnboardingScreen} />
        ) : token ? (
          <>
            <RootStack.Screen name="App" component={AppNavigator} />
            <RootStack.Screen
              name="FlashcardPractice"
              component={FlashcardPracticeScreen}
            />
            <RootStack.Screen
              name="FlashcardManagement"
              component={FlashcardManagementScreen}
            />
            <RootStack.Screen
              name="FlashcardDeckDetailScreen"
              component={FlashcardDeckDetailScreen}
            />
            <RootStack.Screen
              name="StudyPlanScreen"
              component={StudyPlanScreen}
            />
            <RootStack.Screen
              name="NotesListScreen"
              component={NotesListScreen}
            />
            <RootStack.Screen name="NoteEditor" component={NoteEditorScreen} />
            <RootStack.Screen name="Payment" component={PaymentScreen} />
          </>
        ) : (
          <RootStack.Screen name="Auth" component={AuthNavigator} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
