
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
