import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';

interface VoiceInputProps {
  onResult: (text: string) => void;
  placeholder?: string;
  language?: string;
  style?: any;
}

const VoiceInput: React.FC<VoiceInputProps> = ({
  onResult,
  placeholder = "Nhấn để nói...",
  language = "vi-VN",
  style,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      setHasPermission(status === 'granted');
      
      if (status !== 'granted') {
        Alert.alert(
          'Quyền truy cập microphone',
          'Ứng dụng cần quyền truy cập microphone để sử dụng tính năng nhập giọng nói.',
          [
            { text: 'Hủy', style: 'cancel' },
            { text: 'Cài đặt', onPress: () => {} },
          ]
        );
      }
    } catch (error) {
      console.error('Error requesting permissions:', error);
      setHasPermission(false);
    }
  };

  const startRecording = async () => {
    if (!hasPermission) {
      await requestPermissions();
      return;
    }

    try {
      setIsRecording(true);
      
      // Configure audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Start recording
      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      setRecording(newRecording);
      
      // Provide haptic feedback
      if (Platform.OS === 'ios') {
        // iOS haptic feedback would go here
      }
      
    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert('Lỗi', 'Không thể bắt đầu ghi âm. Vui lòng thử lại.');
      setIsRecording(false);
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      setIsRecording(false);
      setIsProcessing(true);
      
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      
      if (uri) {
        // In a real app, you would send this audio to a speech-to-text service
        // For demo purposes, we'll simulate the process
        await simulateSpeechToText();
      }
      
      setRecording(null);
    } catch (error) {
      console.error('Failed to stop recording:', error);
      Alert.alert('Lỗi', 'Không thể dừng ghi âm. Vui lòng thử lại.');
    } finally {
      setIsProcessing(false);
    }
  };

  const simulateSpeechToText = async () => {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Demo text based on language
    const demoTexts = {
      'vi-VN': [
        'Đây là một ghi chú mẫu được tạo bằng giọng nói.',
        'Tôi đang học về React Native và Expo.',
        'Flashcard này giúp tôi ghi nhớ kiến thức tốt hơn.',
        'Công nghệ nhận dạng giọng nói rất hữu ích.',
      ],
      'en-US': [
        'This is a sample note created using voice input.',
        'I am learning about React Native and Expo.',
        'This flashcard helps me remember knowledge better.',
        'Speech recognition technology is very useful.',
      ],
    };
    
    const texts = demoTexts[language as keyof typeof demoTexts] || demoTexts['vi-VN'];
    const randomText = texts[Math.floor(Math.random() * texts.length)];
    
    onResult(randomText);
  };

  const handlePress = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const getButtonColor = () => {
    if (isProcessing) return '#FF9800';
    if (isRecording) return '#F44336';
    return '#2196F3';
  };

  const getButtonIcon = () => {
    if (isProcessing) return 'hourglass-outline';
    if (isRecording) return 'stop';
    return 'mic';
  };

  const getButtonText = () => {
    if (isProcessing) return 'Đang xử lý...';
    if (isRecording) return 'Nhấn để dừng';
    return placeholder;
  };

  if (hasPermission === false) {
    return (
      <View style={[styles.container, styles.disabledContainer, style]}>
        <Ionicons name="mic-off" size={24} color="#999" />
        <Text style={styles.disabledText}>
          Cần quyền truy cập microphone
        </Text>
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: getButtonColor() },
        isRecording && styles.recordingContainer,
        style,
      ]}
      onPress={handlePress}
      disabled={isProcessing}
      activeOpacity={0.8}
    >
      <Ionicons 
        name={getButtonIcon()} 
        size={24} 
        color="white" 
      />
      <Text style={styles.buttonText}>
        {getButtonText()}
      </Text>
      
      {isRecording && (
        <View style={styles.recordingIndicator}>
          <View style={styles.recordingDot} />
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    minHeight: 50,
    gap: 8,
  },
  recordingContainer: {
    shadowColor: '#F44336',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  disabledContainer: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  disabledText: {
    color: '#999',
    fontSize: 14,
  },
  recordingIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'white',
    opacity: 0.8,
  },
});

export default VoiceInput;
