import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import HomeScreen from '../screens/home/HomeScreen';
import NotesListScreen from '../screens/notes/NotesListScreen';
import FlashcardDecksScreen from '../screens/flashcards/FlashcardDecksScreen';
import StudyPlanScreen from '../screens/planner/StudyPlanScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import AIChatScreen from '../screens/AIChatScreen';

const Tab = createBottomTabNavigator();

const AppNavigator = () => {
  const { t } = useTranslation();
  const { currentTheme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Notes') {
            iconName = focused ? 'document-text' : 'document-text-outline';
          } else if (route.name === 'Flashcards') {
            iconName = focused ? 'albums' : 'albums-outline';
          } else if (route.name === 'Planner') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'AI Chat') {
            iconName = focused ? 'chatbubble' : 'chatbubble-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: currentTheme.colors.primary,
        tabBarInactiveTintColor: currentTheme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: currentTheme.colors.card,
          borderTopColor: currentTheme.colors.border,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      })}
      initialRouteName="Home"
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: t('navigation.home') }} />
      <Tab.Screen name="Notes" component={NotesListScreen} options={{ tabBarLabel: t('navigation.notes') }} />
      <Tab.Screen name="Flashcards" component={FlashcardDecksScreen} options={{ tabBarLabel: t('navigation.flashcards') }} />
      <Tab.Screen name="Planner" component={StudyPlanScreen} options={{ tabBarLabel: t('navigation.planner') }} />
      <Tab.Screen name="AI Chat" component={AIChatScreen} options={{ tabBarLabel: t('navigation.aiChat') }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: t('navigation.profile') }} />
    </Tab.Navigator>
  );
};
//for push
export default AppNavigator;
