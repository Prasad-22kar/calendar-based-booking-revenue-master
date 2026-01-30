import { User, Booking, UserRole } from '../types';

// IndexedDB setup
const DB_NAME = 'BookMasterDB';
const DB_VERSION = 1;
const USERS_STORE = 'users';
const BOOKINGS_STORE = 'bookings';

// Default users for initialization
const DEFAULT_ADMIN: User = {
  id: 'admin-1',
  email: 'admin@system.com',
  name: 'System Admin',
  role: UserRole.ADMIN,
  password: 'password123'
};

const DEFAULT_USER: User = {
  id: 'user-1',
  email: 'user@example.com',
  name: 'Demo User',
  role: UserRole.USER,
  password: 'password123'
};

// Database initialization
const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      
      // Initialize default users if users store is empty
      const usersStore = db.transaction([USERS_STORE], 'readwrite').objectStore(USERS_STORE);
      const getAllRequest = usersStore.getAll();
      
      getAllRequest.onsuccess = () => {
        if (getAllRequest.result.length === 0) {
          // Add default users
          usersStore.add(DEFAULT_ADMIN);
          usersStore.add(DEFAULT_USER);
        }
      };
      
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create users store
      if (!db.objectStoreNames.contains(USERS_STORE)) {
        const usersStore = db.createObjectStore(USERS_STORE, { keyPath: 'id' });
        usersStore.createIndex('email', 'email', { unique: true });
      }
      
      // Create bookings store with userId index for user-specific queries
      if (!db.objectStoreNames.contains(BOOKINGS_STORE)) {
        const bookingsStore = db.createObjectStore(BOOKINGS_STORE, { keyPath: 'id' });
        bookingsStore.createIndex('userId', 'userId', { unique: false });
        bookingsStore.createIndex('date', 'date', { unique: false });
        bookingsStore.createIndex('userId_date', ['userId', 'date'], { unique: false });
      }
    };
  });
};

// Generic database operation helper
const performDBOperation = <T>(
  operation: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> => {
  return new Promise(async (resolve, reject) => {
    try {
      const db = await initDB();
      const transaction = db.transaction([USERS_STORE, BOOKINGS_STORE], 'readwrite');
      const store = operation === (s => s.getAll()) ? 
        transaction.objectStore(USERS_STORE) : 
        transaction.objectStore(BOOKINGS_STORE);
      
      const request = operation(store);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
      
      transaction.oncomplete = () => db.close();
      transaction.onerror = () => {
        db.close();
        reject(transaction.error);
      };
    } catch (error) {
      reject(error);
    }
  });
};

// User operations
export const getStoredUsers = async (): Promise<User[]> => {
  return new Promise(async (resolve, reject) => {
    try {
      const db = await initDB();
      const transaction = db.transaction([USERS_STORE], 'readonly');
      const store = transaction.objectStore(USERS_STORE);
      const request = store.getAll();
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
      
      transaction.oncomplete = () => db.close();
      transaction.onerror = () => {
        db.close();
        reject(transaction.error);
      };
    } catch (error) {
      console.error('Failed to get users:', error);
      // Fallback to default users if IndexedDB fails
      resolve([DEFAULT_ADMIN, DEFAULT_USER]);
    }
  });
};

export const saveUser = async (user: User): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    try {
      const db = await initDB();
      const transaction = db.transaction([USERS_STORE], 'readwrite');
      const store = transaction.objectStore(USERS_STORE);
      const request = store.add(user);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
      
      transaction.oncomplete = () => db.close();
      transaction.onerror = () => {
        db.close();
        reject(transaction.error);
      };
    } catch (error) {
      console.error('Failed to save user:', error);
      reject(error);
    }
  });
};

export const updateUser = async (updatedUser: User): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    try {
      const db = await initDB();
      const transaction = db.transaction([USERS_STORE], 'readwrite');
      const store = transaction.objectStore(USERS_STORE);
      const request = store.put(updatedUser);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
      
      transaction.oncomplete = () => db.close();
      transaction.onerror = () => {
        db.close();
        reject(transaction.error);
      };
    } catch (error) {
      console.error('Failed to update user:', error);
      reject(error);
    }
  });
};

// Booking operations - User-specific
export const getStoredBookings = async (userId?: string): Promise<Booking[]> => {
  return new Promise(async (resolve, reject) => {
    try {
      const db = await initDB();
      const transaction = db.transaction([BOOKINGS_STORE], 'readonly');
      const store = transaction.objectStore(BOOKINGS_STORE);
      
      let request: IDBRequest;
      
      if (userId) {
        // Get bookings for specific user only
        const index = store.index('userId');
        request = index.getAll(userId);
      } else {
        // Get all bookings (for admin users)
        request = store.getAll();
      }
      
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
      
      transaction.oncomplete = () => db.close();
      transaction.onerror = () => {
        db.close();
        reject(transaction.error);
      };
    } catch (error) {
      console.error('Failed to get bookings:', error);
      resolve([]);
    }
  });
};

export const saveBooking = async (booking: Booking): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    try {
      const db = await initDB();
      const transaction = db.transaction([BOOKINGS_STORE], 'readwrite');
      const store = transaction.objectStore(BOOKINGS_STORE);
      const request = store.add(booking);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
      
      transaction.oncomplete = () => db.close();
      transaction.onerror = () => {
        db.close();
        reject(transaction.error);
      };
    } catch (error) {
      console.error('Failed to save booking:', error);
      reject(error);
    }
  });
};

export const updateBooking = async (updatedBooking: Booking): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    try {
      const db = await initDB();
      const transaction = db.transaction([BOOKINGS_STORE], 'readwrite');
      const store = transaction.objectStore(BOOKINGS_STORE);
      const request = store.put(updatedBooking);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
      
      transaction.oncomplete = () => db.close();
      transaction.onerror = () => {
        db.close();
        reject(transaction.error);
      };
    } catch (error) {
      console.error('Failed to update booking:', error);
      reject(error);
    }
  });
};

export const deleteBooking = async (id: string): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    try {
      const db = await initDB();
      const transaction = db.transaction([BOOKINGS_STORE], 'readwrite');
      const store = transaction.objectStore(BOOKINGS_STORE);
      const request = store.delete(id);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
      
      transaction.oncomplete = () => db.close();
      transaction.onerror = () => {
        db.close();
        reject(transaction.error);
      };
    } catch (error) {
      console.error('Failed to delete booking:', error);
      reject(error);
    }
  });
};

// Remember credentials (still using localStorage for this specific feature)
export const getRememberedCredentials = (): { email: string; password: string } | null => {
  try {
    const data = localStorage.getItem('booking_system_remembered_creds');
    if (!data || data === '""') return null;
    
    const creds = JSON.parse(data);
    return creds.email && creds.password ? creds : null;
  } catch (error) {
    console.error('Failed to parse remembered credentials:', error);
    return null;
  }
};

export const saveRememberedCredentials = (email: string, password: string) => {
  if (email && password) {
    localStorage.setItem('booking_system_remembered_creds', JSON.stringify({ email, password }));
  } else {
    localStorage.removeItem('booking_system_remembered_creds');
  }
};
