export interface User {
  id: string;
  email: string;
  fullName: string;
  matricNumber: string;
  department: string;
  level: string;
  phone: string;
  role: 'student' | 'admin';
  createdAt: Date;
}

export interface PaymentCategory {
  id: string;
  name: string;
  description: string;
  amount: number;
  deadline: Date;
  isActive: boolean;
  createdAt: Date;
}

export interface Payment {
  id: string;
  userId: string;
  userName: string;
  userMatric: string;
  categoryId: string;
  categoryName: string;
  amount: number;
  reference: string;
  status: 'pending' | 'success' | 'failed';
  paymentMethod: 'card' | 'bank_transfer' | 'ussd';
  transactionDate: Date;
}

export interface Receipt {
  id: string;
  payment: Payment;
  generatedAt: Date;
  receiptNumber: string;
}

export interface DashboardStats {
  totalPaid: number;
  totalPending: number;
  totalDues: number;
  recentPayments: Payment[];
}

export interface AdminStats {
  totalRevenue: number;
  totalTransactions: number;
  successfulPayments: number;
  pendingPayments: number;
  failedPayments: number;
  studentsRegistered: number;
}
