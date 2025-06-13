import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Header } from '../../components/Header';
import { Colors } from '../../constants/Colors';

// Static study plan data
const staticStudyPlan = [
  {
    id: '1',
    subject: 'React Native',
    duration: '2 hours',
    time: '09:00 AM',
    completed: false,
  },
  {
    id: '2',
    subject: 'TypeScript',
    duration: '1.5 hours',
    time: '02:00 PM',
    completed: true,
  },
  {
    id: '3',
    subject: 'JavaScript',
    duration: '1 hour',
    time: '04:00 PM',
    completed: false,
  },
];

export default function StudyPlanScreen() {
  return (
    <View style={styles.container}>
      <Header title="Study Plan" />
      <ScrollView style={styles.content}>
        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>+ Add New Task</Text>
        </TouchableOpacity>
        {staticStudyPlan.map((task) => (
          <View key={task.id} style={styles.taskCard}>
            <View style={styles.taskHeader}>
              <Text style={styles.subjectText}>{task.subject}</Text>
              <View
                style={[
                  styles.statusIndicator,
                  task.completed ? styles.completedIndicator : styles.pendingIndicator,
                ]}
              />
            </View>
            <View style={styles.taskDetails}>
              <Text style={styles.detailText}>Duration: {task.duration}</Text>
              <Text style={styles.detailText}>Time: {task.time}</Text>
            </View>
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
  taskCard: {
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
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  subjectText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  completedIndicator: {
    backgroundColor: Colors.success,
  },
  pendingIndicator: {
    backgroundColor: Colors.warning,
  },
  taskDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailText: {
    fontSize: 14,
    color: Colors.gray,
  },
}); 