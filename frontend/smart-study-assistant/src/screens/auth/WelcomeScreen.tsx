import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { CompositeNavigationProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

type RootStackParamList = {
  Auth: undefined;
  App: undefined;
};

type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
};

// Composite navigation type that includes both root and auth navigation
type NavigationProp = CompositeNavigationProp<
  StackNavigationProp<AuthStackParamList, "Welcome">,
  StackNavigationProp<RootStackParamList>
>;

const WelcomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  const handleFlashcardPress = () => {
    // Navigate to the main app (which will show the Flashcards tab)
    navigation.navigate("App");
  };

  const handleLoginPress = () => {
    navigation.navigate("Login");
  };

  const handleRegisterPress = () => {
    navigation.navigate("Register");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chào mừng đến với Smart Study Assistant!</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.flashcardButton}
          onPress={handleFlashcardPress}
        >
          <Text style={styles.flashcardButtonText}>🗂️ Test Flashcards</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.loginButton} onPress={handleLoginPress}>
          <Text style={styles.loginButtonText}>Đăng nhập</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.registerButton}
          onPress={handleRegisterPress}
        >
          <Text style={styles.registerButtonText}>Đăng ký</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F5F6FA",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 40,
    color: "#333",
  },
  buttonContainer: {
    width: "100%",
    maxWidth: 300,
    gap: 16,
  },
  flashcardButton: {
    backgroundColor: "#FFA726",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  flashcardButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  loginButton: {
    backgroundColor: "#2196F3",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  registerButton: {
    backgroundColor: "transparent",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#2196F3",
  },
  registerButtonText: {
    color: "#2196F3",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default WelcomeScreen;
