import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/themes';

interface TimeWheelPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (startTime: string, endTime: string) => void;
  initialStartTime?: string;
  initialEndTime?: string;
}

const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
const minutes = Array.from({ length: 12 }, (_, i) => (i * 5).toString().padStart(2, '0'));

function parseTime(str: string) {
  const [h, m] = str.split(':');
  return { h: h || '09', m: m || '00' };
}

const TimeWheelPickerModal: React.FC<TimeWheelPickerModalProps> = ({
  visible,
  onClose,
  onConfirm,
  initialStartTime = '09:00',
  initialEndTime = '10:00',
}) => {
  const s = parseTime(initialStartTime);
  const e = parseTime(initialEndTime);
  const [startHour, setStartHour] = useState(s.h);
  const [startMinute, setStartMinute] = useState(s.m);
  const [endHour, setEndHour] = useState(e.h);
  const [endMinute, setEndMinute] = useState(e.m);

  const handleConfirm = () => {
    const startTime = `${startHour}:${startMinute}`;
    const endTime = `${endHour}:${endMinute}`;
    onConfirm(startTime, endTime);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Chọn thời gian</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>
          <View style={styles.pickerRow}>
            {/* Start Time */}
            <View style={styles.pickerCol}>
              <Text style={styles.label}>Thời gian bắt đầu</Text>
              <Text style={styles.selectedTime}>{startHour}:{startMinute}</Text>
              <View style={styles.pickerWrap}>
                <Picker
                  selectedValue={startHour}
                  style={styles.picker}
                  itemStyle={styles.pickerItem}
                  onValueChange={setStartHour}
                >
                  {hours.map(h => <Picker.Item key={h} label={h} value={h} />)}
                </Picker>
                <Text style={styles.colon}>:</Text>
                <Picker
                  selectedValue={startMinute}
                  style={styles.picker}
                  itemStyle={styles.pickerItem}
                  onValueChange={setStartMinute}
                >
                  {minutes.map(m => <Picker.Item key={m} label={m} value={m} />)}
                </Picker>
              </View>
            </View>
            {/* End Time */}
            <View style={styles.pickerCol}>
              <Text style={styles.label}>Thời gian kết thúc</Text>
              <Text style={styles.selectedTime}>{endHour}:{endMinute}</Text>
              <View style={styles.pickerWrap}>
                <Picker
                  selectedValue={endHour}
                  style={styles.picker}
                  itemStyle={styles.pickerItem}
                  onValueChange={setEndHour}
                >
                  {hours.map(h => <Picker.Item key={h} label={h} value={h} />)}
                </Picker>
                <Text style={styles.colon}>:</Text>
                <Picker
                  selectedValue={endMinute}
                  style={styles.picker}
                  itemStyle={styles.pickerItem}
                  onValueChange={setEndMinute}
                >
                  {minutes.map(m => <Picker.Item key={m} label={m} value={m} />)}
                </Picker>
              </View>
            </View>
          </View>
          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Huỷ</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
              <Text style={styles.confirmButtonText}>Xác nhận</Text>
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
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center', // căn giữa dọc
    alignItems: 'center',     // căn giữa ngang
  },
  modalContainer: {
    backgroundColor: COLORS.background,
    borderRadius: 20,
    padding: 20,
    width: '90%',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    width: '100%',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  closeButton: {
    padding: 5,
  },
  pickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    width: '100%',
  },
  pickerCol: {
    flex: 1,
    alignItems: 'center',
  },
  label: {
    fontSize: 15,
    color: COLORS.text,
    marginBottom: 4,
    fontWeight: '600',
  },
  selectedTime: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 4,
  },
  pickerWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  picker: {
    width: 60,
    height: 120,
  },
  pickerItem: {
    fontSize: 22,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  colon: {
    fontSize: 22,
    color: COLORS.text,
    marginHorizontal: 2,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    paddingTop: 10,
    paddingBottom: 20,
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    marginLeft: 10,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default TimeWheelPickerModal; 