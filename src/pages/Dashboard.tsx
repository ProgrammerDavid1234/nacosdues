import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { mockPaymentCategories, mockPayments } from '@/data/mockData';
import { 
  CreditCard, 
  Receipt, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  ChevronRight,
  TrendingUp,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  
  const userPayments = mockPayments.filter(p => p.userId === user?.id);
  const completedPayments = userPayments.filter(p => p.status === 'success');
  const pendingPayments = userPayments.filter(p => p.status === 'pending');
  
  const totalPaid = completedPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalPending = pendingPayments.reduce((sum, p) => sum + p.amount, 0);
  
  const paidCategoryIds = completedPayments.map(p => p.categoryId);
  const unpaidCategories = mockPaymentCategories.filter(
    c => c.isActive && !paidCategoryIds.includes(c.id)
  );
  const totalUnpaid = unpaidCategories.reduce((sum, c) => sum + c.amount, 0);

  const stats = [
    {
      label: 'Total Paid',
      value: `₦${totalPaid.toLocaleString()}`,
      icon: CheckCircle2,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      label: 'Pending',
      value: `₦${totalPending.toLocaleString()}`,
      icon: Clock,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    {
      label: 'Outstanding',
      value: `₦${totalUnpaid.toLocaleString()}`,
      icon: AlertCircle,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
    },
    {
      label: 'Transactions',
      value: userPayments.length.toString(),
      icon: TrendingUp,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
  ];

  return (
    <Layout showFooter={false}>
      <div className="min-h-[calc(100vh-4rem)] bg-muted/30">
        <div className="container py-8">
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              Welcome back, {user?.fullName.split(' ')[0]}! 👋
            </h1>
            <p className="text-muted-foreground">
              Here's an overview of your payment activities
            </p>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            {stats.map((stat, index) => (
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

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Outstanding Payments */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2 bg-card rounded-2xl border border-border shadow-card overflow-hidden"
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
                {unpaidCategories.length > 0 ? (
                  unpaidCategories.slice(0, 4).map((category) => (
                    <div key={category.id} className="p-6 flex items-center justify-between hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                          <CreditCard className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium text-foreground">{category.name}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>Due: {format(category.deadline, 'MMM dd, yyyy')}</span>
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
                    <CheckCircle2 className="h-12 w-12 text-success mx-auto mb-4" />
                    <h3 className="font-medium text-foreground mb-2">All Caught Up!</h3>
                    <p className="text-sm text-muted-foreground">You have no outstanding payments</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Recent Transactions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-card rounded-2xl border border-border shadow-card overflow-hidden"
            >
              <div className="p-6 border-b border-border">
                <h2 className="text-lg font-semibold text-foreground">Recent Transactions</h2>
                <p className="text-sm text-muted-foreground">Your payment history</p>
              </div>
              
              <div className="divide-y divide-border">
                {userPayments.length > 0 ? (
                  userPayments.slice(0, 5).map((payment) => (
                    <div key={payment.id} className="p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-foreground text-sm">{payment.categoryName}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          payment.status === 'success' 
                            ? 'bg-success/10 text-success' 
                            : payment.status === 'pending'
                            ? 'bg-warning/10 text-warning'
                            : 'bg-destructive/10 text-destructive'
                        }`}>
                          {payment.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {format(payment.transactionDate, 'MMM dd, yyyy')}
                        </span>
                        <span className="font-semibold text-foreground">
                          ₦{payment.amount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center">
                    <Receipt className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">No transactions yet</p>
                  </div>
                )}
              </div>
              
              {userPayments.length > 0 && (
                <div className="p-4 border-t border-border">
                  <Button asChild variant="ghost" className="w-full">
                    <Link to="/history">View All Transactions</Link>
                  </Button>
                </div>
              )}
            </motion.div>
          </div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8 grid gap-4 sm:grid-cols-3"
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
              <p className="text-sm text-muted-foreground">View all transactions</p>
            </Link>

            <Link
              to="/receipts"
              className="group p-6 rounded-2xl border border-border bg-card hover:border-primary/30 hover:shadow-card-hover transition-all"
            >
              <div className="h-12 w-12 rounded-xl bg-accent flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <CheckCircle2 className="h-6 w-6 text-accent-foreground" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">Download Receipts</h3>
              <p className="text-sm text-muted-foreground">Get payment proofs</p>
            </Link>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
