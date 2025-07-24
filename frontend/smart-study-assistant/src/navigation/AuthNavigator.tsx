import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { useTranslation } from "react-i18next";
import WelcomeScreen from "../screens/auth/WelcomeScreenNew";
import LoginScreen from "../screens/auth/LoginScreen";
import RegisterScreen from "../screens/auth/RegisterScreen";
import ForgotPasswordScreen from "../screens/auth/ForgotPasswordScreen";
import VerifyOtpForgotScreen from "../screens/auth/VerifyOtpForgotScreen";
import ResetPasswordScreen from "../screens/auth/ResetPasswordScreen";

const Stack = createStackNavigator();

const AuthNavigator = () => {
  const { t } = useTranslation();

  return (
    <Stack.Navigator
      initialRouteName="Welcome"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
        options={{ title: t("auth.forgotPassword") }}
      />
      <Stack.Screen
        name="VerifyOtpForgot"
        component={VerifyOtpForgotScreen}
        options={{ title: t("auth.verifyOtp") }}
      />
      <Stack.Screen
        name="ResetPassword"
        component={ResetPasswordScreen}
        options={{ title: t("auth.resetPassword") }}
      />
    </Stack.Navigator>
  );
};
//for push
export default AuthNavigator;
