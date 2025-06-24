import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface NoteCardProps {
  title: string;
  tag: string;
  date: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

const NoteCard: React.FC<NoteCardProps> = ({ title, tag, date, onEdit, onDelete }) => (
  <View style={styles.card}>
    <View style={styles.header}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.actions}>
        {onEdit && (
          <TouchableOpacity onPress={onEdit} style={styles.iconBtn}>
            <Ionicons name="create-outline" size={18} color="#4B7BEC" />
          </TouchableOpacity>
        )}
        {onDelete && (
          <TouchableOpacity onPress={onDelete} style={styles.iconBtn}>
            <Ionicons name="trash-outline" size={18} color="#FF5252" />
          </TouchableOpacity>
        )}
      </View>
    </View>
    <View style={styles.infoRow}>
      <Text style={styles.tag}>{tag}</Text>
      <Text style={styles.date}>{date}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
    flex: 1,
    marginRight: 8,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    marginLeft: 8,
    padding: 4,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  tag: {
    fontSize: 13,
    color: '#4B7BEC',
    backgroundColor: '#e6edfb',
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 8,
    overflow: 'hidden',
  },
  date: {
    fontSize: 13,
    color: '#888',
  },
});

export default NoteCard;