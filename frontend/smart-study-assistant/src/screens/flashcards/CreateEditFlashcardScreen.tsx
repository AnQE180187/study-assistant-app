import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import colors from "../../constants/colors";
import {
  createFlashcard,
  updateFlashcard,
  Flashcard,
} from "../../services/flashcardService";
import { useTranslation } from "react-i18next";
import VoiceInput from "../../components/VoiceInput";

interface RouteParams {
  noteId?: string;
  flashcard?: Flashcard;
  onCreated?: () => void;
  onUpdate?: () => void;
}

const CreateEditFlashcardScreen: React.FC = () => {
  const { t } = useTranslation();
  const route = useRoute();
  const navigation = useNavigation();
  const { noteId, flashcard, onCreated, onUpdate } =
    route.params as RouteParams;

  const isEditing = !!flashcard;

  const [question, setQuestion] = useState(flashcard?.term || "");
  const [answer, setAnswer] = useState(flashcard?.definition || "");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!question.trim()) {
      Alert.alert(t("flashcards.error"), t("flashcards.enterQuestion"));
      return;
    }
    if (!answer.trim()) {
      Alert.alert(t("flashcards.error"), t("flashcards.enterAnswer"));
      return;
    }

    setLoading(true);
    try {
      if (isEditing) {
        await updateFlashcard(flashcard.id, {
          term: question.trim(),
          definition: answer.trim(),
        });
        Alert.alert(t("flashcards.success"), t("flashcards.editSuccess"));
        onUpdate?.();
      } else {
        if (!noteId) {
          Alert.alert(t("flashcards.error"), t("flashcards.noteIdNotFound"));
          return;
        }
        await createFlashcard(noteId, {
          term: question.trim(),
          definition: answer.trim(),
        });
        Alert.alert(t("flashcards.success"), t("flashcards.addSuccess"));
        onCreated?.();
      }
      navigation.goBack();
    } catch (error) {
      Alert.alert(
        t("flashcards.error"),
        isEditing ? t("flashcards.editError") : t("flashcards.addError")
      );
      console.error("Error saving flashcard:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (question.trim() || answer.trim()) {
      Alert.alert(t("common.cancel"), t("flashcards.cancelConfirm"), [
        { text: t("flashcards.continueEditing"), style: "cancel" },
        { text: t("common.cancel"), onPress: () => navigation.goBack() },
      ]);
    } else {
      navigation.goBack();
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel}>
          <Text style={styles.cancelButton}>{t("common.cancel")}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>
          {isEditing
            ? t("flashcards.editFlashcard")
            : t("flashcards.addFlashcard")}
        </Text>
        <TouchableOpacity
          onPress={handleSave}
          disabled={loading}
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
        >
          <Text
            style={[
              styles.saveButtonText,
              loading && styles.saveButtonTextDisabled,
            ]}
          >
            {loading ? t("common.loading") : t("common.save")}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("flashcards.question")}</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              value={question}
              onChangeText={setQuestion}
              placeholder={t("flashcards.questionPlaceholder")}
              placeholderTextColor="#999"
              multiline
              textAlignVertical="top"
              maxLength={500}
            />
            <Text style={styles.characterCount}>{question.length}/500</Text>
          </View>

          {/* Voice Input for Question */}
          <View style={styles.voiceInputContainer}>
            <VoiceInput
              onResult={(text) => {
                setQuestion((prev) => (prev ? `${prev} ${text}` : text));
              }}
              placeholder="Nhấn để nói câu hỏi"
              language="vi-VN"
              style={styles.voiceInputButton}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("flashcards.answer")}</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              value={answer}
              onChangeText={setAnswer}
              placeholder={t("flashcards.answerPlaceholder")}
              placeholderTextColor="#999"
              multiline
              textAlignVertical="top"
              maxLength={1000}
            />
            <Text style={styles.characterCount}>{answer.length}/1000</Text>
          </View>

          {/* Voice Input for Answer */}
          <View style={styles.voiceInputContainer}>
            <VoiceInput
              onResult={(text) => {
                setAnswer((prev) => (prev ? `${prev} ${text}` : text));
              }}
              placeholder="Nhấn để nói câu trả lời"
              language="vi-VN"
              style={styles.voiceInputButton}
            />
          </View>
        </View>

        {/* Preview */}
        {question.trim() && answer.trim() && (
          <View style={styles.previewSection}>
            <Text style={styles.previewTitle}>{t("flashcards.preview")}</Text>
            <View style={styles.previewCard}>
              <View style={styles.previewFront}>
                <Text style={styles.previewLabel}>
                  {t("flashcards.question")}
                </Text>
                <Text style={styles.previewQuestion}>{question}</Text>
              </View>
              <View style={styles.previewBack}>
                <Text style={styles.previewLabel}>
                  {t("flashcards.answer")}
                </Text>
                <Text style={styles.previewAnswer}>{answer}</Text>
              </View>
            </View>
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  cancelButton: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: "600",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
  },
  saveButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  saveButtonDisabled: {
    backgroundColor: "#E0E0E0",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  saveButtonTextDisabled: {
    color: "#999",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 8,
  },
  inputContainer: {
    position: "relative",
  },
  textInput: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    minHeight: 120,
    maxHeight: 200,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    textAlignVertical: "top",
  },
  characterCount: {
    position: "absolute",
    bottom: 8,
    right: 12,
    fontSize: 12,
    color: "#999",
  },
  previewSection: {
    marginTop: 32,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 16,
    textAlign: "center",
  },
  previewCard: {
    gap: 16,
  },
  previewFront: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 120,
  },
  previewBack: {
    backgroundColor: colors.secondary,
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 120,
  },
  previewLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  previewQuestion: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    textAlign: "center",
    lineHeight: 22,
  },
  previewAnswer: {
    fontSize: 14,
    color: "#333",
    textAlign: "center",
    lineHeight: 20,
  },
  bottomPadding: {
    height: 60,
  },
  voiceInputContainer: {
    marginTop: 12,
    alignItems: "center",
  },
  voiceInputButton: {
    minWidth: 200,
  },
});

export default CreateEditFlashcardScreen;
