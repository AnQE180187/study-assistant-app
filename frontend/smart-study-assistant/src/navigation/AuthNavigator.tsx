import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import WelcomeScreen from '../screens/auth/WelcomeScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import VerifyOtpForgotScreen from '../screens/auth/VerifyOtpForgotScreen';
import ResetPasswordScreen from '../screens/auth/ResetPasswordScreen';

const Stack = createStackNavigator();

const AuthNavigator = () => (
  <Stack.Navigator initialRouteName="Welcome">
    <Stack.Screen name="Welcome" component={WelcomeScreen} />
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ title: 'Quên mật khẩu' }} />
    <Stack.Screen name="VerifyOtpForgot" component={VerifyOtpForgotScreen} options={{ title: 'Xác thực OTP' }} />
    <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} options={{ title: 'Đặt lại mật khẩu' }} />
  </Stack.Navigator>
);
//for push
export default AuthNavigator; 