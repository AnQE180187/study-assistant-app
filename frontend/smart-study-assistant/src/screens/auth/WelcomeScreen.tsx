import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  Animated,
  StatusBar,
  TouchableOpacity,
} from "react-native";
import CustomButton from "../../components/CustomButton";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS, SIZES } from "../../constants/themes";
import { MaterialIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import LanguageSelector from "../../components/LanguageSelector";

const WelcomeScreen = ({ navigation }: any) => {
  const { t } = useTranslation();

  return (
    <LinearGradient
      colors={[COLORS.primaryLight, COLORS.primary]}
      style={styles.container}
    >
      {/* Language Selector */}
      <View style={styles.languageContainer}>
        <LanguageSelector compact={true} showLabel={false} />
      </View>

      <View style={styles.logoWrap}>
        {/* <Image source={require('../../assets/icon.png')} style={styles.logo} /> */}
        <Text style={styles.slogan}>{t("app.name")}</Text>
        <Text style={styles.desc}>{t("app.tagline")}</Text>
      </View>
      <View style={styles.btnWrap}>
        <CustomButton
          title={t("auth.login")}
          onPress={() => navigation.navigate("Login")}
          style={styles.buttonLogin}
          textStyle={styles.buttonLoginText}
        />
        <CustomButton
          title={t("auth.register")}
          type="secondary"
          onPress={() => navigation.navigate("Register")}
          style={styles.buttonRegister}
          textStyle={styles.buttonRegisterText}
        />
        {/* <Text style={styles.or}>Hoặc đăng nhập bằng</Text>
        <View style={styles.socialRow}>
          <CustomButton title="Google" type="secondary" icon="logo-google" onPress={() => { }} />
          <CustomButton title="Facebook" type="secondary" icon="logo-facebook" onPress={() => { }} />
        </View> */}
      </View>
    </LinearGradient>
  );
};
//.
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  languageContainer: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 1,
  },
  logoWrap: {
    alignItems: "center",
    marginBottom: 40,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 16,
  },
  slogan: {
    fontSize: 26,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 8,
  },
  desc: {
    color: COLORS.textSecondary,
    fontSize: 15,
    marginBottom: 12,
  },
  btnWrap: {
    width: "90%",
    alignItems: "center",
    marginTop: 24,
  },
  buttonLogin: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    paddingHorizontal: 36,
    borderRadius: 18,
    marginBottom: 18,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    width: 200,
  },
  buttonLoginText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
    letterSpacing: 0.2,
  },
  buttonRegister: {
    backgroundColor: "#fff",
    paddingVertical: 16,
    paddingHorizontal: 36,
    borderRadius: 18,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    marginBottom: 8,
    width: 200,
  },
  buttonRegisterText: {
    color: COLORS.primary,
    fontWeight: "bold",
    fontSize: 18,
    letterSpacing: 0.2,
  },
  or: {
    color: COLORS.textSecondary,
    marginVertical: 10,
  },
  socialRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
});

export default WelcomeScreen;
