import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SIZES, SHADOW } from '../constants/themes';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  name: string;
  count: number;
  isPublic: boolean;
  onPress: () => void;
};

const DeckCard: React.FC<Props> = ({ name, count, isPublic, onPress }) => (
  <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
      <Ionicons name="albums-outline" size={24} color={COLORS.primary} style={{ marginRight: 8 }} />
      <Text style={styles.name}>{name}</Text>
      {isPublic && (
        <Ionicons name="earth" size={18} color={COLORS.secondary} style={{ marginLeft: 6 }} />
      )}
    </View>
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
