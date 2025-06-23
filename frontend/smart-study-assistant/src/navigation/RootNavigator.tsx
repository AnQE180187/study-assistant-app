import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import AuthNavigator from "./AuthNavigator";
import AppNavigator from "./AppNavigator";
import { useAuth } from '../contexts/AuthContext';
import FlashcardPracticeScreen from '../screens/flashcards/FlashcardPracticeScreen';

const RootStack = createStackNavigator();

const RootNavigator = () => {
  const { isLoggedIn } = useAuth();

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {isLoggedIn ? (
          <>
            <RootStack.Screen name="App" component={AppNavigator} />
            <RootStack.Screen name="FlashcardPractice" component={FlashcardPracticeScreen} />
          </>
        ) : (
          <RootStack.Screen name="Auth" component={AuthNavigator} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
