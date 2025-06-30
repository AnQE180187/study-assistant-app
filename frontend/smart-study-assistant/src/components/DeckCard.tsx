import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SIZES, SHADOW } from '../constants/themes';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  name: string;
  count: number;
  isPublic: boolean;
  onManage?: () => void;
  onStudy?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  description?: string;
  tags?: string[];
  hideManageBtn?: boolean;
};

const DeckCard: React.FC<Props> = ({ name, count, isPublic, onManage, onStudy, onEdit, onDelete, description, tags, hideManageBtn }) => (
  <TouchableOpacity style={styles.card} onPress={onManage} activeOpacity={0.85}>
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
      <Ionicons name="albums-outline" size={24} color={COLORS.primary} style={{ marginRight: 8 }} />
      <Text style={styles.name}>{name}</Text>
      {isPublic && (
        <Ionicons name="earth" size={18} color={COLORS.secondary} style={{ marginLeft: 6 }} />
      )}
      {onEdit && (
        <TouchableOpacity onPress={onEdit} style={{ marginLeft: 8 }}>
          <Ionicons name="create-outline" size={20} color={COLORS.primary} />
        </TouchableOpacity>
      )}
      {onDelete && (
        <TouchableOpacity onPress={onDelete} style={{ marginLeft: 8 }}>
          <Ionicons name="trash-outline" size={20} color={COLORS.error || 'red'} />
        </TouchableOpacity>
      )}
    </View>
    {description ? <Text style={styles.desc}>{description}</Text> : null}
    {tags && tags.length > 0 && (
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 }}>
        {tags.map((tag, idx) => (
          <View key={idx} style={{ backgroundColor: COLORS.primaryLight, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2, marginRight: 6, marginBottom: 4 }}>
            <Text style={{ color: COLORS.primary, fontSize: 12 }}>{tag}</Text>
          </View>
        ))}
      </View>
    )}
    <Text style={styles.count}>{count} thẻ</Text>
    <View style={styles.buttonRow}>
      {!hideManageBtn && onManage && (
        <TouchableOpacity style={styles.manageBtn} onPress={onManage}>
          <Text style={styles.manageText}>Quản lý</Text>
          <Ionicons name="settings-outline" size={16} color={COLORS.primary} style={{ marginLeft: 4 }} />
        </TouchableOpacity>
      )}
      {onStudy && (
        <TouchableOpacity style={styles.studyBtn} onPress={onStudy}>
          <Text style={styles.studyText}>Vào học</Text>
          <Ionicons name="play" size={16} color="#fff" style={{ marginLeft: 4 }} />
        </TouchableOpacity>
      )}
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius,
    padding: SIZES.cardPadding,
    marginVertical: 8,
    ...SHADOW,
  },
  name: {
    fontSize: 17,
    fontWeight: 'bold',
    color: COLORS.text,
    flex: 1,
  },
  count: {
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  desc: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginBottom: 6,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  manageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  manageText: {
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  studyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  studyText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default DeckCard;
