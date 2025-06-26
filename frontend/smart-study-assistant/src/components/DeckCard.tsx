import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SIZES, SHADOW } from '../constants/themes';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  name: string;
  count: number;
  isPublic: boolean;
  onPress: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  description?: string;
  tags?: string[];
};

const DeckCard: React.FC<Props> = ({ name, count, isPublic, onPress, onEdit, onDelete, description, tags }) => (
  <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
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
    <TouchableOpacity style={styles.studyBtn} onPress={onPress}>
      <Text style={styles.studyText}>Vào học</Text>
      <Ionicons name="arrow-forward" size={18} color="#fff" style={{ marginLeft: 4 }} />
    </TouchableOpacity>
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
  studyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 999,
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  studyText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
});
//.
export default DeckCard;
