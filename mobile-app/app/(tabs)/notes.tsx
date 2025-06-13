import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Header } from '../../components/Header';
import { Colors } from '../../constants/Colors';

// Static notes data
const staticNotes = [
  {
    id: '1',
    title: 'React Native Basics',
    content: 'React Native is a framework for building native apps using React.',
    date: '2024-03-20',
  },
  {
    id: '2',
    title: 'TypeScript Tips',
    content: 'TypeScript adds static typing to JavaScript.',
    date: '2024-03-19',
  },
];

export default function NotesScreen() {
  return (
    <View style={styles.container}>
      <Header title="Notes" />
      <ScrollView style={styles.content}>
        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>+ Add New Note</Text>
        </TouchableOpacity>
        {staticNotes.map((note) => (
          <View key={note.id} style={styles.noteCard}>
            <Text style={styles.noteTitle}>{note.title}</Text>
            <Text style={styles.noteContent} numberOfLines={2}>
              {note.content}
            </Text>
            <Text style={styles.noteDate}>{note.date}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  addButton: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  addButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  noteCard: {
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  noteTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  noteContent: {
    fontSize: 14,
    color: Colors.gray,
    marginBottom: 8,
  },
  noteDate: {
    fontSize: 12,
    color: Colors.gray,
  },
}); 