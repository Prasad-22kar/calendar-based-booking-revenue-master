
export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER'
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  password?: string;
}

export interface Booking {
  id: string;
  userId: string;
  userName: string;
  clientMobile: string;
  title: string;
  description: string;
  date: string; // ISO format: YYYY-MM-DD
  totalAmount: number;
  advanceAmount: number;
  pendingAmount: number;
  createdAt: number;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export interface RevenueStats {
  totalRevenue: number;
  totalAdvance: number;
  totalPending: number;
  count: number;
}

export interface Note {
  id: string;
  userId: string;
  date: string; // ISO format: YYYY-MM-DD
  content: string;
  createdAt: number;
  updatedAt: number;
}

export interface Birthday {
  id: string;
  userId: string;
  date: string; // ISO format: YYYY-MM-DD
  name: string;
  phone?: string;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}
