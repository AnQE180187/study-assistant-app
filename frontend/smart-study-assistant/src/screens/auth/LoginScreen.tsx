import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import CustomButton from "../../components/CustomButton";
import { COLORS, SIZES } from "../../constants/themes";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../contexts/AuthContext";
import { useTranslation } from "react-i18next";

const LoginScreen: React.FC = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<any>();
  const { login } = useAuth();

  const handleLogin = async () => {
    setLoading(true);
    try {
      await login(email, password);
      // Điều hướng sang app chính sẽ tự động nhờ context
    } catch (err: any) {
      Alert.alert(
        t("auth.loginFailed"),
        err?.response?.data?.message || t("auth.invalidCredentials")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t("auth.login")}</Text>
      <TextInput
        style={styles.input}
        placeholder={t("auth.email")}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder={t("auth.password")}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <CustomButton
        title={loading ? t("auth.loggingIn") : t("auth.login")}
        onPress={handleLogin}
        disabled={loading}
        style={styles.loginBtn}
        textStyle={styles.loginBtnText}
      />
      <TouchableOpacity
        onPress={() => navigation.navigate("ForgotPassword")}
        style={styles.forgot}
      >
        <Text style={styles.forgotText}>{t("auth.forgotPassword")}</Text>
      </TouchableOpacity>
      <Text style={styles.or}>{t("auth.orLoginWith")}</Text>
      <View style={styles.socialRow}>
        <CustomButton
          title="Google"
          type="secondary"
          icon="logo-google"
          onPress={() => {}}
          style={styles.socialBtn}
          textStyle={styles.socialBtnText}
        />
        <CustomButton
          title="Facebook"
          type="secondary"
          icon="logo-facebook"
          onPress={() => {}}
          style={styles.socialBtn}
          textStyle={styles.socialBtnText}
        />
      </View>
      <View style={styles.bottomRow}>
        <Text style={styles.bottomText}>{t("auth.noAccount")}</Text>
        <TouchableOpacity onPress={() => navigation.navigate("Register")}>
          <Text style={styles.register}>{t("auth.register")}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
    padding: SIZES.padding,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 24,
  },
  input: {
    width: "100%",
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius,
    padding: 16,
    fontSize: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  forgot: {
    alignSelf: "flex-end",
    marginBottom: 10,
  },
  forgotText: {
    color: COLORS.primary,
    fontSize: 14,
  },
  or: {
    color: COLORS.textSecondary,
    marginVertical: 10,
  },
  socialRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 8,
    marginBottom: 8,
    gap: 10,
  },
  socialBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    marginHorizontal: 2,
  },
  socialBtnText: {
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 0.1,
  },
  loginBtn: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 14,
    marginBottom: 10,
    marginTop: 4,
  },
  loginBtnText: {
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 0.2,
  },
  bottomRow: {
    flexDirection: "row",
    marginTop: 24,
  },
  bottomText: {
    color: COLORS.textSecondary,
    marginRight: 6,
  },
  register: {
    color: COLORS.primary,
    fontWeight: "bold",
  },
});

export default LoginScreen;
