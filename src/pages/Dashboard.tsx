import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { 
  CreditCard, 
  Receipt, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  ChevronRight,
  TrendingUp,
  Calendar,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import axios from 'axios';
import { API_BASE_URL } from '@/components/api/api';

interface DashboardStats {
  total_paid: number;
  total_pending: number;
  total_outstanding: number;
  total_transactions: number;
}

interface RecentTransaction {
  id: number;
  category_name: string;
  amount: number;
  status: string;
  transaction_date: string;
  payment_reference: string;
}

interface OutstandingPayment {
  id: number;
  name: string;
  amount: number;
  deadline: string;
  description: string;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([]);
  const [outstandingPayments, setOutstandingPayments] = useState<OutstandingPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fix double loading issue
  const hasFetchedRef = React.useRef(false);

  // Helper function to safely get first name
  const getFirstName = (name?: string) => {
    if (!name || typeof name !== 'string') return 'User';
    const firstName = name.split(' ')[0];
    return firstName || 'User';
  };

  // Debug: Log user data
  useEffect(() => {
    console.log('Dashboard - Current user:', user);
    console.log('Dashboard - User fullName:', user?.fullName);
  }, [user]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem('token');
        
        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };

        const [statsRes, transactionsRes, outstandingRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/dashboard/stats`, { headers }),
          axios.get(`${API_BASE_URL}/dashboard/recent-transactions?limit=5`, { headers }),
          axios.get(`${API_BASE_URL}/dashboard/outstanding-payments?limit=4`, { headers })
        ]);

        setStats(statsRes.data);
        setRecentTransactions(transactionsRes.data.slice(0, 5));
        setOutstandingPayments(outstandingRes.data);
      } catch (err: any) {
        console.error('Error fetching dashboard data:', err);
        setError(err.response?.data?.detail || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    if (user && !hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchDashboardData();
    }
  }, [user]);

  const getStatusStyle = (status: string) => {
    const upperStatus = status.toUpperCase();
    if (upperStatus === 'COMPLETED') {
      return 'bg-green-500 text-white';
    }
    if (upperStatus === 'PENDING') {
      return 'bg-yellow-500 text-white';
    }
    return 'bg-red-500 text-white';
  };

  const statsCards = stats ? [
    {
      label: 'Total Paid',
      value: `₦${stats.total_paid.toLocaleString()}`,
      icon: CheckCircle2,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Pending',
      value: `₦${stats.total_pending.toLocaleString()}`,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      label: 'Outstanding',
      value: `₦${stats.total_outstanding.toLocaleString()}`,
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      label: 'Transactions',
      value: stats.total_transactions.toString(),
      icon: TrendingUp,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
  ] : [];

  if (loading) {
    return (
      <Layout showFooter={false}>
        <div className="min-h-[calc(100vh-4rem)] bg-muted/30 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout showFooter={false}>
        <div className="min-h-[calc(100vh-4rem)] bg-muted/30 flex items-center justify-center">
          <div className="text-center max-w-md">
            <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">Error Loading Dashboard</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showFooter={false}>
      <div className="min-h-[calc(100vh-4rem)] bg-muted/30">
        <div className="container py-8">
          {/* Welcome Section - FIXED */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              Welcome back, {getFirstName(user?.fullName)}! 
            </h1>
            <p className="text-muted-foreground">
              Here's an overview of your payment activities
            </p>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            {statsCards.map((stat, index) => (
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

          {/* Main Content Grid */}
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Left Column - Outstanding Payments + Quick Actions */}
            <div className="lg:col-span-2 flex flex-col gap-8">
              {/* Outstanding Payments */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-card rounded-2xl border border-border shadow-card overflow-hidden"
              >
                <div className="p-6 border-b border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-foreground">Outstanding Payments</h2>
                      <p className="text-sm text-muted-foreground">Dues and levies awaiting payment</p>
                    </div>
                    <Button asChild variant="default" size="sm">
                      <Link to="/payments">
                        Pay Now
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
                
                <div className="divide-y divide-border">
                  {outstandingPayments.length > 0 ? (
                    outstandingPayments.map((category) => (
                      <div key={category.id} className="p-6 flex items-center justify-between hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                            <CreditCard className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-medium text-foreground">{category.name}</h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="h-3.5 w-3.5" />
                              <span>Due: {format(new Date(category.deadline), 'MMM dd, yyyy')}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-foreground">₦{category.amount.toLocaleString()}</p>
                          <Button asChild variant="ghost" size="sm" className="text-primary">
                            <Link to={`/payments?category=${category.id}`}>Pay</Link>
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-12 text-center">
                      <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-4" />
                      <h3 className="font-medium text-foreground mb-2">All Caught Up!</h3>
                      <p className="text-sm text-muted-foreground">You have no outstanding payments</p>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="grid gap-4 sm:grid-cols-2"
              >
                <Link
                  to="/payments"
                  className="group p-6 rounded-2xl border border-border bg-card hover:border-primary/30 hover:shadow-card-hover transition-all"
                >
                  <div className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <CreditCard className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">Make Payment</h3>
                  <p className="text-sm text-muted-foreground">Pay your dues online</p>
                </Link>

                <Link
                  to="/history"
                  className="group p-6 rounded-2xl border border-border bg-card hover:border-primary/30 hover:shadow-card-hover transition-all"
                >
                  <div className="h-12 w-12 rounded-xl bg-secondary/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Receipt className="h-6 w-6 text-secondary-foreground" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">Payment History</h3>
                  <p className="text-sm text-muted-foreground">View all transactions and download receipts</p>
                </Link>
              </motion.div>
            </div>

            {/* Right Column - Recent Transactions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-card rounded-2xl border border-border shadow-card overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-border shrink-0">
                <h2 className="text-lg font-semibold text-foreground">Recent Transactions</h2>
                <p className="text-sm text-muted-foreground">Your latest 5 payments</p>
              </div>
              
              <div className="divide-y divide-border flex-1">
                {recentTransactions.length > 0 ? (
                  recentTransactions.map((payment) => (
                    <div key={payment.id} className="p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-foreground text-sm">{payment.category_name}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusStyle(payment.status)}`}>
                          {payment.status.toLowerCase()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(payment.transaction_date), 'MMM dd, yyyy')}
                        </span>
                        <span className="font-semibold text-foreground">
                          ₦{payment.amount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center flex-1 flex flex-col items-center justify-center">
                    <Receipt className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">No transactions yet</p>
                  </div>
                )}
              </div>
              
              {recentTransactions.length > 0 && (
                <div className="p-4 border-t border-border mt-auto shrink-0">
                  <Button asChild variant="ghost" className="w-full">
                    <Link to="/history">View All Transactions</Link>
                  </Button>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;