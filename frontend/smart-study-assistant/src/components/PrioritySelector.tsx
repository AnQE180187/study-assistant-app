import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "../contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";

interface PrioritySelectorProps {
  selectedPriority?: "low" | "medium" | "high" | "urgent";
  onPriorityChange: (priority: "low" | "medium" | "high" | "urgent") => void;
  style?: any;
}

const PrioritySelector: React.FC<PrioritySelectorProps> = ({
  selectedPriority = "medium",
  onPriorityChange,
  style,
}) => {
  const { t } = useTranslation();
  const { currentTheme } = useTheme();

  const priorities = [
    {
      value: "low" as const,
      label: t("notes.priority.low"),
      icon: "chevron-down",
      color: "#4CAF50",
      bgColor: "#E8F5E8",
    },
    {
      value: "medium" as const,
      label: t("notes.priority.medium"),
      icon: "remove",
      color: "#FF9800",
      bgColor: "#FFF3E0",
    },
    {
      value: "high" as const,
      label: t("notes.priority.high"),
      icon: "chevron-up",
      color: "#FF5722",
      bgColor: "#FFEBEE",
    },
    {
      value: "urgent" as const,
      label: t("notes.priority.urgent"),
      icon: "warning",
      color: "#F44336",
      bgColor: "#FFEBEE",
    },
  ];

  return (
    <View style={[styles.container, style]}>
      <Text style={[styles.label, { color: currentTheme.colors.text }]}>
        {t("notes.priority.label")}
      </Text>
      <View style={styles.priorityRow}>
        {priorities.map((priority) => (
          <TouchableOpacity
            key={priority.value}
            style={[
              styles.priorityButton,
              {
                backgroundColor:
                  selectedPriority === priority.value
                    ? priority.bgColor
                    : currentTheme.colors.surface,
                borderColor:
                  selectedPriority === priority.value
                    ? priority.color
                    : currentTheme.colors.outline,
              },
            ]}
            onPress={() => onPriorityChange(priority.value)}
          >
            <Ionicons
              name={priority.icon as any}
              size={16}
              color={
                selectedPriority === priority.value
                  ? priority.color
                  : currentTheme.colors.text
              }
            />
            <Text
              style={[
                styles.priorityText,
                {
                  color:
                    selectedPriority === priority.value
                      ? priority.color
                      : currentTheme.colors.text,
                  fontWeight:
                    selectedPriority === priority.value ? "bold" : "normal",
                },
              ]}
            >
              {priority.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
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
  priorityRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  priorityButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    minWidth: 80,
  },
  priorityText: {
    fontSize: 14,
    marginLeft: 6,
  },
});

export default PrioritySelector;
