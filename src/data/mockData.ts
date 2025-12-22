import { User, PaymentCategory, Payment } from '@/types';

export const mockUsers: User[] = [
  {
    id: '1',
    email: 'student@nacos.edu.ng',
    fullName: 'Adebayo Olamide',
    matricNumber: 'CSC/2020/001',
    department: 'Computer Science',
    level: '400',
    phone: '+234 801 234 5678',
    role: 'student',
    createdAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    email: 'admin@nacos.edu.ng',
    fullName: 'Chidinma Nwosu',
    matricNumber: 'CSC/2019/045',
    department: 'Computer Science',
    level: '500',
    phone: '+234 802 345 6789',
    role: 'admin',
    createdAt: new Date('2023-09-01'),
  },
];

export const mockPaymentCategories: PaymentCategory[] = [
  {
    id: '1',
    name: 'NACOS Dues',
    description: 'Annual NACOS membership dues for the academic session',
    amount: 2000,
    deadline: new Date('2025-03-31'),
    isActive: true,
    createdAt: new Date('2024-09-01'),
  },
  {
    id: '2',
    name: 'Departmental Levy',
    description: 'Mandatory departmental development levy',
    amount: 5000,
    deadline: new Date('2025-02-28'),
    isActive: true,
    createdAt: new Date('2024-09-01'),
  },
  {
    id: '3',
    name: 'IT Week Registration',
    description: 'Registration fee for the annual IT Week program',
    amount: 1500,
    deadline: new Date('2025-04-15'),
    isActive: true,
    createdAt: new Date('2025-01-10'),
  },
  {
    id: '4',
    name: 'Project Defense Fee',
    description: 'Final year project defense and documentation fee',
    amount: 3000,
    deadline: new Date('2025-05-30'),
    isActive: true,
    createdAt: new Date('2025-01-01'),
  },
  {
    id: '5',
    name: 'Excursion Fee',
    description: 'Annual departmental excursion and tour fee',
    amount: 8000,
    deadline: new Date('2025-03-20'),
    isActive: false,
    createdAt: new Date('2024-11-15'),
  },
];

export const mockPayments: Payment[] = [
  {
    id: '1',
    userId: '1',
    userName: 'Adebayo Olamide',
    userMatric: 'CSC/2020/001',
    categoryId: '1',
    categoryName: 'NACOS Dues',
    amount: 2000,
    reference: 'NACOS-TXN-001234',
    status: 'success',
    paymentMethod: 'card',
    transactionDate: new Date('2025-01-20'),
  },
  {
    id: '2',
    userId: '1',
    userName: 'Adebayo Olamide',
    userMatric: 'CSC/2020/001',
    categoryId: '2',
    categoryName: 'Departmental Levy',
    amount: 5000,
    reference: 'NACOS-TXN-001235',
    status: 'success',
    paymentMethod: 'bank_transfer',
    transactionDate: new Date('2025-01-22'),
  },
  {
    id: '3',
    userId: '1',
    userName: 'Adebayo Olamide',
    userMatric: 'CSC/2020/001',
    categoryId: '3',
    categoryName: 'IT Week Registration',
    amount: 1500,
    reference: 'NACOS-TXN-001236',
    status: 'pending',
    paymentMethod: 'card',
    transactionDate: new Date('2025-01-25'),
  },
];

export const generateReference = (): string => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `NACOS-${timestamp}-${random}`;
};

export const generateReceiptNumber = (): string => {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
  return `RCP-${year}-${random}`;
};
