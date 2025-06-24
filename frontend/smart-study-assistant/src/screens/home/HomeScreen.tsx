import React from 'react';
import { View, Text, Button, TouchableOpacity, FlatList } from 'react-native';

const publicFlashcards = [
  { icon: '🧪', title: 'Periodic Table Basics', author: '@khanh', cards: 20 },
  { icon: '📖', title: 'English Vocabulary: Food', author: '@nhat', cards: 15 },
  { icon: '🌍', title: 'World Geography Review', author: '@khoi', cards: 30 },
];

export default function HomeScreen() {
  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: '#fff' }}>
      {/* Today's Progress */}
      <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 10 }}>Today's Progress</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
        <Text style={{ fontSize: 16 }}>✔️</Text>
        <Text style={{ marginLeft: 8, fontSize: 16 }}>Progress: 1/4 completed</Text>
      </View>
      <TouchableOpacity style={{ backgroundColor: '#2563eb', borderRadius: 8, padding: 12, marginBottom: 24 }}>
        <Text style={{ color: '#fff', textAlign: 'center', fontWeight: 'bold' }}>🔵 Start Studying</Text>
      </TouchableOpacity>

      {/* Upcoming Study Plan */}
      <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 10 }}>Upcoming Study Plan</Text>
      <View style={{ backgroundColor: '#f1f5f9', borderRadius: 8, padding: 12, marginBottom: 24 }}>
        <Text style={{ fontSize: 16 }}>📘 Biology - Chapter 5 | Tomorrow 2:00 PM</Text>
      </View>

      {/* Public Flashcard Sets */}
      <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 10 }}>Public Flashcard Sets (New)</Text>
      {publicFlashcards.map((item, idx) => (
        <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <Text style={{ fontSize: 20 }}>{item.icon}</Text>
          <Text style={{ marginLeft: 8, fontSize: 16, fontWeight: 'bold' }}>"{item.title}"</Text>
          <Text style={{ marginLeft: 4, fontSize: 14, color: '#64748b' }}>by {item.author} - {item.cards} cards</Text>
        </View>
      ))}
      <TouchableOpacity style={{ marginTop: 8 }}>
        <Text style={{ color: '#2563eb', fontWeight: 'bold' }}>➡️ See more</Text>
      </TouchableOpacity>
    </View>
  );
}