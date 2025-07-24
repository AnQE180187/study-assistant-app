import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SIZES } from "../constants/themes";
import { useTranslation } from "react-i18next";

interface TimePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (startTime: string, endTime: string) => void;
  initialStartTime?: string;
  initialEndTime?: string;
}

const TimePickerModal: React.FC<TimePickerModalProps> = ({
  visible,
  onClose,
  onConfirm,
  initialStartTime = "09:00",
  initialEndTime = "10:00",
}) => {
  const { t } = useTranslation();
  const [startTime, setStartTime] = useState(initialStartTime);
  const [endTime, setEndTime] = useState(initialEndTime);

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, "0")}:${minute
          .toString()
          .padStart(2, "0")}`;
        slots.push(timeString);
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  const handleConfirm = () => {
    const startMinutes =
      parseInt(startTime.split(":")[0]) * 60 +
      parseInt(startTime.split(":")[1]);
    const endMinutes =
      parseInt(endTime.split(":")[0]) * 60 + parseInt(endTime.split(":")[1]);

    if (startMinutes >= endMinutes) {
      Alert.alert(t("common.error"), t("study_plan.endTimeAfterStart"));
      return;
    }

    onConfirm(startTime, endTime);
    onClose();
  };

  const TimeSelector = ({
    title,
    time,
    onTimeChange,
    color,
  }: {
    title: string;
    time: string;
    onTimeChange: (time: string) => void;
    color: string;
  }) => (
    <View style={styles.timeSelector}>
      <Text style={styles.timeSelectorTitle}>{title}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.timeScrollContainer}
      >
        {timeSlots.map((slot) => (
          <TouchableOpacity
            key={slot}
            style={[
              styles.timeSlot,
              time === slot && { backgroundColor: color, borderColor: color },
            ]}
            onPress={() => onTimeChange(slot)}
          >
            <Text
              style={[
                styles.timeSlotText,
                time === slot && styles.selectedTimeSlotText,
              ]}
            >
              {slot}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>{t("study_plan.selectTime")}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <TimeSelector
              title={t("study_plan.startTime")}
              time={startTime}
              onTimeChange={setStartTime}
              color={COLORS.primary}
            />

            <View style={styles.divider} />

            <TimeSelector
              title={t("study_plan.endTime")}
              time={endTime}
              onTimeChange={setEndTime}
              color={COLORS.secondary}
            />

            <View style={styles.durationContainer}>
              <Text style={styles.durationTitle}>Thời lượng:</Text>
              <Text style={styles.durationText}>
                {(() => {
                  const startMinutes =
                    parseInt(startTime.split(":")[0]) * 60 +
                    parseInt(startTime.split(":")[1]);
                  const endMinutes =
                    parseInt(endTime.split(":")[0]) * 60 +
                    parseInt(endTime.split(":")[1]);
                  const duration = endMinutes - startMinutes;
                  const hours = Math.floor(duration / 60);
                  const minutes = duration % 60;
                  return `${hours}h ${minutes}m`;
                })()}
              </Text>
            </View>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>{t("common.cancel")}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleConfirm}
            >
              <Text style={styles.confirmButtonText}>
                {t("common.confirm")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
  },
  closeButton: {
    padding: 5,
  },
  content: {
    padding: 20,
  },
  timeSelector: {
    marginBottom: 20,
  },
  timeSelectorTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 12,
  },
  timeScrollContainer: {
    paddingHorizontal: 5,
  },
  timeSlot: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginHorizontal: 4,
    backgroundColor: COLORS.card,
  },
  timeSlotText: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: "500",
  },
  selectedTimeSlotText: {
    color: "#fff",
    fontWeight: "bold",
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 20,
  },
  durationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: COLORS.primaryLight,
    borderRadius: 12,
    marginTop: 10,
  },
  durationTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
  },
  durationText: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  footer: {
    flexDirection: "row",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 10,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    marginLeft: 10,
    alignItems: "center",
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});

export default TimePickerModal;
