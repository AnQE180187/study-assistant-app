import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme, IconButton } from "react-native-paper";
import { Alert } from "react-native";
import { useAuth } from "../contexts/AuthContext";

// Admin Screens
import AdminDashboardScreen from "../screens/admin/AdminDashboardScreen";
import AdminUsersScreen from "../screens/admin/AdminUsersScreen";
import AdminFlashcardsScreen from "../screens/admin/AdminFlashcardsScreen";
import AdminFlashcardDeckScreen from "../screens/admin/AdminFlashcardDeckScreen";
import AdminAiLogsScreen from "../screens/admin/AdminAiLogsScreen";

import { RootStackParamList } from "./types";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator<RootStackParamList>();

const AdminTabNavigator = () => {
  const theme = useTheme();
  const { logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      "Đăng xuất",
      "Bạn có chắc chắn muốn đăng xuất khỏi tài khoản admin?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Đăng xuất",
          style: "destructive",
          onPress: () => {
            logout();
          },
        },
      ]
    );
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof MaterialIcons.glyphMap;

          if (route.name === "AdminDashboard") {
            iconName = "dashboard";
          } else if (route.name === "AdminUsers") {
            iconName = "people";
          } else if (route.name === "AdminFlashcards") {
            iconName = "library-books";
          } else if (route.name === "AdminAiLogs") {
            iconName = "memory";
          } else {
            iconName = "dashboard";
          }

          return <MaterialIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: "gray",
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerStyle: {
          backgroundColor: theme.colors.primary,
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "bold",
        },
      })}
    >
      <Tab.Screen
        name="AdminDashboard"
        component={AdminDashboardScreen}
        options={{
          title: "Dashboard",
          headerRight: () => (
            <IconButton
              icon="logout"
              iconColor="#fff"
              size={24}
              onPress={handleLogout}
              style={{ marginRight: 8 }}
            />
          ),
        }}
      />
      <Tab.Screen
        name="AdminUsers"
        component={AdminUsersScreen}
        options={{ title: "Users" }}
      />
      <Tab.Screen
        name="AdminFlashcards"
        component={AdminFlashcardsScreen}
        options={{ title: "Flashcards" }}
      />
      <Tab.Screen
        name="AdminAiLogs"
        component={AdminAiLogsScreen}
        options={{ title: "AI Logs" }}
      />
    </Tab.Navigator>
  );
};

const AdminNavigator = () => {
  const theme = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.primary,
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}
    >
      <Stack.Screen
        name="AdminTabs"
        component={AdminTabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AdminFlashcardDeck"
        component={AdminFlashcardDeckScreen}
        options={({ route }) => ({
          title: route.params?.title || "Flashcard Deck",
        })}
      />
    </Stack.Navigator>
  );
};

export default AdminNavigator;
