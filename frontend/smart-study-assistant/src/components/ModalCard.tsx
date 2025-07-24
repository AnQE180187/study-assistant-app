import React, { useState, useEffect, ReactNode } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { COLORS, SIZES } from "../constants/themes";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { useTranslation } from "react-i18next";

type Field = {
  label: string;
  value?: string;
  onChange?: (v: string) => void;
  multiline?: boolean;
  type?: "text" | "category" | "dropdown" | "custom";
  categories?: string[];
  onAddCategory?: () => void;
  options?: { label: string; value: string }[];
  component?: ReactNode;
};

type Props = {
  visible: boolean;
  type: "add" | "edit" | "delete";
  title: string;
  fields?: Field[];
  onSubmit: () => void;
  onCancel: () => void;
  extraContent?: ReactNode;
  isPublic?: boolean;
  onTogglePublic?: () => void;
  isPinned?: boolean;
  onTogglePinned?: () => void;
  priority?: "low" | "medium" | "high";
  onPriorityChange?: (priority: "low" | "medium" | "high") => void;
};

const ModalCard: React.FC<Props> = ({
  visible,
  type,
  title,
  fields = [],
  onSubmit,
  onCancel,
  extraContent,
  isPublic,
  onTogglePublic,
  isPinned,
  onTogglePinned,
  priority,
  onPriorityChange,
}) => {
  const { t } = useTranslation();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "#FF6B6B";
      case "medium":
        return "#FFA726";
      case "low":
        return "#66BB6A";
      default:
        return COLORS.textSecondary;
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ width: "100%", alignItems: "center", flex: 1 }}
        >
          <View style={styles.card}>
            <View style={styles.header}>
              <Ionicons
                name={
                  type === "add"
                    ? "add-circle"
                    : type === "edit"
                    ? "create"
                    : "trash"
                }
                size={32}
                color={type === "delete" ? COLORS.error : COLORS.primary}
                style={{ marginBottom: 8 }}
              />
              <Text style={styles.title}>{title}</Text>
            </View>
            <ScrollView
              style={styles.scrollContent}
              contentContainerStyle={{ paddingBottom: 12 }}
              showsVerticalScrollIndicator={false}
            >
              {type !== "delete" &&
                fields.map((f, i) => (
                  <View key={i} style={styles.fieldWrap}>
                    {f.type !== "custom" && (
                      <Text style={styles.label}>{f.label}</Text>
                    )}
                    {f.type === "dropdown" && f.options ? (
                      <View
                        style={{
                          borderWidth: 1,
                          borderColor: COLORS.border,
                          borderRadius: 8,
                          marginTop: 8,
                        }}
                      >
                        <Picker
                          selectedValue={f.value}
                          onValueChange={f.onChange}
                          style={{ height: 70, fontSize: 16 }}
                        >
                          {f.options.map((opt) => (
                            <Picker.Item
                              key={opt.value}
                              label={opt.label}
                              value={opt.value}
                            />
                          ))}
                        </Picker>
                      </View>
                    ) : f.type === "category" && f.categories ? (
                      <View style={styles.categoryContainer}>
                        <ScrollView
                          horizontal
                          showsHorizontalScrollIndicator={false}
                        >
                          {f.categories.map((cat) => (
                            <TouchableOpacity
                              key={cat}
                              style={[
                                styles.categoryBtn,
                                f.value === cat && styles.categoryBtnActive,
                              ]}
                              onPress={() => f.onChange && f.onChange(cat)}
                            >
                              <Text
                                style={[
                                  styles.categoryText,
                                  f.value === cat && styles.categoryTextActive,
                                ]}
                              >
                                {cat}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                        {f.onAddCategory && (
                          <TouchableOpacity
                            onPress={f.onAddCategory}
                            style={styles.addCategoryBtn}
                          >
                            <Ionicons
                              name="add"
                              size={16}
                              color={COLORS.primary}
                            />
                            <Text style={styles.addCategoryText}>Thêm</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    ) : f.type === "custom" && f.component ? (
                      f.component
                    ) : (
                      <TextInput
                        style={[
                          styles.input,
                          f.multiline && styles.inputMultiline,
                        ]}
                        value={f.value || ""}
                        onChangeText={f.onChange}
                        multiline={f.multiline}
                      />
                    )}
                  </View>
                ))}
              {/* Extra Content */}
              {type !== "delete" && extraContent}
              {/* Priority Selection */}
              {type !== "delete" && priority && onPriorityChange && (
                <View style={styles.prioritySection}>
                  <Text style={styles.label}>Độ ưu tiên:</Text>
                  <View style={styles.priorityRow}>
                    {(["low", "medium", "high"] as const).map((p) => (
                      <TouchableOpacity
                        key={p}
                        style={[
                          styles.priorityBtn,
                          priority === p && {
                            backgroundColor: getPriorityColor(p),
                          },
                        ]}
                        onPress={() => onPriorityChange(p)}
                      >
                        <Text
                          style={[
                            styles.priorityText,
                            priority === p && styles.priorityTextActive,
                          ]}
                        >
                          {p === "low"
                            ? "Thấp"
                            : p === "medium"
                            ? "Trung bình"
                            : "Cao"}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
              {/* Toggle Public */}
              {type !== "delete" &&
                typeof isPublic === "boolean" &&
                onTogglePublic && (
                  <TouchableOpacity
                    style={styles.toggleRow}
                    onPress={onTogglePublic}
                  >
                    <Ionicons
                      name={isPublic ? "earth" : "lock-closed"}
                      size={20}
                      color={COLORS.primary}
                      style={{ marginRight: 6 }}
                    />
                    <Text style={styles.toggleText}>
                      {isPublic
                        ? t("flashcards.public")
                        : t("flashcards.private")}
                    </Text>
                  </TouchableOpacity>
                )}
              {/* Toggle Pinned */}
              {type !== "delete" &&
                typeof isPinned === "boolean" &&
                onTogglePinned && (
                  <TouchableOpacity
                    style={styles.toggleRow}
                    onPress={onTogglePinned}
                  >
                    <Ionicons
                      name={isPinned ? "pin" : "pin-outline"}
                      size={20}
                      color={COLORS.primary}
                      style={{ marginRight: 6 }}
                    />
                    <Text style={styles.toggleText}>
                      {isPinned ? "Đã ghim" : "Ghim"}
                    </Text>
                  </TouchableOpacity>
                )}
              {type === "delete" && (
                <Text style={styles.deleteText}>
                  Bạn có chắc chắn muốn xóa không?
                </Text>
              )}
            </ScrollView>
            <View style={styles.btnRow}>
              <TouchableOpacity
                style={[styles.btn, styles.cancelBtn]}
                onPress={onCancel}
              >
                <Text style={[styles.btnText, styles.cancelText]}>
                  {t("common.cancel")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.btn,
                  type === "delete" ? styles.deleteBtn : styles.submitBtn,
                ]}
                onPress={onSubmit}
              >
                <Text style={styles.btnText}>
                  {type === "delete" ? t("common.confirm") : t("common.save")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: "98%",
    height: "95%",
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    justifyContent: "flex-start",
  },
  header: {
    alignItems: "center",
    marginBottom: 18,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 8,
    textAlign: "center",
  },
  scrollContent: {
    flex: 1,
    marginBottom: 12,
  },
  fieldWrap: {
    marginBottom: 20,
  },
  label: {
    color: COLORS.primary,
    fontSize: 16,
    marginBottom: 8,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  input: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 8,
    padding: 18,
    fontSize: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    minHeight: 60,
  },
  inputMultiline: {
    minHeight: 140,
    maxHeight: 200,
    textAlignVertical: "top",
  },
  prioritySection: {
    marginBottom: 16,
  },
  priorityRow: {
    flexDirection: "row",
    gap: 8,
  },
  priorityBtn: {
    flex: 1,
    backgroundColor: COLORS.primaryLight,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: "center",
  },
  priorityText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
  priorityTextActive: {
    color: "#fff",
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingVertical: 8,
  },
  toggleText: {
    color: COLORS.primary,
    fontWeight: "500",
    fontSize: 16,
  },
  deleteText: {
    color: COLORS.error,
    fontSize: 16,
    textAlign: "center",
    marginBottom: 16,
  },
  btnRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
    gap: 10,
  },
  btn: {
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 28,
    minHeight: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
  },
  deleteBtn: {
    backgroundColor: COLORS.error,
  },
  cancelBtn: {
    backgroundColor: COLORS.primaryLight,
  },
  btnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  cancelText: {
    color: COLORS.primary,
  },
  categoryContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  categoryBtn: {
    padding: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
  },
  categoryBtnActive: {
    backgroundColor: COLORS.primaryLight,
  },
  categoryText: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: "500",
  },
  categoryTextActive: {
    color: "#fff",
  },
  addCategoryBtn: {
    padding: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    marginLeft: 8,
  },
  addCategoryText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: "500",
  },
});

export default ModalCard;
