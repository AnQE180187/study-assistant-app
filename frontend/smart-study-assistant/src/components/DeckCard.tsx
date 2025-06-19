import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import colors from "../constants/colors";

interface DeckCardProps {
  title: string;
  category: string;
  totalCards: number;
  onPress: () => void;
  onPractice: () => void;
}

const DeckCard: React.FC<DeckCardProps> = ({
  title,
  category,
  totalCards,
  onPress,
  onPractice,
}) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.cardCount}>{totalCards} cards</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFE0B2", // Light orange color like in design
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: 8,
    lineHeight: 24,
  },
  cardCount: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
});

export default DeckCard;
