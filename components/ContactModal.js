import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Modal,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ContactModal({
  visible,
  isEditing,
  name,
  setName,
  phone,
  setPhone,
  email,
  setEmail,
  onSave,
  onClose
}) {
  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>
              {isEditing ? '✏️ Sửa Liên Hệ' : '➕ Thêm Liên Hệ Mới'}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={22} color="#64748b" />
            </TouchableOpacity>
          </View>

          <View style={styles.group}>
            <Text style={styles.label}>Họ và tên (*)</Text>
            <TextInput
              style={styles.input}
              placeholder="VD: John Doe"
              placeholderTextColor="#94a3b8"
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.group}>
            <Text style={styles.label}>Số điện thoại (*)</Text>
            <TextInput
              style={styles.input}
              placeholder="VD: 0912345678"
              placeholderTextColor="#94a3b8"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />
          </View>

          <View style={styles.group}>
            <Text style={styles.label}>Địa chỉ Email</Text>
            <TextInput
              style={styles.input}
              placeholder="VD: john@example.com"
              placeholderTextColor="#94a3b8"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={styles.footer}>
            <TouchableOpacity style={[styles.btn, styles.btnCancel]} onPress={onClose}>
              <Text style={styles.btnCancelText}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, styles.btnSave]} onPress={onSave}>
              <Text style={styles.btnSaveText}>{isEditing ? 'Lưu Thay Đổi' : 'Thêm Vào SQLite'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'center',
    paddingHorizontal: 20
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1e293b'
  },
  group: {
    marginBottom: 12
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 5
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 14,
    color: '#0f172a'
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 8
  },
  btn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 9,
    alignItems: 'center'
  },
  btnCancel: {
    backgroundColor: '#f1f5f9'
  },
  btnCancelText: {
    color: '#475569',
    fontWeight: '600',
    fontSize: 13
  },
  btnSave: {
    backgroundColor: '#4338ca'
  },
  btnSaveText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 13
  }
});
