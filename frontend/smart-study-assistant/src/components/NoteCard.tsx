import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SIZES, SHADOW } from '../constants/themes';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  title: string;
  tag: string;
  date: string;
  onEdit: () => void;
  onDelete: () => void;
};

const NoteCard: React.FC<Props> = ({ title, tag, date, onEdit, onDelete }) => (
  <View style={styles.card}>
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
      <Ionicons name="document-text-outline" size={20} color={COLORS.primary} style={{ marginRight: 8 }} />
      <Text style={styles.title}>{title}</Text>
      <View style={styles.tag}><Text style={styles.tagText}>{tag}</Text></View>
    </View>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
      <Text style={styles.date}>{date}</Text>
      <View style={{ flexDirection: 'row' }}>
        <TouchableOpacity onPress={onEdit} style={styles.iconBtn}>
          <Ionicons name="create-outline" size={18} color={COLORS.primary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onDelete} style={styles.iconBtn}>
          <Ionicons name="trash-outline" size={18} color={COLORS.error} />
        </TouchableOpacity>
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius,
    padding: SIZES.cardPadding,
    marginVertical: 8,
    ...SHADOW,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    flex: 1,
  },
  tag: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  tagText: {
    color: COLORS.primary,
    fontSize: 13,
  },
  date: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  iconBtn: {
    marginLeft: 12,
  },
});

export default NoteCard; 