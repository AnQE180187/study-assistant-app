import React, { useState } from "react";
import { View, StyleSheet, Alert, ScrollView, Platform } from "react-native";
import {
  TextInput,
  Button,
  Text,
  Divider,
  Menu,
  TouchableRipple,
} from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useTranslation } from "react-i18next";
import i18n from "../../services/i18n";
import OTPInput from "../../components/OTPInput";
import * as authService from "../../services/authService";

const RegisterScreen: React.FC = () => {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [education, setEducation] = useState("");
  const [gender, setGender] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"register" | "verify">("register");
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const educationOptions = [
    { label: t("auth.selectEducation"), value: "" },
    { label: t("auth.elementary"), value: "ELEMENTARY" },
    { label: t("auth.middleSchool"), value: "MIDDLE_SCHOOL" },
    { label: t("auth.highSchool"), value: "HIGH_SCHOOL" },
    { label: t("auth.university"), value: "UNIVERSITY" },
    { label: t("auth.graduate"), value: "GRADUATE" },
    { label: t("auth.other"), value: "OTHER" },
  ];

  const genderOptions = [
    { label: t("auth.selectGender"), value: "" },
    { label: t("auth.male"), value: "male" },
    { label: t("auth.female"), value: "female" },
    { label: t("auth.other"), value: "other" },
  ];

  const handleSendOtp = async () => {
    if (!name || !email || !password) {
      Alert.alert(t("common.error"), t("auth.fillRequiredFields"));
      return;
    }
    console.log("Sending OTP with data:", {
      name,
      email,
      password,
      education,
      gender,
      dateOfBirth,
    });
    setLoading(true);
    try {
      console.log("Attempting to send OTP to:", email);
      const result = await authService.sendOtp(email, true); // Force real API
      console.log("OTP send result:", result);
      setStep("verify");
      Alert.alert(t("common.success"), t("auth.otpSent"));
    } catch (err: any) {
      console.error("OTP send error:", err);

      let errorMessage = t("common.errorOccurred");

      if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err?.message) {
        errorMessage = err.message;
      } else if (err?.code === "NETWORK_ERROR") {
        errorMessage = "Network error. Please check your connection.";
      }

      Alert.alert(t("auth.otpSendFailed"), errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!otp || otp.trim().length === 0) {
      Alert.alert(t("common.error"), t("auth.enterOtp"));
      return;
    }
    if (otp.trim().length !== 6) {
      Alert.alert(t("common.error"), t("auth.otpLength"));
      return;
    }
    await handleVerifyWithOtp(otp);
  };

  const handleVerifyWithOtp = async (otpCode: string) => {
    setLoading(true);
    try {
      // Prepare registration data - send all fields directly
      const registrationData = {
        email: email.trim(),
        otp: otpCode.trim(),
        password: password.trim(),
        name: name.trim(),
        ...(education && { education }),
        ...(gender && { gender }),
        ...(dateOfBirth && { dateOfBirth: dateOfBirth.toISOString() }),
      };

      console.log("Registration data:", registrationData);

      // Call the updated service method with the complete data object
      await authService.verifyOtpAndRegister(registrationData);
      Alert.alert(t("common.success"), t("auth.registerSuccess"));
      navigation.navigate("Login");
    } catch (err: any) {
      console.error("Registration error:", err);
      Alert.alert(
        t("auth.otpVerifyFailed"),
        err?.response?.data?.message || t("common.errorOccurred")
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setDateOfBirth(selectedDate);
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return t("auth.selectDate");
    return date.toLocaleDateString(i18n.language === "vi" ? "vi-VN" : "en-US");
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <Text style={styles.header}>{t("auth.register")}</Text>

      {step === "register" && (
        <>
          <TextInput
            label={`${t("auth.fullName")} *`}
            value={name}
            onChangeText={setName}
            style={styles.input}
            autoCapitalize="words"
          />
          <TextInput
            label={`${t("auth.email")} *`}
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            label={`${t("auth.password")} *`}
            value={password}
            onChangeText={setPassword}
            style={styles.input}
            secureTextEntry
          />

          {/* Education Level Picker */}
          <View style={styles.pickerContainer}>
            <Text style={styles.pickerLabel}>{t("auth.education")}</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={education}
                onValueChange={setEducation}
                style={styles.picker}
              >
                {educationOptions.map((option) => (
                  <Picker.Item
                    key={option.value}
                    label={option.label}
                    value={option.value}
                  />
                ))}
              </Picker>
            </View>
          </View>

          {/* Gender Picker */}
          <View style={styles.pickerContainer}>
            <Text style={styles.pickerLabel}>{t("auth.gender")}</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={gender}
                onValueChange={setGender}
                style={styles.picker}
              >
                {genderOptions.map((option) => (
                  <Picker.Item
                    key={option.value}
                    label={option.label}
                    value={option.value}
                  />
                ))}
              </Picker>
            </View>
          </View>

          {/* Date of Birth */}
          <TouchableRipple
            onPress={() => setShowDatePicker(true)}
            style={styles.dateButton}
          >
            <View style={styles.dateButtonContent}>
              <Text style={styles.dateButtonText}>
                {formatDate(dateOfBirth)}
              </Text>
            </View>
          </TouchableRipple>

          {showDatePicker && (
            <DateTimePicker
              value={dateOfBirth || new Date()}
              mode="date"
              display="default"
              onChange={handleDateChange}
              maximumDate={new Date()}
            />
          )}
        </>
      )}
      {step === "register" && (
        <Button
          mode="contained"
          onPress={handleSendOtp}
          style={styles.button}
          contentStyle={styles.buttonContent}
          labelStyle={styles.buttonLabel}
          loading={loading}
          disabled={loading}
        >
          {t("auth.sendOtp")}
        </Button>
      )}

      {step === "verify" && (
        <OTPInput
          length={6}
          onComplete={(otpCode) => {
            setOtp(otpCode);
            // Auto verify when OTP is complete
            setTimeout(() => {
              if (otpCode.length === 6) {
                handleVerifyWithOtp(otpCode);
              }
            }, 500);
          }}
          onResend={handleSendOtp}
          email={email}
          loading={loading}
          countdown={300} // 5 minutes
        />
      )}
      <Divider style={{ marginVertical: 16 }} />
      <Button
        icon="google"
        mode="outlined"
        onPress={() => {}}
        style={styles.social}
        contentStyle={styles.socialContent}
        labelStyle={styles.socialLabel}
        disabled={step === "verify"}
      >
        {t("auth.registerWithGoogle")}
      </Button>
      <Button
        icon="facebook"
        mode="outlined"
        onPress={() => {}}
        style={styles.social}
        contentStyle={styles.socialContent}
        labelStyle={styles.socialLabel}
        disabled={step === "verify"}
      >
        {t("auth.registerWithFacebook")}
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F6FA",
  },
  contentContainer: {
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  input: {
    marginBottom: 12,
  },
  pickerContainer: {
    marginBottom: 12,
  },
  pickerLabel: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
    color: "#333",
  },
  pickerWrapper: {
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  picker: {
    height: 50,
  },
  dateButton: {
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 12,
  },
  dateButtonContent: {
    padding: 16,
    justifyContent: "center",
  },
  dateButtonText: {
    fontSize: 16,
    color: "#333",
  },
  otpInfo: {
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
    fontSize: 14,
    color: "#666",
  },
  button: {
    marginTop: 8,
    borderRadius: 14,
    overflow: "hidden",
  },
  buttonContent: {
    paddingVertical: 14,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 0.2,
  },
  social: {
    marginBottom: 8,
    borderRadius: 12,
    overflow: "hidden",
  },
  socialContent: {
    paddingVertical: 12,
  },
  socialLabel: {
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 0.1,
  },
});

export default RegisterScreen;
