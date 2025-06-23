import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Modal } from 'react-native';
import { COLORS, SIZES } from '../constants/themes';
import { Ionicons } from '@expo/vector-icons';

type Field = { label: string; value: string; onChange: (v: string) => void; multiline?: boolean };

type Props = {
  visible: boolean;
  type: 'add' | 'edit' | 'delete';
  title: string;
  fields?: Field[];
  onSubmit: () => void;
  onCancel: () => void;
};

const ModalCard: React.FC<Props> = ({ visible, type, title, fields = [], onSubmit, onCancel }) => {
  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Ionicons
              name={type === 'add' ? 'add-circle' : type === 'edit' ? 'create' : 'trash'}
              size={32}
              color={type === 'delete' ? COLORS.error : COLORS.primary}
              style={{ marginBottom: 8 }}
            />
            <Text style={styles.title}>{title}</Text>
          </View>
          {type !== 'delete' && fields.map((f, i) => (
            <View key={i} style={styles.fieldWrap}>
              <Text style={styles.label}>{f.label}</Text>
              <TextInput
                style={[styles.input, f.multiline && styles.inputMultiline]}
                value={f.value}
                onChangeText={f.onChange}
                multiline={f.multiline}
              />
            </View>
          ))}
          {type === 'delete' && (
            <Text style={styles.deleteText}>Bạn có chắc chắn muốn xóa không?</Text>
          )}
          <View style={styles.btnRow}>
            <TouchableOpacity style={[styles.btn, styles.cancelBtn]} onPress={onCancel}>
              <Text style={[styles.btnText, styles.cancelText]}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, type === 'delete' ? styles.deleteBtn : styles.submitBtn]} onPress={onSubmit}>
              <Text style={styles.btnText}>{type === 'delete' ? 'Xác nhận' : 'Lưu'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '90%',
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius,
    padding: 24,
    ...{
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 2,
    },
  },
  header: {
    alignItems: 'center',
    marginBottom: 18,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  fieldWrap: {
    marginBottom: 14,
  },
  label: {
    color: COLORS.text,
    fontSize: 15,
    marginBottom: 4,
  },
  input: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  inputMultiline: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  deleteText: {
    color: COLORS.error,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  btnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  btn: {
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 22,
    marginLeft: 10,
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
  },
  deleteBtn: {
    backgroundColor: COLORS.error,
  },
  cancelBtn: {
    backgroundColor: COLORS.primaryLight,
  },
  btnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  cancelText: {
    color: COLORS.primary,
  },
});

export default ModalCard; 