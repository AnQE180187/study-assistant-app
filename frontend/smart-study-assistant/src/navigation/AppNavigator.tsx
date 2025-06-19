import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/home/HomeScreen';
import NotesListScreen from '../screens/notes/NotesListScreen';
import NoteEditorScreen from '../screens/notes/NoteEditorScreen';
import FlashcardDecksScreen from '../screens/flashcards/FlashcardDecksScreen';
import FlashcardPracticeScreen from '../screens/flashcards/FlashcardPracticeScreen';
import StudyPlanScreen from '../screens/planner/StudyPlanScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

const Tab = createBottomTabNavigator();
const NotesStack = createStackNavigator();
const FlashcardsStack = createStackNavigator();

function NotesStackScreen() {
  return (
    <NotesStack.Navigator>
      <NotesStack.Screen name="NotesList" component={NotesListScreen} options={{ title: 'Ghi chú' }} />
      <NotesStack.Screen name="NoteEditor" component={NoteEditorScreen} options={{ title: 'Soạn ghi chú' }} />
    </NotesStack.Navigator>
  );
}

function FlashcardsStackScreen() {
  return (
    <FlashcardsStack.Navigator>
      <FlashcardsStack.Screen name="FlashcardDecks" component={FlashcardDecksScreen} options={{ title: 'Flashcards' }} />
      <FlashcardsStack.Screen name="FlashcardPractice" component={FlashcardPracticeScreen} options={{ title: 'Luyện tập' }} />
    </FlashcardsStack.Navigator>
  );
}

const AppNavigator = () => (
  <Tab.Navigator>
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Notes" component={NotesStackScreen} />
    <Tab.Screen name="Flashcards" component={FlashcardsStackScreen} />
    <Tab.Screen name="Planner" component={StudyPlanScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

export default AppNavigator; 