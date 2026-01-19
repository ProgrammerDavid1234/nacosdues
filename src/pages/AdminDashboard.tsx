import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  CreditCard, 
  TrendingUp, 
  AlertCircle,
  CheckCircle2,
  Clock,
  Search,
  Download,
  Plus,
  MoreHorizontal,
  Eye,
  X,
  Edit,
  Trash2,
  Filter,
  ChevronLeft,
  ChevronRight,
  FileText
} from 'lucide-react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { useNavigate, useLocation } from 'react-router-dom';
import { API_BASE_URL } from '@/components/api/api';


interface PaginationMeta {
  total_count: number;
  total_pages: number;
  current_page: number;
  limit: number;
  has_next: boolean;
  has_previous: boolean;
}

interface Transaction {
  id: string;
  payment_reference: string;
  transaction_reference: string;
  original_amount: number;
  paystack_charge: number;
  amount: number;
  payment_status: string;
  paid_at: string;
  created_at: string;
  student_name: string;
  student_matric: string;
  student_email: string;
  student_phone: string;
  student_level: string;
  student_department: string;
  category_id: string;
  category_name: string;
  category_description: string;
}

interface TransactionsResponse {
  data: Transaction[];
  pagination: PaginationMeta;
}

interface Category {
  id: string;
  title: string;
  description: string;
  amount: number;
  deadline: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface CategoriesResponse {
  data: Category[];
  pagination: PaginationMeta;
}

interface Student {
  id: string;
  full_name: string;
  matric_number: string;
  email: string;
  phone_number: string;
  level: string;
  department: string;
  created_at: string;
}

interface StudentsResponse {
  data: Student[];
  pagination: PaginationMeta;
}

interface CategoryDetails {
  category: Category;
  statistics: {
    total_revenue: number;
    total_with_charges: number;
    total_paystack_charges: number;
    students_paid_count: number;
    students_unpaid_count: number;
    total_students: number;
    payment_completion_rate: number;
  };
  students_paid: any[];
  students_unpaid: any[];
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'transactions' | 'categories' | 'students'>('transactions');
  const [statusFilter, setStatusFilter] = useState('completed');
  
  // Data states
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionsPagination, setTransactionsPagination] = useState<PaginationMeta | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesPagination, setCategoriesPagination] = useState<PaginationMeta | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [studentsPagination, setStudentsPagination] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(false);
  const [togglingCategory, setTogglingCategory] = useState<string | null>(null);
  
  // Page states
  const [transactionsPage, setTransactionsPage] = useState(1);
  const [categoriesPage, setCategoriesPage] = useState(1);
  const [studentsPage, setStudentsPage] = useState(1);
  
  // Dialog states
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showTransactionDetail, setShowTransactionDetail] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showCategoryDetail, setShowCategoryDetail] = useState(false);
  const [categoryDetails, setCategoryDetails] = useState<CategoryDetails | null>(null);
  const [categoryDetailFilter, setCategoryDetailFilter] = useState<'paid' | 'unpaid'>('paid');
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const autoRefreshInterval = 30000;
  
  // Pagination states for category detail (client-side)
  const [categoryDetailPage, setCategoryDetailPage] = useState(1);
  const categoryDetailPerPage = 10;
  
  // Form state
  const [categoryForm, setCategoryForm] = useState({
    title: '',
    amount: '',
    description: '',
    deadline: ''
  });

  const getAuthToken = () => localStorage.getItem('token');

useEffect(() => {
  const handler = setTimeout(() => {
    setDebouncedSearchQuery(searchQuery);
  }, 500); // Wait 500ms after user stops typing

  return () => {
    clearTimeout(handler);
  };
}, [searchQuery]);


// Fetch transactions with pagination
const fetchTransactions = async (page: number = 1) => {
  setLoading(true);
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: '20',
      sort: 'desc',
      status: statusFilter // Use the filter but default is 'completed'
    });

    if (searchQuery) params.append('search', searchQuery);

    const response = await fetch(`${API_BASE_URL}/transactions/?${params}`, {
      headers: { 'Authorization': `Bearer ${getAuthToken()}` }
    });
    const data: TransactionsResponse = await response.json();
    setTransactions(data.data);
    setTransactionsPagination(data.pagination);
  } catch (error) {
    toast({
      title: 'Error',
      description: 'Failed to fetch transactions',
      variant: 'destructive'
    });
  } finally {
    setLoading(false);
  }
};

  // Fetch categories with pagination and search
const fetchCategories = async (page: number = 1) => {
  setLoading(true);
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: '20'
    });

    // Add this line for search support
    if (searchQuery) params.append('search', searchQuery);

    const response = await fetch(`${API_BASE_URL}/payment-categories/?${params}`, {
      headers: { 'Authorization': `Bearer ${getAuthToken()}` }
    });
    const data: CategoriesResponse = await response.json();
    setCategories(data.data);
    setCategoriesPagination(data.pagination);
  } catch (error) {
    toast({
      title: 'Error',
      description: 'Failed to fetch categories',
      variant: 'destructive'
    });
  } finally {
    setLoading(false);
  }
};
  // Fetch students with pagination
  const fetchStudents = async (page: number = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20'
      });

      if (searchQuery) params.append('search', searchQuery);

      const response = await fetch(`${API_BASE_URL}/students/all?${params}`, {
        headers: { 'Authorization': `Bearer ${getAuthToken()}` }
      });
      const data: StudentsResponse = await response.json();
      setStudents(data.data);
      setStudentsPagination(data.pagination);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch students',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Create category
  const handleCreateCategory = async () => {
    if (!categoryForm.title || !categoryForm.amount || !categoryForm.deadline) {
      toast({
        title: 'Error',
        description: 'Please fill all required fields',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/payment-categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify({
          title: categoryForm.title,
          amount: parseFloat(categoryForm.amount),
          description: categoryForm.description,
          deadline: categoryForm.deadline,
          is_active: true
        })
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Category created successfully'
        });
        setShowCreateDialog(false);
        setCategoryForm({ title: '', amount: '', description: '', deadline: '' });
        fetchCategories(categoriesPage);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create category',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Edit category
  const handleEditCategory = async () => {
    if (!categoryForm.title || !categoryForm.amount || !categoryForm.deadline || !categoryToEdit) {
      toast({
        title: 'Error',
        description: 'Please fill all required fields',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/payment-categories/${categoryToEdit.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify({
          title: categoryForm.title,
          amount: parseFloat(categoryForm.amount),
          description: categoryForm.description,
          deadline: categoryForm.deadline,
          is_active: categoryToEdit.is_active
        })
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Category updated successfully'
        });
        setShowEditDialog(false);
        setCategoryToEdit(null);
        setCategoryForm({ title: '', amount: '', description: '', deadline: '' });
        fetchCategories(categoriesPage);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update category',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Open edit dialog
  const openEditDialog = (category: Category) => {
    setCategoryToEdit(category);
    setCategoryForm({
      title: category.title,
      amount: category.amount.toString(),
      description: category.description,
      deadline: category.deadline.split('T')[0]
    });
    setShowEditDialog(true);
  };

  // // Toggle category status
  // const handleToggleCategoryStatus = async (categoryId: string) => {
  //   try {
  //     const response = await fetch(`${API_BASE_URL}/payment-categories/${categoryId}/toggle`, {
  //       method: 'PATCH',
  //       headers: { 'Authorization': `Bearer ${getAuthToken()}` }
  //     });
      
  //     if (response.ok) {
  //       const result = await response.json();
  //       toast({
  //         title: 'Success',
  //         description: result.message
  //       });
  //       fetchCategories(categoriesPage);
  //     }
  //   } catch (error) {
  //     toast({
  //       title: 'Error',
  //       description: 'Failed to update category',
  //       variant: 'destructive'
  //     });
  //   }
  // };


  const handleToggleCategoryStatus = async (categoryId: string) => {
  setTogglingCategory(categoryId);
  try {
    const response = await fetch(`${API_BASE_URL}/payment-categories/${categoryId}/toggle`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${getAuthToken()}` }
    });
    
    if (response.ok) {
      const result = await response.json();
      toast({
        title: 'Success',
        description: result.message
      });
      fetchCategories(categoriesPage);
    }
  } catch (error) {
    toast({
      title: 'Error',
      description: 'Failed to update category',
      variant: 'destructive'
    });
  } finally {
    setTogglingCategory(null);
  }
};

  // Delete category
  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/payment-categories/${categoryToDelete}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getAuthToken()}` }
      });
      
      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Category deleted successfully'
        });
        setShowDeleteDialog(false);
        setCategoryToDelete(null);
        fetchCategories(categoriesPage);
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.detail || 'Failed to delete category',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete category',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch category details
  const handleViewCategoryDetails = async (categoryId: string) => {
    setLoading(true);
    setCategoryDetailPage(1);
    try {
      const response = await fetch(`${API_BASE_URL}/payment-categories/${categoryId}/details`, {
        headers: { 'Authorization': `Bearer ${getAuthToken()}` }
      });
      const data = await response.json();
      setCategoryDetails(data);
      setShowCategoryDetail(true);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch category details',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // View transaction detail
  const handleViewTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowTransactionDetail(true);
  };

  // Export transactions report
  const handleExportReport = () => {
    const csvData = [
      ['Transaction Report - Generated on ' + format(new Date(), 'yyyy-MM-dd HH:mm:ss')],
      [],
      ['Payment Reference', 'Student Name', 'Matric Number', 'Email', 'Category', 'Amount (NGN)', 'Status', 'Date'],
      ...transactions.map(t => [
        t.payment_reference,
        t.student_name,
        t.student_matric,
        t.student_email,
        t.category_name,
        t.original_amount.toFixed(2),
        t.payment_status,
        format(new Date(t.created_at), 'yyyy-MM-dd HH:mm:ss')
      ])
    ];

    const csvContent = csvData.map(row => 
      row.map(cell => {
        const cellStr = String(cell);
        if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
          return `"${cellStr.replace(/"/g, '""')}"`;
        }
        return cellStr;
      }).join(',')
    ).join('\n');
    
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `transactions_report_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: 'Success',
      description: 'Report exported successfully'
    });
  };

  // Export category report
  const handleExportCategoryReport = () => {
    if (!categoryDetails) return;

    const students = categoryDetailFilter === 'paid' 
      ? categoryDetails.students_paid 
      : categoryDetails.students_unpaid;

    const reportType = categoryDetailFilter === 'paid' ? 'Paid' : 'Unpaid';

    const csvData = [
      [`${categoryDetails.category.title} - ${reportType} Students Report`],
      [`Generated on ${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}`],
      [],
      ['Category Information'],
      ['Category Name', categoryDetails.category.title],
      ['Amount', categoryDetails.category.amount.toFixed(2)],
      ['Deadline', format(new Date(categoryDetails.category.deadline), 'yyyy-MM-dd')],
      ['Status', categoryDetails.category.is_active ? 'Active' : 'Inactive'],
      [],
      ['Statistics'],
      ['Total Revenue', categoryDetails.statistics.total_revenue.toFixed(2)],
      ['Students Paid', categoryDetails.statistics.students_paid_count.toString()],
      ['Students Unpaid', categoryDetails.statistics.students_unpaid_count.toString()],
      ['Completion Rate', `${categoryDetails.statistics.payment_completion_rate}%`],
      [],
      categoryDetailFilter === 'paid' 
        ? ['Full Name', 'Matric Number', 'Email', 'Level', 'Department', 'Amount Paid (NGN)', 'Payment Date']
        : ['Full Name', 'Matric Number', 'Email', 'Level', 'Department', 'Status'],
      ...students.map(student => 
        categoryDetailFilter === 'paid'
          ? [
              student.full_name,
              student.matric_number,
              student.email,
              student.level.toString(),
              student.department,
              student.amount_paid.toFixed(2),
              student.paid_at ? format(new Date(student.paid_at), 'yyyy-MM-dd HH:mm:ss') : 'N/A'
            ]
          : [
              student.full_name,
              student.matric_number,
              student.email,
              student.level.toString(),
              student.department,
              'Unpaid'
            ]
      )
    ];

    const csvContent = csvData.map(row => 
      row.map(cell => {
        const cellStr = String(cell);
        if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
          return `"${cellStr.replace(/"/g, '""')}"`;
        }
        return cellStr;
      }).join(',')
    ).join('\n');
    
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    
    const fileName = `${categoryDetails.category.title.replace(/\s+/g, '_')}_${reportType}_Students_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: 'Success',
      description: `${reportType} students report exported successfully`
    });
  };

  // Calculate stats from current transactions
  const calculateStats = () => {
    const completed = transactions.filter(t => t.payment_status === 'completed');
    const totalRevenue = completed.reduce((sum, t) => sum + t.original_amount, 0);

    return {
      totalRevenue,
      totalTransactions: transactionsPagination?.total_count || 0,
      successfulTransactions: completed.length,
      studentCount: studentsPagination?.total_count || 0
    };
  };

  const stats = calculateStats();

  // Paginate category detail students (client-side)
  const currentCategoryStudents = categoryDetailFilter === 'paid' 
    ? categoryDetails?.students_paid || []
    : categoryDetails?.students_unpaid || [];
  const paginatedCategoryStudents = currentCategoryStudents.slice(
    (categoryDetailPage - 1) * categoryDetailPerPage,
    categoryDetailPage * categoryDetailPerPage
  );
  const totalCategoryPages = Math.ceil(currentCategoryStudents.length / categoryDetailPerPage);

  // Effect to fetch data on mount
  useEffect(() => {
    fetchTransactions(1);
    fetchCategories(1);
    fetchStudents(1);
  }, []);

  // Effect for transactions page change
useEffect(() => {
  if (activeTab === 'transactions') {
    fetchTransactions(transactionsPage);
  }
}, [transactionsPage, debouncedSearchQuery, statusFilter]);

// Reset pagination when status filter changes
useEffect(() => {
  setTransactionsPage(1);
}, [statusFilter]);

  // Effect for categories page change
useEffect(() => {
  if (activeTab === 'categories') {
    fetchCategories(categoriesPage);
  }
}, [categoriesPage, debouncedSearchQuery]);

  // Effect for students page change
  useEffect(() => {
    if (activeTab === 'students') {
      fetchStudents(studentsPage);
    }
  }, [studentsPage, debouncedSearchQuery]);

  // Reset pagination when search changes
  useEffect(() => {
    setTransactionsPage(1);
    setStudentsPage(1);
    setCategoriesPage(1);
  }, [debouncedSearchQuery]);

  // Reset pagination when status filter changes
  useEffect(() => {
    setTransactionsPage(1);
  }, [statusFilter]);

  // Reset category detail page when filter changes
  useEffect(() => {
    setCategoryDetailPage(1);
  }, [categoryDetailFilter]);

  const statsData = [
    {
      label: 'Total Revenue',
      value: `₦${stats.totalRevenue.toLocaleString()}`,
      icon: TrendingUp,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      label: 'Total Transactions',
      value: stats.totalTransactions.toString(),
      icon: CreditCard,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      label: 'Successful',
      value: stats.successfulTransactions.toString(),
      icon: CheckCircle2,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      label: 'Registered Students',
      value: stats.studentCount.toString(),
      icon: Users,
      color: 'text-secondary',
      bgColor: 'bg-secondary/10',
    },
  ];

  // Empty state component
  const EmptyState = ({ message, icon: Icon }: { message: string, icon: any }) => (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <p className="text-lg font-medium text-muted-foreground">{message}</p>
    </div>
  );

  const Pagination = ({ 
    currentPage, 
    totalPages, 
    onPageChange,
    totalItems,
    itemsPerPage
  }: { 
    currentPage: number; 
    totalPages: number; 
    onPageChange: (page: number) => void;
    totalItems: number;
    itemsPerPage: number;
  }) => {
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
      const pages = [];
      const maxVisible = 5;
      
      if (totalPages <= maxVisible) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        if (currentPage <= 3) {
          for (let i = 1; i <= 4; i++) pages.push(i);
          pages.push('...');
          pages.push(totalPages);
        } else if (currentPage >= totalPages - 2) {
          pages.push(1);
          pages.push('...');
          for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
        } else {
          pages.push(1);
          pages.push('...');
          for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
          pages.push('...');
          pages.push(totalPages);
        }
      }
      
      return pages;
    };
    const pageNumbers = getPageNumbers();
    return (
  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-border bg-muted/20">
    <div className="text-sm text-muted-foreground">
      Showing <span className="font-medium text-foreground">{startItem}</span> to{' '}
      <span className="font-medium text-foreground">{endItem}</span> of{' '}
      <span className="font-medium text-foreground">{totalItems}</span> results
    </div>

    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3"
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Prev
      </Button>
      
      <div className="flex items-center gap-1">
        {pageNumbers.map((page, index) => (
          page === '...' ? (
            <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground">
              ...
            </span>
          ) : (
            <Button
              key={page}
              variant={currentPage === page ? 'default' : 'outline'}
              size="sm"
              onClick={() => onPageChange(page as number)}
              className={`min-w-[2.5rem] ${
                currentPage === page 
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                  : 'hover:bg-muted'
              }`}
            >
              {page}
            </Button>
          )
        ))}
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3"
      >
        Next
        <ChevronRight className="h-4 w-4 ml-1" />
      </Button>
    </div>
  </div>
);
};
return (
<Layout showFooter={false}>
<div className="min-h-[calc(100vh-4rem)] bg-muted/30">
<div className="container py-8">
{/* Header */}
<motion.div
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
>
<div>
<h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">
Admin Dashboard
</h1>
<p className="text-muted-foreground">
Manage payments and view reports
</p>
</div>
<div className="flex gap-3">
<Button variant="outline" onClick={handleExportReport}>
<Download className="h-4 w-4 mr-2" />
Export Report
</Button>
<Button variant="hero" onClick={() => setShowCreateDialog(true)}>
<Plus className="h-4 w-4 mr-2" />
Add Category
</Button>
</div>
</motion.div>
{/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {statsData.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-card rounded-2xl p-6 border border-border shadow-card"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`h-12 w-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground mb-1">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {[
          { id: 'transactions', label: 'Transactions', count: transactionsPagination?.total_count || 0 },
          { id: 'categories', label: 'Payment Categories', count: categoriesPagination?.total_count || 0 },
          { id: 'students', label: 'Students', count: studentsPagination?.total_count || 0 },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-card text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
              activeTab === tab.id
                ? 'bg-primary-foreground/20'
                : 'bg-muted'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-card rounded-2xl border border-border shadow-card overflow-hidden"
      >
        {/* Search & Filters */}
        <div className="p-6 border-b border-border">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder={`Search ${activeTab}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            {activeTab === 'transactions' && (
  <div className="flex gap-2">
    <Button 
      variant={statusFilter === 'completed' ? 'default' : 'outline'} 
      size="sm"
      onClick={() => setStatusFilter('completed')}
    >
      Completed
    </Button>
    <Button 
      variant={statusFilter === 'failed' ? 'default' : 'outline'} 
      size="sm"
      onClick={() => setStatusFilter('failed')}
    >
      Failed
    </Button>
  </div>
)}
          </div>
        </div>

        {/* Transactions Table */}
        {activeTab === 'transactions' && (
          <>
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : transactions.length === 0 ? (
              <EmptyState 
    message={
      statusFilter === 'completed' 
        ? "No completed transactions" 
        : "No failed transactions"
    }
    icon={FileText}
  />
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-4">Reference</th>
                        <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-4">Student</th>
                        <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-4">Category</th>
                        <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-4">Amount</th>
                        <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-4">Status</th>
                        <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-4">Date</th>
                        <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {transactions.map((transaction) => (
                        <tr key={transaction.id} className="hover:bg-muted/50 transition-colors">
                          <td className="px-6 py-4">
                            <span className="font-mono text-sm">{transaction.payment_reference}</span>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-medium text-foreground">{transaction.student_name}</p>
                              <p className="text-sm text-muted-foreground">{transaction.student_matric}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-foreground">{transaction.category_name}</td>
                          <td className="px-6 py-4 font-semibold text-foreground">
                            ₦{transaction.original_amount.toLocaleString()}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                              transaction.payment_status === 'completed'
                                ? 'bg-success/10 text-success'
                                : transaction.payment_status === 'pending'
                                ? 'bg-warning/10 text-warning'
                                : 'bg-destructive/10 text-destructive'
                            }`}>
                              {transaction.payment_status === 'completed' && <CheckCircle2 className="h-3 w-3" />}
                              {transaction.payment_status === 'pending' && <Clock className="h-3 w-3" />}
                              {transaction.payment_status === 'failed' && <AlertCircle className="h-3 w-3" />}
                              {transaction.payment_status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-muted-foreground text-sm">
                            {transaction.created_at && format(new Date(transaction.created_at), 'MMM dd, yyyy')}
                          </td>
                          <td className="px-6 py-4">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleViewTransaction(transaction)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {transactionsPagination && transactionsPagination.total_pages > 1 && (
                  <Pagination 
                    currentPage={transactionsPagination.current_page}
                    totalPages={transactionsPagination.total_pages}
                    onPageChange={setTransactionsPage}
                    totalItems={transactionsPagination.total_count}
                    itemsPerPage={transactionsPagination.limit}
                  />
                )}
              </>
            )}
          </>
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <>
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : (
              <>
                <div className="p-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    {categories.map((category) => (
                      <div
                        key={category.id}
                        className={`p-6 rounded-xl border-2 cursor-pointer transition-all hover:shadow-lg ${
                          category.is_active ? 'border-primary/20 bg-primary/5' : 'border-border bg-muted/30'
                        }`}
                        onClick={() => handleViewCategoryDetails(category.id)}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="font-semibold text-foreground">{category.title}</h3>
                            <p className="text-sm text-muted-foreground">{category.description}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
  onClick={(e) => {
    e.stopPropagation();
    handleToggleCategoryStatus(category.id);
  }}
  disabled={togglingCategory === category.id}
  className={`px-2 py-1 rounded-full text-xs font-medium min-w-[70px] ${
    category.is_active
      ? 'bg-success/10 text-success'
      : 'bg-muted text-muted-foreground'
  } ${togglingCategory === category.id ? 'opacity-50' : ''}`}
>
  {togglingCategory === category.id ? (
    <span className="flex items-center gap-1">
      <div className="animate-spin h-3 w-3 border-2 border-current border-t-transparent rounded-full"></div>
      ...
    </span>
  ) : (
    category.is_active ? 'Active' : 'Inactive'
  )}
</button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditDialog(category);
                              }}
                            >
                              <Edit className="h-4 w-4 text-primary" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                setCategoryToDelete(category.id);
                                setShowDeleteDialog(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold text-primary">
                            ₦{category.amount.toLocaleString()}
                          </span>
                          {category.deadline && (
                            <span className="text-sm text-muted-foreground">
                              Due: {format(new Date(category.deadline), 'MMM dd, yyyy')}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {categoriesPagination && categoriesPagination.total_pages > 1 && (
                  <Pagination 
                    currentPage={categoriesPagination.current_page}
                    totalPages={categoriesPagination.total_pages}
                    onPageChange={setCategoriesPage}
                    totalItems={categoriesPagination.total_count}
                    itemsPerPage={categoriesPagination.limit}
                  />
                )}
              </>
            )}
          </>
        )}

        {/* Students Tab */}
        {activeTab === 'students' && (
          <>
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : students.length === 0 ? (
              <EmptyState message="No students found" icon={Users} />
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-4">Student</th>
                        <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-4">Matric Number</th>
                        <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-4">Level</th>
                        <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-4">Department</th>
                        <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-4">Email</th>
                        <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-4">Registered</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {students.map((student) => (
                        <tr key={student.id} className="hover:bg-muted/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="font-semibold text-primary">
                                  {student.full_name.split(' ').map(n => n[0]).join('')}
                                </span>
                              </div>
                              <span className="font-medium text-foreground">{student.full_name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 font-mono text-sm text-foreground">{student.matric_number}</td>
                          <td className="px-6 py-4 text-foreground">{student.level}</td>
                          <td className="px-6 py-4 text-foreground capitalize">{student.department.replace('_', ' ')}</td>
                          <td className="px-6 py-4 text-muted-foreground">{student.email}</td>
                          <td className="px-6 py-4 text-muted-foreground text-sm">
                            {student.created_at && format(new Date(student.created_at), 'MMM dd, yyyy')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {studentsPagination && studentsPagination.total_pages > 1 && (
                  <Pagination 
                    currentPage={studentsPagination.current_page}
                    totalPages={studentsPagination.total_pages}
                    onPageChange={setStudentsPage}
                    totalItems={studentsPagination.total_count}
                    itemsPerPage={studentsPagination.limit}
                  />
                )}
              </>
            )}
          </>
        )}
      </motion.div>
    </div>
  </div>

  {/* All the dialog components remain the same as before... */}
  {/* Create Category Dialog */}
  <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
    <DialogContent className="bg-card">
      <DialogHeader>
        <DialogTitle>Create Payment Category</DialogTitle>
        <DialogDescription>
          Add a new payment category for students
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4 mt-4">
        <div>
          <Label>Category Name</Label>
          <Input 
            placeholder="e.g., NACOS Dues" 
            className="mt-1"
            value={categoryForm.title}
            onChange={(e) => setCategoryForm({ ...categoryForm, title: e.target.value })}
          />
        </div>
        <div>
          <Label>Amount (₦)</Label>
          <Input 
            type="number" 
            placeholder="5000" 
            className="mt-1"
            value={categoryForm.amount}
            onChange={(e) => setCategoryForm({ ...categoryForm, amount: e.target.value })}
          />
        </div>
        <div>
          <Label>Description</Label>
          <Textarea 
            placeholder="Brief description..." 
            className="mt-1"
            value={categoryForm.description}
            onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
          />
        </div>
        <div>
          <Label>Deadline</Label>
          <Input 
            type="date" 
            className="mt-1"
            value={categoryForm.deadline}
            onChange={(e) => setCategoryForm({ ...categoryForm, deadline: e.target.value })}
          />
        </div>
        <Button 
          variant="hero" 
          className="w-full"
          onClick={handleCreateCategory}
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create Category'}
        </Button>
      </div>
    </DialogContent>
  </Dialog>

  {/* Edit Category Dialog */}
  <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
    <DialogContent className="bg-card">
      <DialogHeader>
        <DialogTitle>Edit Payment Category</DialogTitle>
        <DialogDescription>
          Update the payment category details
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4 mt-4">
        <div>
          <Label>Category Name</Label>
          <Input 
            placeholder="e.g., NACOS Dues" 
            className="mt-1"
            value={categoryForm.title}
            onChange={(e) => setCategoryForm({ ...categoryForm, title: e.target.value })}
          />
        </div>
        <div>
          <Label>Amount (₦)</Label>
          <Input 
            type="number" 
            placeholder="5000" 
            className="mt-1"
            value={categoryForm.amount}
            onChange={(e) => setCategoryForm({ ...categoryForm, amount: e.target.value })}
          />
        </div>
        <div>
          <Label>Description</Label>
          <Textarea 
            placeholder="Brief description..." 
            className="mt-1"
            value={categoryForm.description}
            onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
          />
        </div>
        <div>
          <Label>Deadline</Label>
          <Input 
            type="date" 
            className="mt-1"
            value={categoryForm.deadline}
            onChange={(e) => setCategoryForm({ ...categoryForm, deadline: e.target.value })}
          />
        </div>
        <Button 
          variant="hero" 
          className="w-full"
          onClick={handleEditCategory}
          disabled={loading}
        >
          {loading ? 'Updating...' : 'Update Category'}
        </Button>
      </div>
    </DialogContent>
  </Dialog>

  {/* Delete Confirmation Dialog */}
  <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
    <DialogContent className="bg-card">
      <DialogHeader>
        <DialogTitle>Delete Category</DialogTitle>
        <DialogDescription>
          Are you sure you want to delete this category? This action cannot be undone.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter className="mt-4 flex-col sm:flex-row gap-2 sm:gap-0">
  <Button 
    variant="outline" 
    onClick={() => {
      setShowDeleteDialog(false);
      setCategoryToDelete(null);
    }}
    className="w-full sm:w-auto"
  >
    Cancel
  </Button>
  <Button 
    variant="destructive"
    onClick={handleDeleteCategory}
    disabled={loading}
    className="w-full sm:w-auto"
  >
    {loading ? 'Deleting...' : 'Delete'}
  </Button>
</DialogFooter>
    </DialogContent>
  </Dialog>

  {/* Transaction Detail Dialog */}
  <Dialog open={showTransactionDetail} onOpenChange={setShowTransactionDetail}>
    <DialogContent className="bg-card max-w-2xl max-h-[85vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Transaction Details</DialogTitle>
      </DialogHeader>
      {selectedTransaction && (
        <div className="space-y-6 mt-4">
          <div className="flex items-center justify-between">
            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
              selectedTransaction.payment_status === 'completed'
                ? 'bg-success/10 text-success'
                : selectedTransaction.payment_status === 'pending'
                ? 'bg-warning/10 text-warning'
                : 'bg-destructive/10 text-destructive'
            }`}>
              {selectedTransaction.payment_status === 'completed' && <CheckCircle2 className="h-4 w-4" />}
              {selectedTransaction.payment_status === 'pending' && <Clock className="h-4 w-4" />}
              {selectedTransaction.payment_status === 'failed' && <AlertCircle className="h-4 w-4" />}
              {selectedTransaction.payment_status.toUpperCase()}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">Payment Reference</Label>
              <p className="font-mono text-sm mt-1">{selectedTransaction.payment_reference}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Transaction Reference</Label>
              <p className="font-mono text-sm mt-1">{selectedTransaction.transaction_reference || 'N/A'}</p>
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-semibold mb-3">Student Information</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Name</Label>
                <p className="mt-1">{selectedTransaction.student_name}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Matric Number</Label>
                <p className="mt-1 font-mono">{selectedTransaction.student_matric}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Email</Label>
                <p className="mt-1">{selectedTransaction.student_email}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Phone</Label>
                <p className="mt-1">{selectedTransaction.student_phone}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Level</Label>
                <p className="mt-1">{selectedTransaction.student_level}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Department</Label>
                <p className="mt-1 capitalize">{selectedTransaction.student_department.replace('_', ' ')}</p>
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-semibold mb-3">Payment Details</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label className="text-muted-foreground">Category</Label>
                <p className="font-medium">{selectedTransaction.category_name}</p>
              </div>
              <div className="flex justify-between">
                <Label className="text-muted-foreground">Original Amount</Label>
                <p>₦{selectedTransaction.original_amount.toLocaleString()}</p>
              </div>
              <div className="flex justify-between">
                <Label className="text-muted-foreground">Paystack Charge</Label>
                <p>₦{selectedTransaction.paystack_charge.toLocaleString()}</p>
              </div>
              <div className="flex justify-between border-t pt-2">
                <Label className="font-semibold">Total Amount</Label>
                <p className="font-bold text-lg">₦{selectedTransaction.amount.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Created At</Label>
                <p className="mt-1">{format(new Date(selectedTransaction.created_at), 'PPpp')}</p>
              </div>
              {selectedTransaction.paid_at && (
                <div>
                  <Label className="text-muted-foreground">Paid At</Label>
                  <p className="mt-1">{format(new Date(selectedTransaction.paid_at), 'PPpp')}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </DialogContent>
  </Dialog>

 {/* Category Detail Dialog */}
  <Dialog open={showCategoryDetail} onOpenChange={setShowCategoryDetail}>
    <DialogContent className="bg-card max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Category Details</DialogTitle>
      </DialogHeader>
      {categoryDetails && (
        <div className="space-y-6 mt-4">
          <div className="bg-muted/30 p-4 rounded-lg">
            <h3 className="text-xl font-bold mb-2">{categoryDetails.category.title}</h3>
            <p className="text-muted-foreground mb-4">{categoryDetails.category.description}</p>
            <div className="flex items-end gap-14 flex-wrap">
              <div>
                <Label className="text-muted-foreground">Amount</Label>
                <p className="text-lg font-bold text-primary">₦{categoryDetails.category.amount.toLocaleString()}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Deadline</Label>
                <p className="font-medium">{format(new Date(categoryDetails.category.deadline), 'MMM dd, yyyy')}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Status</Label>
                <p className={`font-medium ${categoryDetails.category.is_active ? 'text-success' : 'text-muted-foreground'}`}>
                  {categoryDetails.category.is_active ? 'Active' : 'Inactive'}
                </p>
              </div>
              <div className="ml-auto">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleExportCategoryReport}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export {categoryDetailFilter === 'paid' ? 'Paid' : 'Unpaid'}
                </Button>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-card border rounded-lg p-4">
              <Label className="text-muted-foreground text-xs">Total Revenue</Label>
              <p className="text-2xl font-bold text-success">₦{categoryDetails.statistics.total_revenue.toLocaleString()}</p>
            </div>
            <div className="bg-card border rounded-lg p-4">
              <Label className="text-muted-foreground text-xs">Students Paid</Label>
              <p className="text-2xl font-bold text-primary">{categoryDetails.statistics.students_paid_count}</p>
            </div>
            <div className="bg-card border rounded-lg p-4">
              <Label className="text-muted-foreground text-xs">Students Unpaid</Label>
              <p className="text-2xl font-bold text-warning">{categoryDetails.statistics.students_unpaid_count}</p>
            </div>
            <div className="bg-card border rounded-lg p-4">
              <Label className="text-muted-foreground text-xs">Completion Rate</Label>
              <p className="text-2xl font-bold">{categoryDetails.statistics.payment_completion_rate}%</p>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 border-b">
            <button
              onClick={() => setCategoryDetailFilter('paid')}
              className={`px-4 py-2 font-medium transition-all ${
                categoryDetailFilter === 'paid'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Paid Students ({categoryDetails.statistics.students_paid_count})
            </button>
            <button
              onClick={() => setCategoryDetailFilter('unpaid')}
              className={`px-4 py-2 font-medium transition-all ${
                categoryDetailFilter === 'unpaid'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Unpaid Students ({categoryDetails.statistics.students_unpaid_count})
            </button>
          </div>

          {/* Students List */}
          <div className="space-y-2">
            {paginatedCategoryStudents.length === 0 ? (
              <EmptyState 
                message={categoryDetailFilter === 'paid' ? 'No paid students yet' : 'No unpaid students'}
                icon={Users}
              />
            ) : (
              <>
                {categoryDetailFilter === 'paid' ? (
                  paginatedCategoryStudents.map((student) => (
                    <div key={student.id} className="bg-muted/30 p-4 rounded-lg flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium">{student.full_name}</p>
                        <p className="text-sm text-muted-foreground">{student.matric_number} • {student.email}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Level {student.level} • {student.department}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-success">₦{student.amount_paid.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">
                          {student.paid_at && format(new Date(student.paid_at), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  paginatedCategoryStudents.map((student) => (
                    <div key={student.id} className="bg-muted/30 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{student.full_name}</p>
                          <p className="text-sm text-muted-foreground">{student.matric_number} • {student.email}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Level {student.level} • {student.department}
                          </p>
                        </div>
                        <span className="text-warning font-medium">Unpaid</span>
                      </div>
                    </div>
                  ))
                )}
              </>
            )}
          </div>

          {/* Pagination for Category Details */}
          {totalCategoryPages > 1 && (
            <Pagination 
              currentPage={categoryDetailPage}
              totalPages={totalCategoryPages}
              onPageChange={setCategoryDetailPage}
              totalItems={currentCategoryStudents.length}
              itemsPerPage={categoryDetailPerPage}
            />
          )}
        </div>
      )}
    </DialogContent>
  </Dialog>
</Layout>
);
};

export default AdminDashboard;