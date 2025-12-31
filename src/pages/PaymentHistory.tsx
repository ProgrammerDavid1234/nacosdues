import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { 
  Search,
  Download,
  CheckCircle2,
  Clock,
  AlertCircle,
  Filter,
  Loader2,
  ChevronLeft,
  ChevronRight,
  X,
  ArrowLeft
} from 'lucide-react';
import { format } from 'date-fns';
import axios from 'axios';
import jsPDF from "jspdf";
import { ReceiptContent } from '@/pages/Receipt';
import { createRoot } from 'react-dom/client';
import { domToPng } from 'modern-screenshot';
import { API_BASE_URL } from '@/components/api/api';

interface PaymentHistoryItem {
  id: string;
  category_id: string;
  category_name: string;
  amount: number;
  paystack_charge: number;
  total_amount: number;
  status: string;
  payment_reference: string;
  transaction_reference?: string;
  transaction_date: string;
  paid_at?: string;
}

interface PaymentHistoryResponse {
  items: PaymentHistoryItem[];
  total: number;
  skip: number;
  limit: number;
}

interface PaymentStatistics {
  total_transactions: number;
  completed_transactions: number;
  pending_transactions: number;
  failed_transactions: number;
  total_spent: number;
  total_charges: number;
  total_paid: number;
  category_breakdown: Record<string, { count: number; total_amount: number }>;
  average_transaction: number;
  most_recent_payment?: {
    date: string;
    amount: number;
    category: string;
  };
}

const PaymentHistory: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [payments, setPayments] = useState<PaymentHistoryItem[]>([]);
  const [statistics, setStatistics] = useState<PaymentStatistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [downloadingReceipt, setDownloadingReceipt] = useState<string | null>(null);
  const [initialLoad, setInitialLoad] = useState(true);
  const itemsPerPage = 10;

  // Single initial fetch
  useEffect(() => {
    const initialFetch = async () => {
      setLoading(true);
      setStatsLoading(true);
      await Promise.all([fetchStatistics(), fetchPaymentHistory()]);
      setInitialLoad(false);
    };
    initialFetch();
  }, []);

  // Fetch on pagination and filter changes (but not on mount)
  useEffect(() => {
    if (!initialLoad) {
      fetchPaymentHistory();
    }
  }, [currentPage, statusFilter]);

  // Debounced search
  useEffect(() => {
    if (initialLoad) return;
    
    const timer = setTimeout(() => {
      if (currentPage === 1) {
        fetchPaymentHistory();
      } else {
        setCurrentPage(1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchPaymentHistory = async () => {
    try {
      if (!initialLoad) setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const params: any = {
        skip: (currentPage - 1) * itemsPerPage,
        limit: itemsPerPage
      };

      if (searchQuery) params.search = searchQuery;
      if (statusFilter !== 'all') params.status = statusFilter.toUpperCase();

      const response = await axios.get<PaymentHistoryResponse>(
        `${API_BASE_URL}/payment-history/`,
        { headers, params }
      );

      setPayments(response.data.items);
      setTotalRecords(response.data.total);
    } catch (err: any) {
      console.error('Error fetching payment history:', err);
      setError(err.response?.data?.detail || 'Failed to load payment history');
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      if (!initialLoad) setStatsLoading(true);
      
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const response = await axios.get<PaymentStatistics>(
        `${API_BASE_URL}/payment-history/statistics`,
        { headers }
      );

      setStatistics(response.data);
    } catch (err) {
      console.error('Error fetching statistics:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  const handleDownloadReceipt = async (payment: PaymentHistoryItem) => {
  try {
    setDownloadingReceipt(payment.id);
    setError(null);

    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    const response = await axios.get(
      `${API_BASE_URL}/receipt/${payment.id}`,
      { headers }
    );

    const receiptData = response.data;

    // Create hidden container
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.style.width = '800px';
    document.body.appendChild(container);

    // Render receipt
    const root = createRoot(container);
    root.render(<ReceiptContent payment={receiptData} />);

    // Wait for images to load
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Convert to PNG
    const dataUrl = await domToPng(container.firstChild as HTMLElement, {
      quality: 1.0,
      backgroundColor: '#ffffff',
      scale: 2,
      features: {
        removeControlCharacter: true
      }
    });

    // Create PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pdfWidth - 20;
    const receiptElement = container.firstChild as HTMLElement;
    const imgHeight = (imgWidth) * (receiptElement.offsetHeight / receiptElement.offsetWidth);

    // Center vertically if receipt is smaller than page
    const yPos = imgHeight < pdfHeight ? (pdfHeight - imgHeight) / 2 : 10;

    pdf.addImage(dataUrl, 'PNG', 10, yPos, imgWidth, imgHeight, undefined, 'FAST');
    pdf.save(`NACOS_Receipt_${payment.payment_reference}.pdf`);

    // Cleanup
    root.unmount();
    document.body.removeChild(container);

  } catch (err: any) {
    console.error('Error downloading receipt:', err);
    if (err.response?.status === 404) {
      setError('Receipt not found. This payment may not be completed yet.');
    } else {
      setError('Failed to download receipt. Please try again.');
    }
  } finally {
    setDownloadingReceipt(null);
  }
};

  const getStatusConfig = (status: string) => {
    const upperStatus = status.toUpperCase();
    if (upperStatus === 'COMPLETED') {
      return {
        bg: 'bg-green-500',
        text: 'text-white',
        iconBg: 'bg-green-50',
        iconColor: 'text-green-600',
        icon: CheckCircle2
      };
    }
    if (upperStatus === 'PENDING') {
      return {
        bg: 'bg-yellow-500',
        text: 'text-white',
        iconBg: 'bg-yellow-50',
        iconColor: 'text-yellow-600',
        icon: Clock
      };
    }
    return {
      bg: 'bg-red-500',
      text: 'text-white',
      iconBg: 'bg-red-50',
      iconColor: 'text-red-600',
      icon: AlertCircle
    };
  };

  const isCompleted = (status: string) => {
    return status.toUpperCase() === 'COMPLETED';
  };

  const totalPages = Math.ceil(totalRecords / itemsPerPage);

  // Show full-page loading only on initial load
  if (initialLoad) {
    return (
      <Layout showFooter={false}>
        <div className="min-h-[calc(100vh-4rem)] bg-muted/30 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading payment history...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showFooter={false}>
      <div className="min-h-[calc(100vh-4rem)] bg-muted/30">
        <div className="container py-4 md:py-8 px-4">
          {/* Back Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="mb-4 -ml-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <h1 className="text-xl md:text-3xl font-bold text-foreground mb-1">
              Payment History
            </h1>
            <p className="text-sm md:text-base text-muted-foreground">
              {totalRecords} {totalRecords === 1 ? 'transaction' : 'transactions'}
            </p>
          </motion.div>

          {/* Statistics Cards - Horizontal scroll on mobile */}
          {!statsLoading && statistics && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 overflow-x-auto pb-2 -mx-4 px-4"
            >
              <div className="flex gap-3 md:grid md:grid-cols-4 min-w-max md:min-w-0">
                <div className="bg-card rounded-xl p-4 border border-border shadow-sm min-w-[160px] md:min-w-0">
                  <p className="text-xs text-muted-foreground mb-1">Total Spent</p>
                  <p className="text-lg md:text-2xl font-bold text-foreground">
                    ₦{statistics.total_spent.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    +₦{statistics.total_charges.toLocaleString()} fees
                  </p>
                </div>
                <div className="bg-card rounded-xl p-4 border border-border shadow-sm min-w-[160px] md:min-w-0">
                  <p className="text-xs text-muted-foreground mb-1">Completed</p>
                  <p className="text-lg md:text-2xl font-bold text-green-600">
                    {statistics.completed_transactions}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">transactions</p>
                </div>
                <div className="bg-card rounded-xl p-4 border border-border shadow-sm min-w-[160px] md:min-w-0">
                  <p className="text-xs text-muted-foreground mb-1">Pending</p>
                  <p className="text-lg md:text-2xl font-bold text-yellow-600">
                    {statistics.pending_transactions}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">transactions</p>
                </div>
                <div className="bg-card rounded-xl p-4 border border-border shadow-sm min-w-[160px] md:min-w-0">
                  <p className="text-xs text-muted-foreground mb-1">Average</p>
                  <p className="text-lg md:text-2xl font-bold text-foreground">
                    ₦{Math.round(statistics.average_transaction).toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">per txn</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card rounded-xl border border-border p-3 md:p-4 mb-4 md:mb-6 shadow-sm"
          >
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by reference, category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 md:h-10 text-sm"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {['all', 'completed', 'pending', 'failed'].map((status) => (
                  <Button
                    key={status}
                    variant={statusFilter === status ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setStatusFilter(status)}
                    className="capitalize text-xs md:text-sm whitespace-nowrap h-8"
                  >
                    {status}
                  </Button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg p-3 mb-4 flex items-start gap-2"
            >
              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-red-600 dark:text-red-500 text-sm">{error}</p>
              </div>
              <button 
                onClick={() => setError(null)} 
                className="text-red-600 dark:text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          )}

          {/* Transactions List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-3 md:space-y-4"
          >
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : payments.length > 0 ? (
              <>
                {payments.map((payment, index) => {
                  const statusConfig = getStatusConfig(payment.status);
                  const completed = isCompleted(payment.status);
                  const isDownloading = downloadingReceipt === payment.id;
                  const StatusIcon = statusConfig.icon;
                  
                  return (
                    <motion.div
                      key={payment.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="bg-card rounded-xl border border-border p-4 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="space-y-3">
                        {/* Top Row: Icon, Title, Status */}
                        <div className="flex items-start gap-3">
                          <div className={`h-10 w-10 md:h-12 md:w-12 rounded-lg flex items-center justify-center flex-shrink-0 ${statusConfig.iconBg} dark:bg-opacity-20`}>
                            <StatusIcon className={`h-5 w-5 md:h-6 md:w-6 ${statusConfig.iconColor}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-foreground text-sm md:text-base truncate">
                              {payment.category_name}
                            </h3>
                            <p className="text-xs md:text-sm text-muted-foreground font-mono truncate">
                              {payment.payment_reference}
                            </p>
                          </div>
                          <span className={`px-2 py-0.5 md:px-2.5 md:py-1 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0 ${statusConfig.bg} ${statusConfig.text}`}>
                            {payment.status.toLowerCase()}
                          </span>
                        </div>

                        {/* Amount and Date Row */}
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-base md:text-lg font-bold text-foreground">
                              ₦{payment.amount.toLocaleString()}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(payment.transaction_date), 'MMM dd, yyyy')}
                            </p>
                          </div>
                          
                          {/* Download Button */}
                          {completed && (
                            <button
                              onClick={() => handleDownloadReceipt(payment)}
                              disabled={isDownloading}
                              className={`p-2 rounded-lg transition-all ${
                                isDownloading
                                  ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed'
                                  : 'bg-blue-50 dark:bg-blue-950/30 hover:bg-blue-100 dark:hover:bg-blue-950/50 text-blue-600 dark:text-blue-400'
                              }`}
                              title="Download Receipt"
                            >
                              {isDownloading ? (
                                <Loader2 className="h-4 w-4 md:h-5 md:w-5 animate-spin" />
                              ) : (
                                <Download className="h-4 w-4 md:h-5 md:w-5" />
                              )}
                            </button>
                          )}
                        </div>

                        {/* Additional Details */}
                        <div className="pt-3 border-t border-border flex flex-wrap gap-x-4 gap-y-1 text-xs">
                          <span className="text-muted-foreground">
                            Gateway Fee: <span className="text-foreground font-medium">₦{payment.paystack_charge.toLocaleString()}</span>
                          </span>
                          {payment.paid_at && (
                            <span className="text-muted-foreground">
                              Paid at: <span className="text-foreground font-medium">{format(new Date(payment.paid_at), 'HH:mm')}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="pt-4 md:pt-6">
                    <div className="flex gap-2 justify-center items-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="h-9 px-3"
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        <span className="hidden sm:inline">Previous</span>
                        <span className="sm:hidden">Prev</span>
                      </Button>
                      
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-medium text-foreground">Page</span>
                        <span className="text-sm font-bold text-primary">{currentPage}</span>
                        <span className="text-sm text-muted-foreground">of</span>
                        <span className="text-sm font-medium text-foreground">{totalPages}</span>
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="h-9 px-3"
                      >
                        <span className="hidden sm:inline">Next</span>
                        <span className="sm:hidden">Next</span>
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-card rounded-xl border border-border p-8 md:p-12 text-center">
                <Filter className="h-10 w-10 md:h-12 md:w-12 text-muted-foreground mx-auto mb-3" />
                <h3 className="font-semibold text-foreground mb-1 text-sm md:text-base">No Transactions Found</h3>
                <p className="text-xs md:text-sm text-muted-foreground">
                  {searchQuery || statusFilter !== 'all'
                    ? 'Try adjusting your filters'
                    : 'You haven\'t made any payments yet'}
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default PaymentHistory;