import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/home/HomeScreen';
import NotesListScreen from '../screens/notes/NotesListScreen';
import FlashcardDecksScreen from '../screens/flashcards/FlashcardDecksScreen';
import StudyPlanScreen from '../screens/planner/StudyPlanScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import AIChatScreen from '../screens/AIChatScreen';

const Tab = createBottomTabNavigator();

const AppNavigator = () => (
  <Tab.Navigator
    screenOptions={{ headerShown: false }}
    initialRouteName="Home"
  >
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Notes" component={NotesListScreen} />
    <Tab.Screen name="Flashcards" component={FlashcardDecksScreen} />
    <Tab.Screen name="Planner" component={StudyPlanScreen} />
    <Tab.Screen name="AI Chat" component={AIChatScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

export default AppNavigator;
