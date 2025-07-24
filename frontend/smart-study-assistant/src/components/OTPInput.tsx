import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';

const { width } = Dimensions.get('window');

interface OTPInputProps {
  length?: number;
  onComplete: (otp: string) => void;
  onResend?: () => void;
  email?: string;
  loading?: boolean;
  countdown?: number;
}

const OTPInput: React.FC<OTPInputProps> = ({
  length = 6,
  onComplete,
  onResend,
  email,
  loading = false,
  countdown = 300, // 5 minutes in seconds
}) => {
  const { t } = useTranslation();
  const [otp, setOtp] = useState<string[]>(new Array(length).fill(''));
  const [activeIndex, setActiveIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(countdown);
  const [canResend, setCanResend] = useState(false);
  
  const inputRefs = useRef<TextInput[]>([]);
  const shakeAnimation = useRef(new Animated.Value(0)).current;
  const fadeAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnimation, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    // Countdown timer
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    // Auto focus next input
    if (text && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
      setActiveIndex(index + 1);
    }

    // Check if OTP is complete
    if (newOtp.every(digit => digit !== '')) {
      onComplete(newOtp.join(''));
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      setActiveIndex(index - 1);
    }
  };

  const handleResend = () => {
    if (canResend && onResend) {
      setTimeLeft(countdown);
      setCanResend(false);
      setOtp(new Array(length).fill(''));
      setActiveIndex(0);
      inputRefs.current[0]?.focus();
      onResend();
    }
  };

  const shakeInputs = () => {
    Animated.sequence([
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: -10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const clearOtp = () => {
    setOtp(new Array(length).fill(''));
    setActiveIndex(0);
    inputRefs.current[0]?.focus();
    shakeInputs();
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnimation }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.iconGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <MaterialIcons name="security" size={32} color="white" />
          </LinearGradient>
        </View>
        <Text style={styles.title}>{t('auth.verifyOtp')}</Text>
        <Text style={styles.subtitle}>
          {t('auth.otpSentTo')} {email}
        </Text>
      </View>

      {/* OTP Input Fields */}
      <Animated.View 
        style={[
          styles.otpContainer,
          { transform: [{ translateX: shakeAnimation }] }
        ]}
      >
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => {
              if (ref) inputRefs.current[index] = ref;
            }}
            style={[
              styles.otpInput,
              activeIndex === index && styles.activeInput,
              digit && styles.filledInput,
            ]}
            value={digit}
            onChangeText={(text) => handleChange(text.slice(-1), index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            onFocus={() => setActiveIndex(index)}
            keyboardType="numeric"
            maxLength={1}
            selectTextOnFocus
            editable={!loading}
          />
        ))}
      </Animated.View>

      {/* Timer and Actions */}
      <View style={styles.timerContainer}>
        <View style={styles.timerBox}>
          <MaterialIcons 
            name="timer" 
            size={20} 
            color={timeLeft > 60 ? "#4CAF50" : "#FF5722"} 
          />
          <Text style={[
            styles.timerText,
            { color: timeLeft > 60 ? "#4CAF50" : "#FF5722" }
          ]}>
            {formatTime(timeLeft)}
          </Text>
        </View>
        
        <TouchableOpacity
          style={[styles.clearButton]}
          onPress={clearOtp}
          disabled={loading}
        >
          <MaterialIcons name="clear" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Resend Button */}
      <TouchableOpacity
        style={[
          styles.resendButton,
          canResend && styles.resendButtonActive,
          loading && styles.resendButtonDisabled,
        ]}
        onPress={handleResend}
        disabled={!canResend || loading}
      >
        <MaterialIcons 
          name="refresh" 
          size={20} 
          color={canResend ? "#667eea" : "#ccc"} 
        />
        <Text style={[
          styles.resendText,
          canResend && styles.resendTextActive,
        ]}>
          {canResend ? t('auth.resendOtp') : t('auth.resendIn')}
        </Text>
      </TouchableOpacity>

      {/* Info */}
      <View style={styles.infoContainer}>
        <MaterialIcons name="info-outline" size={16} color="#999" />
        <Text style={styles.infoText}>
          {t('auth.otpValidFor5Minutes')}
        </Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  iconContainer: {
    marginBottom: 16,
  },
  iconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  otpInput: {
    width: 50,
    height: 60,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    backgroundColor: '#FAFAFA',
    marginHorizontal: 4,
  },
  activeInput: {
    borderColor: '#667eea',
    backgroundColor: '#F8F9FF',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  filledInput: {
    borderColor: '#4CAF50',
    backgroundColor: '#F0F8FF',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: width - 80,
    marginBottom: 20,
  },
  timerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  timerText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  clearButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    backgroundColor: '#F5F5F5',
    marginBottom: 20,
  },
  resendButtonActive: {
    backgroundColor: '#F8F9FF',
    borderWidth: 1,
    borderColor: '#667eea',
  },
  resendButtonDisabled: {
    opacity: 0.5,
  },
  resendText: {
    fontSize: 16,
    color: '#ccc',
    marginLeft: 8,
    fontWeight: '500',
  },
  resendTextActive: {
    color: '#667eea',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#999',
    marginLeft: 8,
    fontStyle: 'italic',
  },
});

export default OTPInput;
