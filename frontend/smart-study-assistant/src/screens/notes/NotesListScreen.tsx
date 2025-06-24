import React from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';

const notes = [
  {
    title: 'Biology Lecture Notes',
    desc: 'Summary of photosynthesis process.',
    edited: 'Edited yesterday',
  },
  {
    title: 'History Essay',
    desc: 'Introduction and thesis statement.',
    edited: 'Edited yesterday',
  },
  {
    title: 'Project Ideas',
    desc: 'Ideas for the upcoming presentation.',
    edited: 'Edited on Sunday',
  },
  {
    title: 'Meeting Notes',
    desc: 'Discussed the quarterly results.',
    edited: 'Edited on April 19',
  },
];

export default function NotesScreen() {
  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: '#fff' }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Text style={{ fontSize: 28, fontWeight: 'bold' }}>Notes</Text>
        <TouchableOpacity style={{ backgroundColor: '#2563eb', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 18 }}>
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>+ New note</Text>
        </TouchableOpacity>
      </View>
      {notes.map((note, idx) => (
        <View key={idx} style={{ backgroundColor: '#f8fafc', borderRadius: 12, padding: 16, marginBottom: 14 }}>
          <Text style={{ fontWeight: 'bold', fontSize: 18 }}>{note.title}</Text>
          <Text style={{ color: '#64748b', fontSize: 15, marginVertical: 2 }}>{note.desc}</Text>
          <Text style={{ color: '#64748b', fontSize: 14 }}>{note.edited}</Text>
        </View>
      ))}
    </View>
  );
}