import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import OTPInput from '../../components/OTPInput';
import { useTranslation } from 'react-i18next';

const OTPDemo: React.FC = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const handleOTPComplete = (otp: string) => {
    console.log('OTP Completed:', otp);
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        'Success!', 
        `OTP ${otp} verified successfully!`,
        [{ text: 'OK' }]
      );
    }, 5000);
  };

  const handleResendOTP = () => {
    console.log('Resending OTP...');
    Alert.alert(
      'OTP Sent!', 
      'A new OTP has been sent to your email.',
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#667eea" />
      
      {/* Header */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.headerTitle}>OTP Verification Demo</Text>
        <Text style={styles.headerSubtitle}>
          Test the beautiful OTP input component
        </Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Demo Info */}
        <View style={styles.demoInfo}>
          <Text style={styles.demoTitle}>Demo Information</Text>
          <Text style={styles.demoText}>
            • Enter any 6-digit code{'\n'}
            • Auto-verification when complete{'\n'}
            • 5-minute countdown timer{'\n'}
            • Resend functionality{'\n'}
            • Shake animation on clear{'\n'}
            • Multi-language support
          </Text>
        </View>

        {/* Sample OTP Display */}
        <View style={styles.sampleOtp}>
          <Text style={styles.sampleTitle}>Sample OTP Code:</Text>
          <View style={styles.otpCodeContainer}>
            <Text style={styles.otpCode}>607569</Text>
          </View>
          <Text style={styles.sampleNote}>
            Try entering this code or any 6-digit number
          </Text>
        </View>

        {/* OTP Input Component */}
        <View style={styles.otpSection}>
          <OTPInput
            length={6}
            onComplete={handleOTPComplete}
            onResend={handleResendOTP}
            email="user@example.com"
            loading={loading}
            countdown={300} // 5 minutes
          />
        </View>

        {/* Features List */}
        <View style={styles.features}>
          <Text style={styles.featuresTitle}>✨ Features</Text>
          
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>🎨</Text>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Beautiful Design</Text>
              <Text style={styles.featureDesc}>Modern gradient design with smooth animations</Text>
            </View>
          </View>

          <View style={styles.feature}>
            <Text style={styles.featureIcon}>⏱️</Text>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Smart Timer</Text>
              <Text style={styles.featureDesc}>5-minute countdown with color-coded urgency</Text>
            </View>
          </View>

          <View style={styles.feature}>
            <Text style={styles.featureIcon}>🔄</Text>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Auto Actions</Text>
              <Text style={styles.featureDesc}>Auto-focus, auto-verify, and resend functionality</Text>
            </View>
          </View>

          <View style={styles.feature}>
            <Text style={styles.featureIcon}>🌍</Text>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Multi-language</Text>
              <Text style={styles.featureDesc}>Supports Vietnamese and English</Text>
            </View>
          </View>

          <View style={styles.feature}>
            <Text style={styles.featureIcon}>📱</Text>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Mobile Optimized</Text>
              <Text style={styles.featureDesc}>Perfect for mobile devices with haptic feedback</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  demoInfo: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  demoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  demoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  sampleOtp: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sampleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  otpCodeContainer: {
    backgroundColor: '#F0F8FF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#667eea',
    marginBottom: 8,
  },
  otpCode: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#667eea',
    letterSpacing: 4,
  },
  sampleNote: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  otpSection: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  features: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 12,
    marginTop: 2,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default OTPDemo;
