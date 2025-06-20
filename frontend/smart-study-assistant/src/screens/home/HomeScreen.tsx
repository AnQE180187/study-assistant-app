import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Text, ProgressBar, Button } from 'react-native-paper';

const HomeScreen: React.FC = () => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Chào mừng bạn trở lại!</Text>
      <Card style={styles.card}>
        <Card.Title title="Kế hoạch học hôm nay" />
        <Card.Content>
          <Text>Toán: 2h - 3h</Text>
          <Text>Tiếng Anh: 4h - 5h</Text>
        </Card.Content>
      </Card>
      <Card style={styles.card}>
        <Card.Title title="Tiến độ học tập" />
        <Card.Content>
          <Text>Hoàn thành 3/5 nhiệm vụ hôm nay</Text>
          <ProgressBar progress={0.6} color="#4F8EF7" style={{ marginTop: 8 }} />
        </Card.Content>
      </Card>
      <Card style={styles.card}>
        <Card.Title title="Gợi ý từ AI" />
        <Card.Content>
          <Text>Hãy ôn lại flashcards Tiếng Anh để củng cố từ vựng!</Text>
        </Card.Content>
        <Card.Actions>
          <Button mode="contained" onPress={() => {}}>Ôn ngay</Button>
        </Card.Actions>
      </Card>
    </ScrollView>
  );
};
  
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6FA',
    padding: 16,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  card: {
    marginBottom: 16,
  },
});

export default HomeScreen;