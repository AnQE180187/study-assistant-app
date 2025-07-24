import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  StatusBar,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../contexts/ThemeContext";
import LanguageSelector from "../../components/LanguageSelector";

const { width, height } = Dimensions.get("window");

const WelcomeScreen = ({ navigation }: any) => {
  const { t } = useTranslation();
  const { currentTheme } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <LinearGradient
      colors={
        currentTheme.theme === "dark"
          ? ["#0F172A", "#1E293B", "#334155"]
          : ["#667eea", "#764ba2", "#f093fb"]
      }
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Language Selector */}
      <View style={styles.languageContainer}>
        <LanguageSelector compact={true} showLabel={false} />
      </View>

      {/* Main Content */}
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
          },
        ]}
      >
        {/* Logo Section */}
        <View style={styles.logoSection}>
          <Animated.View
            style={[
              styles.iconContainer,
              {
                transform: [
                  {
                    rotate: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ["0deg", "360deg"],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.iconBackground}>
              <MaterialIcons name="school" size={60} color="white" />
            </View>
          </Animated.View>
          <Text style={styles.appName}>{t("app.name")}</Text>
          <Text style={styles.tagline}>{t("welcome.tagline")}</Text>
        </View>

        {/* Features */}
        <View style={styles.featuresContainer}>
          <View style={styles.feature}>
            <MaterialIcons
              name="psychology"
              size={24}
              color="rgba(255,255,255,0.9)"
            />
            <Text style={styles.featureText}>{t("welcome.feature1")}</Text>
          </View>
          <View style={styles.feature}>
            <MaterialIcons
              name="trending-up"
              size={24}
              color="rgba(255,255,255,0.9)"
            />
            <Text style={styles.featureText}>{t("welcome.feature2")}</Text>
          </View>
          <View style={styles.feature}>
            <MaterialIcons
              name="groups"
              size={24}
              color="rgba(255,255,255,0.9)"
            />
            <Text style={styles.featureText}>{t("welcome.feature3")}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate("Login")}
          >
            <Text style={styles.primaryButtonText}>{t("auth.login")}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate("Register")}
          >
            <Text style={styles.secondaryButtonText}>{t("auth.register")}</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Bottom Decoration */}
      <View style={styles.bottomDecoration}>
        <View style={styles.decorationCircle1} />
        <View style={styles.decorationCircle2} />
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  languageContainer: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  logoSection: {
    alignItems: "center",
    marginBottom: 60,
  },
  iconContainer: {
    marginBottom: 30,
  },
  iconBackground: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.4)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.4,
    shadowRadius: 25,
    elevation: 15,
  },
  appName: {
    fontSize: 32,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginBottom: 10,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  tagline: {
    fontSize: 18,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    lineHeight: 24,
  },
  featuresContainer: {
    marginBottom: 50,
  },
  feature: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  featureText: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    marginLeft: 15,
    flex: 1,
  },
  buttonContainer: {
    width: "100%",
    alignItems: "center",
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    paddingVertical: 18,
    paddingHorizontal: 50,
    borderRadius: 30,
    marginBottom: 20,
    width: "85%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 10,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  secondaryButton: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.9)",
    paddingVertical: 18,
    paddingHorizontal: 50,
    borderRadius: 30,
    width: "85%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  secondaryButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "white",
  },
  bottomDecoration: {
    position: "absolute",
    bottom: -50,
    left: -50,
    right: -50,
    height: 200,
  },
  decorationCircle1: {
    position: "absolute",
    bottom: -100,
    left: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  decorationCircle2: {
    position: "absolute",
    bottom: -150,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
});

export default WelcomeScreen;
