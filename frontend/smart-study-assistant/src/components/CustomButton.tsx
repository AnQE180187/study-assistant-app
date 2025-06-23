import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { COLORS, SIZES, FONTS, SHADOW } from '../constants/themes';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  title: string;
  onPress: () => void;
  type?: 'primary' | 'secondary';
  icon?: string;
};

const CustomButton: React.FC<Props> = ({ title, onPress, type = 'primary', icon }) => {
  return (
    <TouchableOpacity
      style={[styles.button, type === 'secondary' && styles.secondary]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {icon && (
        <Ionicons name={icon as any} size={20} color={type === 'primary' ? '#fff' : COLORS.primary} style={{ marginRight: 8 }} />
      )}
      <Text style={[styles.text, type === 'secondary' && styles.textSecondary]}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: SIZES.radius,
    marginVertical: 8,
    ...SHADOW,
  },
  secondary: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  text: {
    color: '#fff',
    fontSize: 16,
    fontFamily: FONTS.bold,
  },
  textSecondary: {
    color: COLORS.primary,
  },
});

export default CustomButton; 