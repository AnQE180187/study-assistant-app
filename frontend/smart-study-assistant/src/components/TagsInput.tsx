import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "../contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { getTagSuggestions } from "../services/notesService";

interface TagsInputProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  style?: any;
}

const TagsInput: React.FC<TagsInputProps> = ({ tags, onTagsChange, style }) => {
  const { t } = useTranslation();
  const { currentTheme } = useTheme();
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    loadSuggestions();
  }, []);

  const loadSuggestions = async () => {
    try {
      const apiSuggestions = await getTagSuggestions();
      setSuggestions(apiSuggestions);
    } catch (error) {
      // Fallback to predefined tags if API fails
      const fallbackTags = [
        t("notes.tags.important"),
        t("notes.tags.urgent"),
        t("notes.tags.todo"),
        t("notes.tags.idea"),
        t("notes.tags.reminder"),
        t("notes.tags.study"),
        t("notes.tags.work"),
        t("notes.tags.personal"),
      ];
      setSuggestions(fallbackTags);
    }
  };

  const addTag = () => {
    const trimmedValue = inputValue.trim();
    if (trimmedValue && !tags.includes(trimmedValue)) {
      onTagsChange([...tags, trimmedValue]);
      setInputValue("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    onTagsChange(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyPress = (key: string) => {
    if (key === "Enter" || key === ",") {
      addTag();
    }
  };

  const toggleTag = (tag: string) => {
    if (tags.includes(tag)) {
      removeTag(tag);
    } else {
      onTagsChange([...tags, tag]);
    }
  };

  return (
    <View style={[styles.container, style]}>
      <Text style={[styles.label, { color: currentTheme.colors.text }]}>
        {t("notes.tags.label")}
      </Text>

      {/* Input Row */}
      <View style={styles.inputRow}>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: currentTheme.colors.surface,
              borderColor: currentTheme.colors.outline,
              color: currentTheme.colors.text,
            },
          ]}
          value={inputValue}
          onChangeText={setInputValue}
          placeholder={t("notes.tags.placeholder")}
          placeholderTextColor={currentTheme.colors.onSurfaceVariant}
          onSubmitEditing={addTag}
          returnKeyType="done"
        />
        <TouchableOpacity
          style={[
            styles.addButton,
            { backgroundColor: currentTheme.colors.primary },
          ]}
          onPress={addTag}
        >
          <Ionicons name="add" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Predefined Tags */}
      <Text
        style={[
          styles.sectionLabel,
          { color: currentTheme.colors.onSurfaceVariant },
        ]}
      >
        {t("notes.tags.suggestions")}
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.predefinedTags}
      >
        {suggestions.map((tag) => (
          <TouchableOpacity
            key={tag}
            style={[
              styles.predefinedTag,
              {
                backgroundColor: tags.includes(tag)
                  ? currentTheme.colors.primary + "20"
                  : currentTheme.colors.surface,
                borderColor: tags.includes(tag)
                  ? currentTheme.colors.primary
                  : currentTheme.colors.outline,
              },
            ]}
            onPress={() => toggleTag(tag)}
          >
            <Text
              style={[
                styles.predefinedTagText,
                {
                  color: tags.includes(tag)
                    ? currentTheme.colors.primary
                    : currentTheme.colors.text,
                },
              ]}
            >
              {tag}
            </Text>
            {tags.includes(tag) && (
              <Ionicons
                name="checkmark"
                size={14}
                color={currentTheme.colors.primary}
                style={styles.checkIcon}
              />
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Selected Tags */}
      {tags.length > 0 && (
        <>
          <Text
            style={[
              styles.sectionLabel,
              { color: currentTheme.colors.onSurfaceVariant },
            ]}
          >
            {t("notes.tags.selected")} ({tags.length})
          </Text>
          <View style={styles.selectedTags}>
            {tags.map((tag) => (
              <View
                key={tag}
                style={[
                  styles.selectedTag,
                  { backgroundColor: currentTheme.colors.primary + "20" },
                ]}
              >
                <Text
                  style={[
                    styles.selectedTagText,
                    { color: currentTheme.colors.primary },
                  ]}
                >
                  {tag}
                </Text>
                <TouchableOpacity
                  onPress={() => removeTag(tag)}
                  style={styles.removeButton}
                >
                  <Ionicons
                    name="close"
                    size={14}
                    color={currentTheme.colors.primary}
                  />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
  },
  label: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    marginRight: 8,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 6,
    textTransform: "uppercase",
  },
  predefinedTags: {
    marginBottom: 12,
  },
  predefinedTag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 8,
  },
  predefinedTagText: {
    fontSize: 12,
  },
  checkIcon: {
    marginLeft: 4,
  },
  selectedTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  selectedTag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  selectedTagText: {
    fontSize: 12,
    fontWeight: "500",
  },
  removeButton: {
    marginLeft: 6,
    padding: 2,
  },
});

export default TagsInput;
