import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

interface Flashcard {
  id: string;
  question: string;
  answer: string;
}

type FlashcardStackParamList = {
  FlashcardManagement: { noteId: string; title: string };
  CreateFlashcard: { noteId?: string; onCreated?: () => void };
};

type NavigationProp = StackNavigationProp<
  FlashcardStackParamList,
  "FlashcardManagement"
>;
type RouteProps = RouteProp<FlashcardStackParamList, "FlashcardManagement">;

const FlashcardManagementScreen: React.FC = () => {
  const route = useRoute<RouteProps>();
  const navigation = useNavigation<NavigationProp>();
  const { noteId, title } = route.params;

  const [flashcards, setFlashcards] = useState<Flashcard[]>([
    {
      id: "1",
      question: "What is React Native?",
      answer: "A framework for building mobile apps",
    },
    {
      id: "2",
      question: "What is TypeScript?",
      answer: "A typed superset of JavaScript",
    },
  ]);

  const handleAddFlashcard = () => {
    navigation.navigate("CreateFlashcard", {
      noteId,
      onCreated: () => {
        // Refresh flashcards after creation
        loadFlashcards();
      },
    });
  };

  const loadFlashcards = () => {
    // TODO: Load flashcards from service
    console.log("Loading flashcards for noteId:", noteId);
  };

  const handleFlashcardPress = (flashcard: Flashcard) => {
    // TODO: Navigate to edit flashcard screen
    Alert.alert("Edit Flashcard", `Edit: ${flashcard.question}`);
  };

  const renderFlashcard = ({ item }: { item: Flashcard }) => (
    <TouchableOpacity
      style={styles.flashcardItem}
      onPress={() => handleFlashcardPress(item)}
    >
      <Text style={styles.flashcardText} numberOfLines={2}>
        {item.question}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
      </View>

      {/* Add Flashcard Button */}
      <TouchableOpacity style={styles.addButton} onPress={handleAddFlashcard}>
        <Text style={styles.addButtonText}>ADD FLASHCARD</Text>
      </TouchableOpacity>

      {/* Flashcards List */}
      <FlatList
        data={flashcards}
        renderItem={renderFlashcard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginLeft: 16,
  },
  addButton: {
    backgroundColor: "#333",
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: "center",
    marginBottom: 20,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  listContainer: {
    paddingHorizontal: 20,
  },
  flashcardItem: {
    backgroundColor: "#FFE082", // Yellow color like in design
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 16,
    minHeight: 80,
    justifyContent: "center",
  },
  flashcardText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
    textAlign: "center",
  },
});

export default FlashcardManagementScreen;
