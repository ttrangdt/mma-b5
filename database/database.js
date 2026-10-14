import * as SQLite from 'expo-sqlite';

let db = null;

// Khởi tạo Database & Table & Index
export const initDB = () => {
  return new Promise((resolve) => {
    try {
      if (SQLite.openDatabaseSync) {
        db = SQLite.openDatabaseSync('contacts.db');
        db.execSync(`
          CREATE TABLE IF NOT EXISTS contacts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            phone TEXT NOT NULL,
            email TEXT
          );
          CREATE INDEX IF NOT EXISTS idx_contacts_name ON contacts(name);
        `);
        resolve(db);
      } else if (SQLite.openDatabase) {
        db = SQLite.openDatabase('contacts.db');
        db.transaction((tx) => {
          tx.executeSql(`
            CREATE TABLE IF NOT EXISTS contacts (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              name TEXT NOT NULL,
              phone TEXT NOT NULL,
              email TEXT
            );
          `);
          tx.executeSql('CREATE INDEX IF NOT EXISTS idx_contacts_name ON contacts(name);');
        }, (err) => {
          console.warn('Lỗi init table:', err);
          resolve(null);
        }, () => {
          resolve(db);
        });
      } else {
        resolve(null);
      }
    } catch (error) {
      console.warn('Không thể mở SQLite Native (Fallback memory):', error);
      resolve(null);
    }
  });
};

// READ: Lấy danh sách hoặc tìm kiếm
export const getContacts = (query = '') => {
  return new Promise((resolve) => {
    if (!db) {
      resolve([]);
      return;
    }
    try {
      if (db.getAllSync) {
        let rows = [];
        if (query.trim()) {
          rows = db.getAllSync(
            'SELECT * FROM contacts WHERE name LIKE ? OR phone LIKE ? ORDER BY id DESC',
            [`%${query.trim()}%`, `%${query.trim()}%`]
          );
        } else {
          rows = db.getAllSync('SELECT * FROM contacts ORDER BY id DESC');
        }
        resolve(rows || []);
      } else if (db.transaction) {
        db.transaction((tx) => {
          const sql = query.trim()
            ? 'SELECT * FROM contacts WHERE name LIKE ? OR phone LIKE ? ORDER BY id DESC'
            : 'SELECT * FROM contacts ORDER BY id DESC';
          const params = query.trim() ? [`%${query.trim()}%`, `%${query.trim()}%`] : [];
          tx.executeSql(sql, params, (_, { rows: { _array } }) => {
            resolve(_array || []);
          });
        }, () => resolve([]));
      }
    } catch (err) {
      console.warn('Lỗi getContacts:', err);
      resolve([]);
    }
  });
};

// CREATE: Thêm mới liên hệ (Slide 13)
export const addContact = (name, phone, email) => {
  return new Promise((resolve, reject) => {
    if (!db) {
      resolve({ id: Date.now(), name, phone, email });
      return;
    }
    try {
      if (db.runSync) {
        const result = db.runSync(
          'INSERT INTO contacts (name, phone, email) VALUES (?, ?, ?)',
          [name.trim(), phone.trim(), email.trim()]
        );
        resolve(result);
      } else if (db.transaction) {
        db.transaction((tx) => {
          tx.executeSql(
            'INSERT INTO contacts (name, phone, email) VALUES (?, ?, ?)',
            [name.trim(), phone.trim(), email.trim()],
            (_, result) => resolve(result),
            (_, err) => { reject(err); return false; }
          );
        });
      }
    } catch (err) {
      reject(err);
    }
  });
};

// UPDATE: Cập nhật thông tin liên hệ (Slide 15)
export const updateContact = (id, name, phone, email) => {
  return new Promise((resolve, reject) => {
    if (!db) {
      resolve(true);
      return;
    }
    try {
      if (db.runSync) {
        db.runSync(
          'UPDATE contacts SET name = ?, phone = ?, email = ? WHERE id = ?',
          [name.trim(), phone.trim(), email.trim(), id]
        );
        resolve(true);
      } else if (db.transaction) {
        db.transaction((tx) => {
          tx.executeSql(
            'UPDATE contacts SET name = ?, phone = ?, email = ? WHERE id = ?',
            [name.trim(), phone.trim(), email.trim(), id],
            () => resolve(true),
            (_, err) => { reject(err); return false; }
          );
        });
      }
    } catch (err) {
      reject(err);
    }
  });
};

// DELETE: Xóa liên hệ (Slide 16)
export const deleteContact = (id) => {
  return new Promise((resolve, reject) => {
    if (!db) {
      resolve(true);
      return;
    }
    try {
      if (db.runSync) {
        db.runSync('DELETE FROM contacts WHERE id = ?', [id]);
        resolve(true);
      } else if (db.transaction) {
        db.transaction((tx) => {
          tx.executeSql('DELETE FROM contacts WHERE id = ?', [id], () => resolve(true));
        });
      }
    } catch (err) {
      reject(err);
    }
  });
};

// TRANSACTION: Batch insert dữ liệu mẫu tối ưu (Slide 20)
export const seedBatchContacts = () => {
  return new Promise((resolve, reject) => {
    if (!db) {
      resolve(true);
      return;
    }
    try {
      if (db.execSync) {
        db.execSync(`
          BEGIN TRANSACTION;
          INSERT INTO contacts (name, phone, email) VALUES ('John Doe', '1234567890', 'john@example.com');
          INSERT INTO contacts (name, phone, email) VALUES ('Jane Smith', '0987654321', 'jane@example.com');
          INSERT INTO contacts (name, phone, email) VALUES ('Michael Scott', '0912345678', 'michael@dunder.com');
          COMMIT;
        `);
        resolve(true);
      } else if (db.transaction) {
        db.transaction((tx) => {
          tx.executeSql("INSERT INTO contacts (name, phone, email) VALUES ('John Doe', '1234567890', 'john@example.com')");
          tx.executeSql("INSERT INTO contacts (name, phone, email) VALUES ('Jane Smith', '0987654321', 'jane@example.com')");
          tx.executeSql("INSERT INTO contacts (name, phone, email) VALUES ('Michael Scott', '0912345678', 'michael@dunder.com')");
        }, reject, resolve);
      }
    } catch (err) {
      reject(err);
    }
  });
};
