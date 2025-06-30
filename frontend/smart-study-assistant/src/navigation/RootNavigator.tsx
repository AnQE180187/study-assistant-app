import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import AuthNavigator from "./AuthNavigator";
import AppNavigator from "./AppNavigator";
import { useAuth } from '../contexts/AuthContext';
import FlashcardPracticeScreen from '../screens/flashcards/FlashcardPracticeScreen';
import FlashcardManagementScreen from '../screens/flashcards/FlashcardManagementScreen';
import FlashcardDeckDetailScreen from '../screens/flashcards/FlashcardDeckDetailScreen';
import StudyPlanScreen from '../screens/planner/StudyPlanScreen';
import NotesListScreen from '../screens/notes/NotesListScreen';

const RootStack = createStackNavigator();

const RootNavigator = () => {
  const { token } = useAuth();

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {token ? (
          <>
            <RootStack.Screen name="App" component={AppNavigator} />
            <RootStack.Screen name="FlashcardPractice" component={FlashcardPracticeScreen} />
            <RootStack.Screen name="FlashcardManagement" component={FlashcardManagementScreen} />
            <RootStack.Screen name="FlashcardDeckDetailScreen" component={FlashcardDeckDetailScreen} />
            <RootStack.Screen name="StudyPlanScreen" component={StudyPlanScreen} />
            <RootStack.Screen name="NotesListScreen" component={NotesListScreen} />
          </>
        ) : (
          <RootStack.Screen name="Auth" component={AuthNavigator} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
