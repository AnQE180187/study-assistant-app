import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { HomeScreen } from '../screens/HomeScreen/HomeScreen';
import { NoteScreen } from '../screens/NoteScreen/NoteScreen';
import { FlashcardScreen } from '../screens/FlashcardScreen/FlashcardScreen';
import { FlashcardDetailScreen } from '../screens/FlashcardScreen/FlashcardDetailScreen';
import { CreateFlashcardScreen } from '../screens/FlashcardScreen/CreateFlashcardScreen';
import { AskAIScreen } from '../screens/AskAIScreen/AskAIScreen';
import { AuthScreen } from '../screens/AuthScreen/AuthScreen';

import { COLORS } from '../constants/theme';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const FlashcardStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: COLORS.white,
      },
      headerTintColor: COLORS.gray[800],
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    }}
  >
    <Stack.Screen
      name="FlashcardList"
      component={FlashcardScreen}
      options={{
        title: 'My Flashcards',
      }}
    />
    <Stack.Screen
      name="FlashcardDetail"
      component={FlashcardDetailScreen}
      options={{
        title: 'Flashcard',
      }}
    />
    <Stack.Screen
      name="CreateFlashcard"
      component={CreateFlashcardScreen}
      options={{
        title: 'Create Flashcard',
      }}
    />
  </Stack.Navigator>
);

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={{
      tabBarActiveTintColor: COLORS.primary,
      tabBarInactiveTintColor: COLORS.gray[600],
      tabBarStyle: {
        backgroundColor: COLORS.white,
        borderTopColor: COLORS.gray[200],
      },
      headerShown: false,
    }}
  >
    <Tab.Screen
      name="Home"
      component={HomeScreen}
      options={{
        tabBarIcon: ({ color, size }) => (
          <Icon name="home" size={size} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="Notes"
      component={NoteScreen}
      options={{
        tabBarIcon: ({ color, size }) => (
          <Icon name="note-text" size={size} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="Flashcards"
      component={FlashcardStack}
      options={{
        tabBarIcon: ({ color, size }) => (
          <Icon name="cards" size={size} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="Ask AI"
      component={AskAIScreen}
      options={{
        tabBarIcon: ({ color, size }) => (
          <Icon name="robot" size={size} color={color} />
        ),
      }}
    />
  </Tab.Navigator>
);

export const AppNavigator = () => {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthScreen} />
        ) : (
          <Stack.Screen name="Main" component={MainTabs} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}; 