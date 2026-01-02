
import { User, Booking, UserRole } from '../types';

const USERS_KEY = 'booking_system_users';
const BOOKINGS_KEY = 'booking_system_bookings';

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

/**
 * Retrieves all registered users from local storage.
 * Initializes with default admin and user if no data exists.
 */
export const getStoredUsers = (): User[] => {
  try {
    const data = localStorage.getItem(USERS_KEY);
    if (!data) {
      const initialUsers = [DEFAULT_ADMIN, DEFAULT_USER];
      localStorage.setItem(USERS_KEY, JSON.stringify(initialUsers));
      return initialUsers;
    }
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to parse users from storage:', error);
    return [DEFAULT_ADMIN, DEFAULT_USER];
  }
};

/**
 * Retrieves all bookings from local storage.
 */
export const getStoredBookings = (): Booking[] => {
  try {
    const data = localStorage.getItem(BOOKINGS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to parse bookings from storage:', error);
    return [];
  }
};

/**
 * Adds a new booking to the list.
 */
export const saveBooking = (booking: Booking) => {
  const bookings = getStoredBookings();
  bookings.push(booking);
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
};

/**
 * Updates an existing booking.
 */
export const updateBooking = (updatedBooking: Booking) => {
  const bookings = getStoredBookings();
  const index = bookings.findIndex(b => b.id === updatedBooking.id);
  if (index !== -1) {
    bookings[index] = updatedBooking;
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
  }
};

/**
 * Deletes a booking by ID.
 */
export const deleteBooking = (id: string) => {
  const bookings = getStoredBookings();
  const filtered = bookings.filter(b => b.id !== id);
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(filtered));
};

/**
 * Saves a new user to the storage.
 * Note: Password is kept in plain text for this implementation as requested.
 */
export const saveUser = (user: User) => {
  const users = getStoredUsers();
  users.push(user);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

/**
 * Updates user profile information.
 */
export const updateUser = (updatedUser: User) => {
  const users = getStoredUsers();
  const index = users.findIndex(u => u.id === updatedUser.id);
  if (index !== -1) {
    users[index] = updatedUser;
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }
};
