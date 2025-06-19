import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from "react-native";
import colors from "../constants/colors";

interface FlashcardItemProps {
  question: string;
  answer: string;
  onEdit?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
}

const FlashcardItem: React.FC<FlashcardItemProps> = ({
  question,
  answer,
  onEdit,
  onDelete,
  showActions = false,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [flipAnimation] = useState(new Animated.Value(0));

  const handleFlip = () => {
    Animated.timing(flipAnimation, {
      toValue: isFlipped ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      setIsFlipped(!isFlipped);
    });
  };

  const frontInterpolate = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  const backInterpolate = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ["180deg", "360deg"],
  });

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={handleFlip}
        style={styles.card}
        activeOpacity={0.8}
      >
        <Animated.View
          style={[
            styles.cardFace,
            styles.cardFront,
            { transform: [{ rotateY: frontInterpolate }] },
          ]}
        >
          <Text style={styles.label}>Câu hỏi</Text>
          <Text style={styles.question}>{question}</Text>
          <Text style={styles.tapHint}>Nhấn để xem đáp án</Text>
        </Animated.View>

        <Animated.View
          style={[
            styles.cardFace,
            styles.cardBack,
            { transform: [{ rotateY: backInterpolate }] },
          ]}
        >
          <Text style={styles.label}>Đáp án</Text>
          <Text style={styles.answer}>{answer}</Text>
          <Text style={styles.tapHint}>Nhấn để xem câu hỏi</Text>
        </Animated.View>
      </TouchableOpacity>

      {showActions && (
        <View style={styles.actions}>
          {onEdit && (
            <TouchableOpacity
              style={[styles.actionButton, styles.editButton]}
              onPress={onEdit}
            >
              <Text style={styles.actionText}>Sửa</Text>
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={onDelete}
            >
              <Text style={styles.actionText}>Xóa</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  card: {
    height: 200,
    position: "relative",
  },
  cardFace: {
    position: "absolute",
    width: "100%",
    height: "100%",
    padding: 20,
    borderRadius: 12,
    backgroundColor: colors.card,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
    backfaceVisibility: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  cardFront: {
    backgroundColor: colors.primary,
  },
  cardBack: {
    backgroundColor: colors.secondary,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  question: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    textAlign: "center",
    lineHeight: 24,
    flex: 1,
  },
  answer: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
    lineHeight: 22,
    flex: 1,
  },
  tapHint: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.6)",
    fontStyle: "italic",
    marginTop: 8,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 8,
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: 60,
    alignItems: "center",
  },
  editButton: {
    backgroundColor: colors.primary,
  },
  deleteButton: {
    backgroundColor: colors.error,
  },
  actionText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default FlashcardItem;
