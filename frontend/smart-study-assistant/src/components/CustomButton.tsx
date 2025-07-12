import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { COLORS, SIZES, FONTS, SHADOW } from '../constants/themes';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  title: string;
  onPress: () => void;
  type?: 'primary' | 'secondary';
  icon?: string;
  disabled?: boolean;
  style?: any;
  textStyle?: any;
};

const CustomButton: React.FC<Props> = ({ title, onPress, type = 'primary', icon, disabled, style, textStyle }) => {
  return (
    <TouchableOpacity
      style={[styles.button, type === 'secondary' && styles.secondary, disabled && styles.disabled, style]}
      onPress={disabled ? undefined : onPress}
      activeOpacity={0.8}
      disabled={disabled}
    >
      {icon && (
        <Ionicons name={icon as any} size={20} color={type === 'primary' ? '#fff' : COLORS.primary} style={{ marginRight: 8 }} />
      )}
      <Text style={[styles.text, type === 'secondary' && styles.textSecondary, disabled && styles.textDisabled, textStyle]}>{title}</Text>
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
  disabled: {
    backgroundColor: COLORS.border,
    opacity: 0.7,
  },
  text: {
    color: '#fff',
    fontSize: 16,
    fontFamily: FONTS.bold,
  },
  textSecondary: {
    color: COLORS.primary,
  },
  textDisabled: {
    color: COLORS.textSecondary,
  },
});

export default CustomButton; 