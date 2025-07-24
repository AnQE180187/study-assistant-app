import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SIZES } from "../constants/themes";

interface NoteCardProps {
  title: string;
  description?: string;
  content?: string;
  tags?: string[];
  category?: string;
  priority?: "low" | "medium" | "high" | "urgent";
  studyPlanTitle?: string;
  color?: string;
  isPinned?: boolean;
  isPublic?: boolean;
  createdAt?: string;
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onTogglePin?: () => void;
}

const NoteCard: React.FC<NoteCardProps> = ({
  title,
  description,
  content,
  tags = [],
  category,
  priority = "medium",
  studyPlanTitle,
  color,
  isPinned = false,
  isPublic = false,
  createdAt,
  onPress,
  onEdit,
  onDelete,
  onTogglePin,
}) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "#F44336";
      case "high":
        return "#FF5722";
      case "medium":
        return "#FF9800";
      case "low":
        return "#4CAF50";
      default:
        return COLORS.textSecondary;
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "warning";
      case "high":
        return "chevron-up";
      case "medium":
        return "remove";
      case "low":
        return "chevron-down";
      default:
        return "remove";
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          borderLeftColor: color || COLORS.primary,
          borderLeftWidth: 4,
          backgroundColor: isPinned ? COLORS.primaryLight : COLORS.card,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>
          {isPinned && <Ionicons name="pin" size={16} color={COLORS.primary} />}
        </View>

        <View style={styles.headerActions}>
          {onTogglePin && (
            <TouchableOpacity onPress={onTogglePin} style={styles.actionBtn}>
              <Ionicons
                name={isPinned ? "pin" : "pin-outline"}
                size={16}
                color={isPinned ? COLORS.primary : COLORS.textSecondary}
              />
            </TouchableOpacity>
          )}
          {onEdit && (
            <TouchableOpacity onPress={onEdit} style={styles.actionBtn}>
              <Ionicons
                name="create-outline"
                size={16}
                color={COLORS.textSecondary}
              />
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity onPress={onDelete} style={styles.actionBtn}>
              <Ionicons name="trash-outline" size={16} color={COLORS.error} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Study Plan */}
      {studyPlanTitle && (
        <View style={styles.studyPlanContainer}>
          <Ionicons name="book-outline" size={14} color={COLORS.primary} />
          <Text style={styles.studyPlanText} numberOfLines={1}>
            {studyPlanTitle}
          </Text>
        </View>
      )}

      {/* Description */}
      {description && (
        <Text style={styles.description} numberOfLines={2}>
          {description}
        </Text>
      )}

      {/* Content Preview */}
      {content && !description && (
        <Text style={styles.contentPreview} numberOfLines={3}>
          {truncateText(content, 120)}
        </Text>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {tags.slice(0, 3).map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
          {tags.length > 3 && (
            <Text style={styles.moreTags}>+{tags.length - 3}</Text>
          )}
        </View>
      )}

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerLeft}>
          {category && (
            <View style={styles.category}>
              <Text style={styles.categoryText}>{category}</Text>
            </View>
          )}
          <View style={styles.priorityContainer}>
            <Ionicons
              name={getPriorityIcon(priority)}
              size={14}
              color={getPriorityColor(priority)}
            />
            <Text
              style={[
                styles.priorityText,
                { color: getPriorityColor(priority) },
              ]}
            >
              {priority}
            </Text>
          </View>
        </View>

        <View style={styles.footerRight}>
          {isPublic && (
            <Ionicons
              name="globe-outline"
              size={14}
              color={COLORS.textSecondary}
            />
          )}
          {createdAt && (
            <Text style={styles.date}>{formatDate(createdAt)}</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  titleRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    flex: 1,
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionBtn: {
    padding: 4,
  },
  studyPlanContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 6,
  },
  studyPlanText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: "500",
    flex: 1,
  },
  description: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
    lineHeight: 20,
  },
  contentPreview: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
    lineHeight: 20,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 12,
  },
  tag: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  tagText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: "500",
  },
  moreTags: {
    fontSize: 12,
    color: COLORS.textSecondary,
    alignSelf: "center",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  category: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  categoryText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
  priorityContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: "500",
    textTransform: "capitalize",
  },
  footerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  date: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
});

export default NoteCard;
