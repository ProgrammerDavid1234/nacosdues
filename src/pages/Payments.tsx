import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
  CreditCard, 
  CheckCircle2, 
  Loader2,
  Shield,
  ChevronRight,
  ArrowLeft,
  AlertCircle,
  RefreshCw,
  User,
  Mail,
  Phone,
  GraduationCap,
  Building2
} from 'lucide-react';
import { format } from 'date-fns';
import { API_BASE_URL } from '@/components/api/api';


interface PaymentCategory {
  id: string;
  title: string;
  description: string | null;
  amount: number;
  deadline: string | null;
  is_active: boolean;
}

interface UserData {
  id: string;
  email: string;
  full_name: string;
  matric_number: string;
  phone_number: string;
  level: string;
  department: string;
}

interface Order {
  id: string;
  full_name: string;
  email: string;
  matric_number: string;
  phone_number: string;
  level: number;
  department: string;
  payment_for_id: string;
  original_amount: number;
  paystack_charge: number;
  amount: number;
  payment_reference: string;
  payment_status: string;
  paid_at: string | null;
  created_at: string;
}

interface CompletedPayment {
  payment_for_id: string;
  payment_status: string;
}

type PaymentStep = 'select' | 'details' | 'verifying' | 'success' | 'failed';

const Payments: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [completedPayments, setCompletedPayments] = useState<CompletedPayment[]>([]);
  const [step, setStep] = useState<PaymentStep>('select');
  const [categories, setCategories] = useState<PaymentCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<PaymentCategory | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAuthToken = () => localStorage.getItem('token');


useEffect(() => {
  setIsProcessing(false);
}, [step]);

useEffect(() => {
  return () => {
    setIsProcessing(false);
  };
}, []);

  // Fetch user data and categories on mount
  useEffect(() => {
    fetchInitialData();
  }, []);

  // Check for payment verification callback
  useEffect(() => {
    const reference = searchParams.get('reference') || searchParams.get('trxref');
    if (reference) {
      handlePaymentCallback(reference);
    }
  }, [searchParams]);

  

  const fetchInitialData = async () => {
  try {
    setLoading(true);
    setError(null);

    const token = getAuthToken();
    if (!token) {
      navigate('/login');
      return;
    }

    const [userRes, categoriesRes, ordersRes] = await Promise.all([
      fetch(`${API_BASE_URL}/students/me`, {
        headers: { Authorization: `Bearer ${token}` }
      }),
      fetch(`${API_BASE_URL}/category/`),
      fetch(`${API_BASE_URL}/orders/my-orders`, {  // Remove the query parameter
        headers: { Authorization: `Bearer ${token}` }
      })
    ]);

    if (!userRes.ok) {
      if (userRes.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }
      throw new Error('Failed to fetch user data');
    }

    if (!categoriesRes.ok) {
      throw new Error('Failed to fetch payment categories');
    }

    const user = await userRes.json();
    const allCategories = await categoriesRes.json();
    
    // Get all orders and filter completed ones on the frontend
    let completedOrders: any[] = [];
    if (ordersRes.ok) {
      const allOrders = await ordersRes.json();
      // Filter for completed orders
      completedOrders = allOrders.filter((order: any) => 
        order.payment_status?.toLowerCase() === 'completed'
      );
      console.log('Completed Orders:', completedOrders);
      setCompletedPayments(completedOrders);
    } else {
      console.error('Failed to fetch orders:', ordersRes.status);
    }

    // Filter out categories that user has already paid for
    const paidCategoryIds = completedOrders.map(order => order.payment_for_id);
    
    console.log('Paid Category IDs:', paidCategoryIds);

    const availableCategories = allCategories.filter(
      (category: PaymentCategory) => !paidCategoryIds.includes(category.id)
    );

    console.log('Available Categories:', availableCategories);

    setUserData(user);
    setCategories(availableCategories);
  } catch (err: any) {
    console.error('Fetch error:', err);
    setError(err.message || 'Failed to load data');
    toast({
      title: 'Error',
      description: 'Failed to load data. Please try again.',
      variant: 'destructive',
    });
  } finally {
    setLoading(false);
  }
};
  const handlePaymentCallback = async (reference: string) => {
  setStep('verifying');
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/orders/verify/${reference}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) {
      throw new Error('Verification failed');
    }

    const order = await response.json();
    setCurrentOrder(order);

    const category = categories.find(c => c.id === order.payment_for_id);
    setSelectedCategory(category || null);

    if (order.payment_status === 'completed') {
      setStep('success');
      toast({
        title: 'Payment Successful!',
        description: `Your payment has been verified.`,
      });
      
      // Refresh categories to remove the paid one
      await fetchInitialData();
    } else {
      setStep('failed');
      toast({
        title: 'Payment Failed',
        description: 'Your payment could not be completed.',
        variant: 'destructive',
      });
    }

    navigate('/payments', { replace: true });
  } catch (err: any) {
    setStep('failed');
    toast({
      title: 'Verification Failed',
      description: 'Could not verify payment',
      variant: 'destructive',
    });
    navigate('/payments', { replace: true });
  }
};
  const handleSelectCategory = (category: PaymentCategory) => {
    setSelectedCategory(category);
    setStep('details');
  };

  const handlePayment = async () => {
    if (!selectedCategory) return;

    setIsProcessing(true);
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/orders/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ payment_for_id: selectedCategory.id })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to create order');
      }

      const data = await response.json();
      
      if (data.payment?.authorization_url) {
        window.location.href = data.payment.authorization_url;
      }
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to initialize payment',
        variant: 'destructive',
      });
      setIsProcessing(false);
    }
  };

const resetPayment = async () => {
  setStep('select');
  setSelectedCategory(null);
  setCurrentOrder(null);
  await fetchInitialData();
};

  // Loading State
  if (loading) {
    return (
      <Layout showFooter={false}>
        <div className="min-h-[calc(100vh-4rem)] bg-muted/30 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showFooter={false}>
      <div className="min-h-[calc(100vh-4rem)] bg-muted/30">
        <div className="container py-8 max-w-3xl">
          
         {/* Header */}
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  className="mb-8"
>
  {/* Back button - Show on select step too, and other steps */}
  {step !== 'verifying' && step !== 'success' && (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => {
        if (step === 'select') {
          navigate(-1); // Go back to previous page
        } else {
          resetPayment(); // Reset to select step
        }
      }}
      className="mb-4"
    >
      <ArrowLeft className="h-4 w-4 mr-2" />
      Back
    </Button>
  )}
  <h1 className="text-2xl md:text-3xl font-bold text-foreground">
    {step === 'select' && 'Make a Payment'}
    {step === 'details' && 'Confirm Payment'}
    {step === 'verifying' && 'Verifying Payment'}
    {step === 'success' && 'Payment Successful'}
    {step === 'failed' && 'Payment Failed'}
  </h1>
</motion.div>

          {/* Error Banner */}
          {error && step === 'select' && (
            <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
              <p className="text-destructive flex-1">{error}</p>
              <Button variant="outline" size="sm" onClick={fetchInitialData}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          )}

          <AnimatePresence mode="wait">
            
            {/* Step 1: Select Category */}
            {step === 'select' && (
              <motion.div
                key="select"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                {categories.length === 0 ? (
                  <div className="text-center py-16 bg-card rounded-2xl border border-border">
                    <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Payments Available</h3>
                    <p className="text-muted-foreground">Check back later for available payments.</p>
                  </div>
                ) : (
                  categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleSelectCategory(category)}
                      className="w-full p-5 rounded-xl bg-card border border-border hover:border-primary/50 hover:shadow-md transition-all text-left flex items-center gap-4 group"
                    >
                      <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <CreditCard className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground">{category.title}</h3>
                        {category.description && (
                          <p className="text-sm text-muted-foreground truncate">{category.description}</p>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-lg font-bold text-primary">₦{category.amount.toLocaleString()}</p>
                        {category.deadline && (
                          <p className="text-xs text-muted-foreground">
                            Due: {format(new Date(category.deadline), 'MMM dd, yyyy')}
                          </p>
                        )}
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                    </button>
                  ))
                )}
              </motion.div>
            )}

            {/* Step 2: Payment Details */}
            {step === 'details' && selectedCategory && userData && (
              <motion.div
                key="details"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="bg-card rounded-2xl border border-border overflow-hidden">
                  
                  {/* Payment Info Header */}
                  <div className="bg-primary/5 p-6 border-b border-border">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center">
                        <CreditCard className="h-7 w-7 text-primary" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-foreground">{selectedCategory.title}</h2>
                        {selectedCategory.description && (
                          <p className="text-sm text-muted-foreground">{selectedCategory.description}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* User Details */}
                  <div className="p-6 space-y-4">
                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                      Student Information
                    </h3>
                    
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <User className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Full Name</p>
                          <p className="font-medium text-foreground">{userData.full_name}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <GraduationCap className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Matric Number</p>
                          <p className="font-medium text-foreground">{userData.matric_number}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <Mail className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Email</p>
                          <p className="font-medium text-foreground text-sm">{userData.email}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <Phone className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Phone</p>
                          <p className="font-medium text-foreground">{userData.phone_number}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <Building2 className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Department</p>
                          <p className="font-medium text-foreground">{userData.department}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <GraduationCap className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Level</p>
                          <p className="font-medium text-foreground">{userData.level} Level</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Amount Breakdown */}
                  <div className="p-6 border-t border-border">
                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-4">
                      Payment Summary
                    </h3>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Amount</span>
                        <span className="font-medium">₦{selectedCategory.amount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Processing Fee</span>
                        <span className="font-medium text-muted-foreground">~₦{Math.min(selectedCategory.amount * 0.015 + 100, 2000).toFixed(2)}</span>
                      </div>
                      <div className="h-px bg-border" />
                      <div className="flex justify-between">
                        <span className="font-semibold">Total</span>
                        <span className="text-xl font-bold text-primary">
                          ₦{(selectedCategory.amount + Math.min(selectedCategory.amount * 0.015 + 100, 2000)).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Pay Button */}
                  <div className="p-6 bg-muted/30 border-t border-border">
                    <Button
                      className="w-full h-12 text-base"
                      onClick={handlePayment}
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Shield className="h-5 w-5 mr-2" />
                          Pay ₦{selectedCategory.amount.toLocaleString()}
                        </>
                      )}
                    </Button>
                    <p className="text-xs text-center text-muted-foreground mt-3 flex items-center justify-center gap-1">
                      <Shield className="h-3 w-3" />
                      Secured by Paystack
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Verifying State */}
            {step === 'verifying' && (
              <motion.div
                key="verifying"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="text-center py-16"
              >
                <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                <h2 className="text-xl font-bold mb-2">Verifying Payment</h2>
                <p className="text-muted-foreground">Please wait...</p>
              </motion.div>
            )}

            {/* Success State */}
            {step === 'success' && currentOrder && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <div className="bg-card rounded-2xl border border-border p-8 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.2 }}
                    className="h-16 w-16 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center"
                  >
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                  </motion.div>
                  
                  <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
                  <p className="text-muted-foreground mb-6">Your payment has been processed.</p>

                  <div className="bg-muted/50 rounded-xl p-5 text-left space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Reference</span>
                      <span className="font-mono font-medium">{currentOrder.payment_reference}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Amount</span>
                      <span className="font-medium">₦{currentOrder.original_amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Fee</span>
                      <span className="font-medium">₦{currentOrder.paystack_charge.toLocaleString()}</span>
                    </div>
                    <div className="h-px bg-border" />
                    <div className="flex justify-between">
                      <span className="font-medium">Total Paid</span>
                      <span className="font-bold text-primary">₦{currentOrder.amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Date</span>
                      <span className="font-medium">
                        {format(new Date(currentOrder.paid_at || currentOrder.created_at), 'MMM dd, yyyy • HH:mm')}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1" onClick={resetPayment}>
                      New Payment
                    </Button>
                    <Button className="flex-1">
                      Download Receipt
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Failed State */}
            {step === 'failed' && (
              <motion.div
                key="failed"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <div className="bg-card rounded-2xl border border-border p-8 text-center">
                  <div className="h-16 w-16 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
                    <AlertCircle className="h-8 w-8 text-red-600" />
                  </div>
                  
                  <h2 className="text-2xl font-bold mb-2">Payment Failed</h2>
                  <p className="text-muted-foreground mb-6">
                    Something went wrong. Please try again.
                  </p>

                  {currentOrder && (
                    <div className="bg-muted/50 rounded-xl p-4 text-left mb-6">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Reference</span>
                        <span className="font-mono">{currentOrder.payment_reference}</span>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1" onClick={resetPayment}>
                      Cancel
                    </Button>
                    <Button className="flex-1" onClick={() => selectedCategory && setStep('details')}>
                      Try Again
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </Layout>
  );
};

export default Payments;