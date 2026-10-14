import React from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function SearchBar({ value, onChangeText, onClear }) {
  return (
    <View style={styles.container}>
      <Ionicons name="search" size={18} color="#64748b" style={styles.icon} />
      <TextInput
        style={styles.input}
        placeholder="Tìm kiếm theo tên hoặc SĐT..."
        placeholderTextColor="#94a3b8"
        value={value}
        onChangeText={onChangeText}
      />
      {value ? (
        <TouchableOpacity onPress={onClear}>
          <Ionicons name="close-circle" size={18} color="#94a3b8" />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  icon: {
    marginRight: 8
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#0f172a'
  }
});
