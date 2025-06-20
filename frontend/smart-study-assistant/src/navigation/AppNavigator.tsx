import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import HomeScreen from "../screens/home/HomeScreen";
import NotesListScreen from "../screens/notes/NotesListScreen";
import FlashcardDecksScreen from "../screens/flashcards/FlashcardDecksScreen";
import FlashcardDeckDetailScreen from "../screens/flashcards/FlashcardDeckDetailScreen";
import FlashcardManagementScreen from "../screens/flashcards/FlashcardManagementScreen";
import FlashcardPracticeScreen from "../screens/flashcards/FlashcardPracticeScreen";
import FlashcardSearchScreen from "../screens/flashcards/FlashcardSearchScreen";
import CreateEditFlashcardScreen from "../screens/flashcards/CreateEditFlashcardScreen";
import StudyPlanScreen from "../screens/planner/StudyPlanScreen";
import ProfileScreen from "../screens/profile/ProfileScreen";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Flashcard Stack Navigator
const FlashcardStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="FlashcardDecks" component={FlashcardDecksScreen} />
    <Stack.Screen
      name="FlashcardDeckDetail"
      component={FlashcardDeckDetailScreen}
    />
    <Stack.Screen
      name="FlashcardManagement"
      component={FlashcardManagementScreen}
    />
    <Stack.Screen
      name="FlashcardPractice"
      component={FlashcardPracticeScreen}
    />
    <Stack.Screen name="FlashcardSearch" component={FlashcardSearchScreen} />
    <Stack.Screen
      name="CreateFlashcard"
      component={CreateEditFlashcardScreen}
    />
    <Stack.Screen name="EditFlashcard" component={CreateEditFlashcardScreen} />
  </Stack.Navigator>
);

const AppNavigator = () => (
  <Tab.Navigator
    screenOptions={{ headerShown: false }}
    initialRouteName="Flashcards"
  >
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Notes" component={NotesListScreen} />
    <Tab.Screen name="Flashcards" component={FlashcardStack} />
    <Tab.Screen name="Planner" component={StudyPlanScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

export default AppNavigator;
