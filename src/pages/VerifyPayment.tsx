import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  AlertCircle,
  Home,
  Receipt as ReceiptIcon,
  RefreshCw
} from 'lucide-react';
import Layout from '@/components/layout/Layout';
import axios from 'axios';
import { API_BASE_URL } from '@/components/api/api';

interface VerificationResponse {
  status: string;
  message: string;
  data?: {
    id: string;
    reference: string;
    amount: number;
    category_name: string;
    transaction_date: string;
    payment_status: string;
    [key: string]: any;
  };
}

interface ReceiptData {
  id: string;
  category: {
    id: string;
    name: string;
    description?: string;
  };
  original_amount: number;
  paystack_charge: number;
  total_amount: number;
  status: string;
  payment_reference: string;
  transaction_reference?: string;
  created_at: string;
  paid_at?: string;
  updated_at?: string;
  student: {
    id: string;
    full_name: string;
    email: string;
    matric_number: string;
    phone_number: string;
    level: string;
    department: string;
  };
}

const VerifyPayment: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [verifying, setVerifying] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState<'success' | 'failed' | 'pending' | null>(null);
  const [message, setMessage] = useState('');
  const [paymentData, setPaymentData] = useState<any>(null);
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);
  const [error, setError] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const [fetchingReceipt, setFetchingReceipt] = useState(false);

  const reference = searchParams.get('reference') || searchParams.get('trxref');

  useEffect(() => {
    if (reference) {
      verifyPayment(reference);
    } else {
      setVerifying(false);
      setVerificationStatus('failed');
      setError('No payment reference provided');
    }
  }, [reference, retryCount]);

  const fetchReceiptData = async (ref: string) => {
    try {
      setFetchingReceipt(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication required');
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const response = await axios.get<ReceiptData>(
        `${API_BASE_URL}/receipt/reference/${ref}`,
        { headers }
      );

      console.log('Receipt data:', response.data);
      setReceiptData(response.data);

      const receiptForStorage = {
        id: response.data.id,
        category_name: response.data.category.name,
        amount: response.data.original_amount,
        paystack_charge: response.data.paystack_charge,
        total_amount: response.data.total_amount,
        payment_reference: response.data.payment_reference,
        transaction_reference: response.data.transaction_reference,
        transaction_date: response.data.created_at,
        paid_at: response.data.paid_at,
        user: response.data.student
      };

      const savedPayments = JSON.parse(localStorage.getItem('nacos_payments') || '[]');
      const existingIndex = savedPayments.findIndex((p: any) => 
        p.payment_reference === ref || p.id === response.data.id
      );
      
      if (existingIndex >= 0) {
        savedPayments[existingIndex] = receiptForStorage;
      } else {
        savedPayments.push(receiptForStorage);
      }
      
      localStorage.setItem('nacos_payments', JSON.stringify(savedPayments));

      return response.data;
    } catch (err: any) {
      console.error('Error fetching receipt data:', err);
      return null;
    } finally {
      setFetchingReceipt(false);
    }
  };

  const verifyPayment = async (ref: string) => {
    try {
      setVerifying(true);
      setError('');

      const token = localStorage.getItem('token');
      const headers: any = {
        'Content-Type': 'application/json'
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await axios.post(
        `${API_BASE_URL}/orders/verify/${ref}`,
        {},  
        { headers }  
      );

      console.log('Verification response:', response.data);

      const responseData: any = response.data;
      
      if (responseData.payment_status || responseData.id) {
        const mappedData = {
          id: responseData.id,
          reference: responseData.payment_reference || responseData.transaction_reference,
          amount: responseData.amount || responseData.original_amount,
          category_name: responseData.payment_for?.title,
          transaction_date: responseData.created_at,
          payment_status: responseData.payment_status
        };

        if (responseData.payment_status === 'completed' || responseData.payment_status === 'success') {
          setVerificationStatus('success');
          setMessage('Payment verified successfully!');
          setPaymentData(mappedData);

          if (token) {
            await fetchReceiptData(ref);
          }
        } else if (responseData.payment_status === 'pending') {
          setVerificationStatus('pending');
          setMessage('Payment is still being processed...');
          setPaymentData(mappedData);
        } else {
          setVerificationStatus('failed');
          setMessage('Payment verification failed');
          setError('Unable to verify payment');
        }
      }
      else if (responseData.status) {
        if (responseData.status === 'success') {
          setVerificationStatus('success');
          setMessage(responseData.message || 'Payment verified successfully!');
          setPaymentData(responseData.data);

          if (token) {
            await fetchReceiptData(ref);
          }
        } else if (responseData.status === 'pending') {
          setVerificationStatus('pending');
          setMessage(responseData.message || 'Payment is still being processed...');
          setPaymentData(responseData.data);
        } else {
          setVerificationStatus('failed');
          setMessage(responseData.message || 'Payment verification failed');
          setError(responseData.message || 'Unable to verify payment');
        }
      }
    } catch (err: any) {
      console.error('Verification error:', err);
      setVerificationStatus('failed');
      
      const errorMessage = err.message || '';
      const isNetworkError = errorMessage.includes('SSL') || 
                            errorMessage.includes('ECONNREFUSED') || 
                            errorMessage.includes('Network Error') ||
                            errorMessage.includes('timeout');
      
      if (isNetworkError) {
        setError('Unable to connect to the server. Please check your internet connection and try again.');
      } else if (err.response?.status === 404) {
        setError('Payment reference not found. Please check and try again.');
      } else if (err.response?.status === 400) {
        setError(err.response.data?.detail || 'Invalid payment reference');
      } else if (err.response?.status === 401) {
        setError('Authentication failed. Please log in again.');
      } else if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError('An error occurred while verifying payment. Please try again.');
      }
      setMessage('Verification failed');
    } finally {
      setVerifying(false);
    }
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  const handleViewReceipt = () => {
    if (receiptData?.id) {
      navigate(`/receipt/${receiptData.id}`);
    } else if (paymentData?.id) {
      navigate(`/receipt/${paymentData.id}`);
    } else if (reference) {
      navigate(`/receipt/${reference}`);
    }
  };

  const getStatusIcon = () => {
    if (verifying) {
      return <Loader2 className="h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 animate-spin text-blue-600" />;
    }
    
    switch (verificationStatus) {
      case 'success':
        return (
          <div className="relative">
            <div className="absolute inset-0 bg-green-400 rounded-full blur-xl opacity-50 animate-pulse"></div>
            <CheckCircle2 className="h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 text-green-600 relative z-10" strokeWidth={2} />
          </div>
        );
      case 'pending':
        return (
          <div className="relative">
            <div className="absolute inset-0 bg-yellow-400 rounded-full blur-xl opacity-50 animate-pulse"></div>
            <AlertCircle className="h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 text-yellow-600 relative z-10" strokeWidth={2} />
          </div>
        );
      case 'failed':
        return (
          <div className="relative">
            <div className="absolute inset-0 bg-red-400 rounded-full blur-xl opacity-30"></div>
            <XCircle className="h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 text-red-600 relative z-10" strokeWidth={2} />
          </div>
        );
      default:
        return <AlertCircle className="h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 text-gray-400" />;
    }
  };

  const getStatusColor = () => {
    switch (verificationStatus) {
      case 'success':
        return {
          bg: 'from-green-500 to-emerald-500',
          text: 'text-green-600',
          cardBg: 'from-green-50 to-emerald-50',
          border: 'border-green-200'
        };
      case 'pending':
        return {
          bg: 'from-yellow-500 to-amber-500',
          text: 'text-yellow-600',
          cardBg: 'from-yellow-50 to-amber-50',
          border: 'border-yellow-200'
        };
      case 'failed':
        return {
          bg: 'from-red-500 to-rose-500',
          text: 'text-red-600',
          cardBg: 'from-red-50 to-rose-50',
          border: 'border-red-200'
        };
      default:
        return {
          bg: 'from-gray-500 to-slate-500',
          text: 'text-gray-600',
          cardBg: 'from-gray-50 to-slate-50',
          border: 'border-gray-200'
        };
    }
  };

  const colors = getStatusColor();

  return (
    <Layout>
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-gray-50 via-white to-gray-100 py-6 sm:py-8 md:py-12 px-4">
        <div className="container max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={`bg-gradient-to-br ${colors.cardBg} rounded-2xl sm:rounded-3xl border-2 ${colors.border} shadow-2xl overflow-hidden`}
          >
            {/* Header */}
            <div className={`bg-gradient-to-r ${colors.bg} p-4 sm:p-6 md:p-8 text-center relative overflow-hidden`}>
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-32 h-32 sm:w-40 sm:h-40 bg-white rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-0 w-32 h-32 sm:w-40 sm:h-40 bg-white rounded-full blur-3xl"></div>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2 relative z-10">
                {verifying ? 'Verifying Payment' : 
                 verificationStatus === 'success' ? 'Payment Verified!' :
                 verificationStatus === 'pending' ? 'Payment Pending' :
                 'Verification Failed'}
              </h1>
              <p className="text-sm sm:text-base text-white/90 relative z-10">
                {verifying ? 'Please wait while we confirm your payment...' :
                 verificationStatus === 'success' ? 'Your payment has been successfully processed' :
                 verificationStatus === 'pending' ? 'Your payment is being processed' :
                 'Unable to verify your payment'}
              </p>
            </div>

            {/* Body */}
            <div className="p-4 sm:p-6 md:p-8 lg:p-12">
              {/* Status Icon */}
              <div className="flex justify-center mb-6 sm:mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ 
                    type: "spring",
                    stiffness: 260,
                    damping: 20,
                    delay: 0.2 
                  }}
                >
                  {getStatusIcon()}
                </motion.div>
              </div>

              {/* Message */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-center mb-6 sm:mb-8"
              >
                <h2 className={`text-xl sm:text-2xl font-bold mb-2 ${colors.text}`}>
                  {message || 'Processing...'}
                </h2>
                {error && (
                  <p className="text-red-600 text-xs sm:text-sm bg-red-50 border border-red-200 rounded-lg p-3 mt-3">
                    {error}
                  </p>
                )}
                {fetchingReceipt && (
                  <p className="text-blue-600 text-xs sm:text-sm bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3 flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating receipt...
                  </p>
                )}
              </motion.div>

              {/* Payment Details */}
              {(paymentData || receiptData) && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="bg-white rounded-xl sm:rounded-2xl border-2 border-gray-200 p-4 sm:p-6 mb-6 sm:mb-8 shadow-lg"
                >
                  <h3 className="font-semibold text-gray-700 mb-3 sm:mb-4 text-base sm:text-lg">Payment Details</h3>
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0 pb-3 border-b border-gray-200">
                      <span className="text-sm text-gray-600">Reference</span>
                      <span className="font-mono font-semibold text-gray-900 text-xs sm:text-sm break-all">
                        {reference}
                      </span>
                    </div>
                    {(receiptData?.category.name || paymentData?.category_name) && (
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0 pb-3 border-b border-gray-200">
                        <span className="text-sm text-gray-600">Payment For</span>
                        <span className="font-semibold text-gray-900 text-sm">
                          {receiptData?.category.name || paymentData?.category_name}
                        </span>
                      </div>
                    )}
                    {(receiptData?.total_amount || paymentData?.amount) && (
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0 pb-3 border-b border-gray-200">
                        <span className="text-sm text-gray-600">Amount</span>
                        <span className="font-bold text-gray-900 text-lg sm:text-xl">
                          ₦{Number(receiptData?.total_amount || paymentData?.amount).toLocaleString()}
                        </span>
                      </div>
                    )}
                    {(receiptData?.created_at || paymentData?.transaction_date) && (
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0">
                        <span className="text-sm text-gray-600">Date</span>
                        <span className="font-semibold text-gray-900 text-xs sm:text-sm">
                          {new Date(receiptData?.created_at || paymentData?.transaction_date).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="space-y-3"
              >
                {verificationStatus === 'success' && (receiptData || paymentData) && (
                  <Button
                    onClick={handleViewReceipt}
                    disabled={fetchingReceipt}
                    className="w-full h-11 sm:h-12 text-sm sm:text-base font-semibold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg"
                  >
                    {fetchingReceipt ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                        <span className="hidden sm:inline">Preparing Receipt...</span>
                        <span className="sm:hidden">Loading...</span>
                      </>
                    ) : (
                      <>
                        <ReceiptIcon className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                        View Receipt
                      </>
                    )}
                  </Button>
                )}

                {verificationStatus === 'failed' && (
                  <Button
                    onClick={handleRetry}
                    variant="outline"
                    className="w-full h-11 sm:h-12 text-sm sm:text-base font-semibold border-2 hover:bg-blue-50 hover:border-blue-600 hover:text-blue-600"
                    disabled={verifying}
                  >
                    {verifying ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                        Retrying...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                        Retry Verification
                      </>
                    )}
                  </Button>
                )}

                {verificationStatus === 'pending' && (
                  <Button
                    onClick={handleRetry}
                    variant="outline"
                    className="w-full h-11 sm:h-12 text-sm sm:text-base font-semibold border-2 hover:bg-yellow-50 hover:border-yellow-600 hover:text-yellow-600"
                    disabled={verifying}
                  >
                    {verifying ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                        Checking...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                        Check Again
                      </>
                    )}
                  </Button>
                )}

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    asChild
                    variant="outline"
                    className="w-full sm:flex-1 h-11 sm:h-12 text-sm sm:text-base font-semibold border-2"
                  >
                    <Link to="/history">
                      <ReceiptIcon className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                      <span className="hidden sm:inline">Payment History</span>
                      <span className="sm:hidden">History</span>
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="w-full sm:flex-1 h-11 sm:h-12 text-sm sm:text-base font-semibold border-2"
                  >
                    <Link to="/dashboard">
                      <Home className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                      Dashboard
                    </Link>
                  </Button>
                </div>
              </motion.div>

              {/* Help Text */}
              {verificationStatus === 'failed' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="mt-6 text-center text-xs sm:text-sm text-gray-600 bg-gray-50 rounded-lg p-4 border border-gray-200"
                >
                  <p className="mb-2">
                    <strong>Need help?</strong>
                  </p>
                  <p className="break-words">
                    If you continue to experience issues, please contact support with your payment reference: <span className="font-mono font-semibold block sm:inline mt-1 sm:mt-0">{reference}</span>
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default VerifyPayment;