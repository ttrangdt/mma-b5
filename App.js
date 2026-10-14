import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  Alert,
  SafeAreaView,
  StatusBar,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import * as SQLite from 'expo-sqlite';
import { Ionicons } from '@expo/vector-icons';

// Online Avatar Generator (Khong dung asset local)
const getAvatarUrl = (name) => {
  const cleanName = encodeURIComponent(name || 'User');
  return `https://ui-avatars.com/api/?name=${cleanName}&background=4f46e5&color=ffffff&bold=true&size=128`;
};

export default function App() {
  const [db, setDb] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal State cho Thêm / Sửa liên hệ
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  // 1. KHỞI TẠO CƠ SỞ DỮ LIỆU SQLITE (Slide 12 & 20)
  useEffect(() => {
    let database = null;
    try {
      if (SQLite.openDatabaseSync) {
        database = SQLite.openDatabaseSync('contacts.db');
      } else if (SQLite.openDatabase) {
        database = SQLite.openDatabase('contacts.db');
      }
      setDb(database);
      initDatabase(database);
    } catch (error) {
      console.warn('Lỗi mở database SQLite:', error);
      // Fallback in-memory cho môi trường Web Preview nếu SQLite không hỗ trợ
      loadContactsFallback();
      setLoading(false);
    }
  }, []);

  const initDatabase = (database) => {
    if (!database) {
      setLoading(false);
      return;
    }
    try {
      if (database.execSync) {
        // Modern Expo SQLite API (Expo SDK 51+)
        database.execSync(`
          CREATE TABLE IF NOT EXISTS contacts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            phone TEXT NOT NULL,
            email TEXT
          );
          CREATE INDEX IF NOT EXISTS idx_contacts_name ON contacts(name);
        `);
        loadContacts(database, '');
      } else if (database.transaction) {
        // Legacy Expo SQLite API
        database.transaction(
          (tx) => {
            tx.executeSql(`
              CREATE TABLE IF NOT EXISTS contacts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                phone TEXT NOT NULL,
                email TEXT
              );
            `);
            tx.executeSql('CREATE INDEX IF NOT EXISTS idx_contacts_name ON contacts(name);');
          },
          (err) => {
            console.error('Lỗi khởi tạo table:', err);
            setLoading(false);
          },
          () => {
            loadContacts(database, '');
          }
        );
      }
    } catch (err) {
      console.warn('Khởi tạo SQLite gặp lỗi, dùng chế độ dự phòng:', err);
      setLoading(false);
    }
  };

  // 2. READ: TẢI & TÌM KIẾM LIÊN HỆ (Slide 14)
  const loadContacts = useCallback((database = db, query = searchQuery) => {
    if (!database) return;
    setLoading(true);
    try {
      if (database.getAllSync) {
        // Modern API
        let rows = [];
        if (query.trim()) {
          rows = database.getAllSync(
            'SELECT * FROM contacts WHERE name LIKE ? OR phone LIKE ? ORDER BY id DESC',
            [`%${query.trim()}%`, `%${query.trim()}%`]
          );
        } else {
          rows = database.getAllSync('SELECT * FROM contacts ORDER BY id DESC');
        }
        setContacts(rows || []);
        setLoading(false);
      } else if (database.transaction) {
        // Legacy API
        database.transaction((tx) => {
          const sql = query.trim()
            ? 'SELECT * FROM contacts WHERE name LIKE ? OR phone LIKE ? ORDER BY id DESC'
            : 'SELECT * FROM contacts ORDER BY id DESC';
          const params = query.trim() ? [`%${query.trim()}%`, `%${query.trim()}%`] : [];
          tx.executeSql(sql, params, (_, { rows: { _array } }) => {
            setContacts(_array || []);
            setLoading(false);
          });
        });
      }
    } catch (err) {
      console.error('Lỗi khi đọc SQLite:', err);
      setLoading(false);
    }
  }, [db, searchQuery]);

  // Fallback mẫu khi chạy trên trình duyệt web không hỗ trợ WASM SQLite
  const loadContactsFallback = () => {
    setContacts([
      { id: 1, name: 'John Doe', phone: '1234567890', email: 'john@example.com' },
      { id: 2, name: 'Jane Smith', phone: '0987654321', email: 'jane@example.com' },
      { id: 3, name: 'Michael Scott', phone: '0912345678', email: 'michael@dunder.com' }
    ]);
  };

  // 3. CREATE & UPDATE: THÊM HOẶC SỬA LIÊN HỆ (Slide 13 & 15)
  const handleSaveContact = () => {
    if (!name.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập họ và tên!');
      return;
    }
    if (!phone.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập số điện thoại!');
      return;
    }

    try {
      if (editingId) {
        // UPDATE (Slide 15)
        if (db && db.runSync) {
          db.runSync(
            'UPDATE contacts SET name = ?, phone = ?, email = ? WHERE id = ?',
            [name.trim(), phone.trim(), email.trim(), editingId]
          );
          closeModal();
          loadContacts(db, searchQuery);
          Alert.alert('Thành công', 'Đã cập nhật thông tin liên hệ!');
        } else if (db && db.transaction) {
          db.transaction(
            (tx) => {
              tx.executeSql(
                'UPDATE contacts SET name = ?, phone = ?, email = ? WHERE id = ?',
                [name.trim(), phone.trim(), email.trim(), editingId]
              );
            },
            null,
            () => {
              closeModal();
              loadContacts(db, searchQuery);
              Alert.alert('Thành công', 'Đã cập nhật thông tin liên hệ!');
            }
          );
        } else {
          // Fallback
          setContacts((prev) =>
            prev.map((c) =>
              c.id === editingId ? { ...c, name, phone, email } : c
            )
          );
          closeModal();
        }
      } else {
        // CREATE / INSERT (Slide 13)
        if (db && db.runSync) {
          db.runSync(
            'INSERT INTO contacts (name, phone, email) VALUES (?, ?, ?)',
            [name.trim(), phone.trim(), email.trim()]
          );
          closeModal();
          loadContacts(db, searchQuery);
          Alert.alert('Thành công', 'Đã thêm liên hệ mới vào SQLite!');
        } else if (db && db.transaction) {
          db.transaction(
            (tx) => {
              tx.executeSql(
                'INSERT INTO contacts (name, phone, email) VALUES (?, ?, ?)',
                [name.trim(), phone.trim(), email.trim()]
              );
            },
            null,
            () => {
              closeModal();
              loadContacts(db, searchQuery);
              Alert.alert('Thành công', 'Đã thêm liên hệ mới vào SQLite!');
            }
          );
        } else {
          // Fallback
          const newContact = { id: Date.now(), name, phone, email };
          setContacts((prev) => [newContact, ...prev]);
          closeModal();
        }
      }
    } catch (err) {
      Alert.alert('Lỗi SQLite', err.message);
    }
  };

  // 4. DELETE: XÓA LIÊN HỆ (Slide 16)
  const handleDeleteContact = (id, contactName) => {
    Alert.alert(
      'Xác nhận xóa',
      `Bạn có chắc muốn xóa liên hệ "${contactName}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa ngay',
          style: 'destructive',
          onPress: () => {
            try {
              if (db && db.runSync) {
                db.runSync('DELETE FROM contacts WHERE id = ?', [id]);
                loadContacts(db, searchQuery);
              } else if (db && db.transaction) {
                db.transaction(
                  (tx) => tx.executeSql('DELETE FROM contacts WHERE id = ?', [id]),
                  null,
                  () => loadContacts(db, searchQuery)
                );
              } else {
                setContacts((prev) => prev.filter((c) => c.id !== id));
              }
            } catch (err) {
              Alert.alert('Lỗi', err.message);
            }
          }
        }
      ]
    );
  };

  // 5. TRANSACTION BATCH INSERT: TỐI ƯU HIỆU NĂNG THEO SLIDE 20
  const handleSeedBatchData = () => {
    try {
      if (db && db.runSync) {
        // Gói nhiều INSERT trong 1 Transaction
        db.execSync(`
          BEGIN TRANSACTION;
          INSERT INTO contacts (name, phone, email) VALUES ('Alex Tran', '0901234567', 'alex@gmail.com');
          INSERT INTO contacts (name, phone, email) VALUES ('Bao Nguyen', '0988776655', 'bao@fpt.edu.vn');
          INSERT INTO contacts (name, phone, email) VALUES ('Chi Le', '0911223344', 'chi.le@company.com');
          COMMIT;
        `);
        loadContacts(db, searchQuery);
        Alert.alert('Transaction thành công', 'Đã thêm hàng loạt 3 danh bạ mẫu bằng SQLite Transaction!');
      } else {
        loadContactsFallback();
      }
    } catch (err) {
      Alert.alert('Lỗi Transaction', err.message);
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setName('');
    setPhone('');
    setEmail('');
    setModalVisible(true);
  };

  const openEditModal = (contact) => {
    setEditingId(contact.id);
    setName(contact.name);
    setPhone(contact.phone);
    setEmail(contact.email || '');
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingId(null);
    setName('');
    setPhone('');
    setEmail('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4338ca" />

      {/* Header Thanh Lịch */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Contact Management</Text>
          <Text style={styles.headerSubtitle}>
            SQLite CRUD & Performance (Lab MMA301)
          </Text>
        </View>
        <TouchableOpacity style={styles.seedButton} onPress={handleSeedBatchData}>
          <Ionicons name="flash-outline" size={16} color="#ffffff" />
          <Text style={styles.seedButtonText}>Seed DB</Text>
        </TouchableOpacity>
      </View>

      {/* Thanh Tìm Kiếm (Read with Filter) */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#64748b" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm theo tên hoặc số điện thoại..."
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              loadContacts(db, text);
            }}
          />
          {searchQuery ? (
            <TouchableOpacity
              onPress={() => {
                setSearchQuery('');
                loadContacts(db, '');
              }}>
              <Ionicons name="close-circle" size={18} color="#94a3b8" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Thống kê số lượng */}
      <View style={styles.countBar}>
        <Text style={styles.countText}>
          Tổng số: <Text style={styles.countBold}>{contacts.length}</Text> liên hệ
        </Text>
      </View>

      {/* Danh Sách Liên Hệ (FlatList) */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#4f46e5" />
          <Text style={styles.loadingText}>Đang tải SQLite database...</Text>
        </View>
      ) : (
        <FlatList
          data={contacts}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Image
                source={{ uri: getAvatarUrl(item.name) }}
                style={styles.avatar}
              />
              <View style={styles.cardDetails}>
                <Text style={styles.contactName}>{item.name}</Text>
                <View style={styles.rowInfo}>
                  <Ionicons name="call-outline" size={14} color="#64748b" />
                  <Text style={styles.contactPhone}>{item.phone}</Text>
                </View>
                {item.email ? (
                  <View style={styles.rowInfo}>
                    <Ionicons name="mail-outline" size={14} color="#64748b" />
                    <Text style={styles.contactEmail}>{item.email}</Text>
                  </View>
                ) : null}
              </View>

              {/* Action Buttons */}
              <View style={styles.cardActions}>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.editBtn]}
                  onPress={() => openEditModal(item)}>
                  <Ionicons name="create-outline" size={18} color="#0284c7" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.deleteBtn]}
                  onPress={() => handleDeleteContact(item.id, item.name)}>
                  <Ionicons name="trash-outline" size={18} color="#ef4444" />
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={60} color="#cbd5e1" />
              <Text style={styles.emptyTitle}>Chưa có liên hệ nào</Text>
              <Text style={styles.emptySubtitle}>
                Bấm vào nút dấu (+) bên dưới hoặc nút "Seed DB" để thêm liên hệ.
              </Text>
            </View>
          }
        />
      )}

      {/* Nút FAB Thêm Liên Hệ */}
      <TouchableOpacity style={styles.fab} onPress={openAddModal}>
        <Ionicons name="add" size={32} color="#ffffff" />
      </TouchableOpacity>

      {/* Modal Thêm / Chỉnh Sửa Liên Hệ */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingId ? '✏️ Chỉnh Sửa Liên Hệ' : '➕ Thêm Liên Hệ Mới'}
              </Text>
              <TouchableOpacity onPress={closeModal}>
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Họ và tên (*)</Text>
              <TextInput
                style={styles.formInput}
                placeholder="VD: John Doe"
                placeholderTextColor="#94a3b8"
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Số điện thoại (*)</Text>
              <TextInput
                style={styles.formInput}
                placeholder="VD: 0912345678"
                placeholderTextColor="#94a3b8"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Địa chỉ Email</Text>
              <TextInput
                style={styles.formInput}
                placeholder="VD: contact@example.com"
                placeholderTextColor="#94a3b8"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.btn, styles.btnCancel]}
                onPress={closeModal}>
                <Text style={styles.btnCancelText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, styles.btnSave]}
                onPress={handleSaveContact}>
                <Text style={styles.btnSaveText}>
                  {editingId ? 'Lưu Thay Đổi' : 'Thêm Vào SQLite'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc'
  },
  header: {
    backgroundColor: '#4f46e5',
    paddingVertical: 18,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 4,
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff'
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#c7d2fe',
    marginTop: 2
  },
  seedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4
  },
  seedButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600'
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 6
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  searchIcon: {
    marginRight: 8
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0f172a'
  },
  countBar: {
    paddingHorizontal: 18,
    paddingVertical: 6
  },
  countText: {
    fontSize: 12,
    color: '#64748b'
  },
  countBold: {
    fontWeight: '700',
    color: '#4f46e5'
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 90
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f1f5f9'
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#e0e7ff'
  },
  cardDetails: {
    flex: 1,
    marginLeft: 12
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2
  },
  rowInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 4
  },
  contactPhone: {
    fontSize: 13,
    color: '#475569'
  },
  contactEmail: {
    fontSize: 12,
    color: '#64748b'
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center'
  },
  editBtn: {
    backgroundColor: '#e0f2fe'
  },
  deleteBtn: {
    backgroundColor: '#fee2e2'
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#4f46e5',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748b'
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 12
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 30
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'center',
    paddingHorizontal: 20
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 22,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b'
  },
  formGroup: {
    marginBottom: 14
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6
  },
  formInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0f172a'
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 10
  },
  btn: {
    paddingVertical: 11,
    paddingHorizontal: 18,
    borderRadius: 10,
    alignItems: 'center'
  },
  btnCancel: {
    backgroundColor: '#f1f5f9'
  },
  btnCancelText: {
    color: '#475569',
    fontWeight: '600',
    fontSize: 14
  },
  btnSave: {
    backgroundColor: '#4f46e5'
  },
  btnSaveText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14
  }
});
