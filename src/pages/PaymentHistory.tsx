import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { mockPayments } from '@/data/mockData';
import { 
  Search,
  Download,
  CheckCircle2,
  Clock,
  AlertCircle,
  Filter
} from 'lucide-react';
import { format } from 'date-fns';

const PaymentHistory: React.FC = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>('all');

  const userPayments = mockPayments.filter(p => p.userId === user?.id);
  
  const filteredPayments = userPayments.filter(p => {
    const matchesSearch = p.categoryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.reference.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
                Payment History
              </h1>
              <p className="text-muted-foreground">
                View all your past transactions
              </p>
            </div>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export History
            </Button>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card rounded-2xl border border-border p-4 mb-6 shadow-card"
          >
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search by category or reference..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                {['all', 'success', 'pending', 'failed'].map((status) => (
                  <Button
                    key={status}
                    variant={statusFilter === status ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setStatusFilter(status)}
                    className="capitalize"
                  >
                    {status}
                  </Button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Transactions List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            {filteredPayments.length > 0 ? (
              filteredPayments.map((payment, index) => (
                <motion.div
                  key={payment.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-card rounded-2xl border border-border p-6 shadow-card hover:shadow-card-hover transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${
                        payment.status === 'success'
                          ? 'bg-success/10'
                          : payment.status === 'pending'
                          ? 'bg-warning/10'
                          : 'bg-destructive/10'
                      }`}>
                        {payment.status === 'success' && <CheckCircle2 className="h-6 w-6 text-success" />}
                        {payment.status === 'pending' && <Clock className="h-6 w-6 text-warning" />}
                        {payment.status === 'failed' && <AlertCircle className="h-6 w-6 text-destructive" />}
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{payment.categoryName}</h3>
                        <p className="text-sm text-muted-foreground font-mono">{payment.reference}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-lg font-bold text-foreground">
                          ₦{payment.amount.toLocaleString()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {format(payment.transactionDate, 'MMM dd, yyyy')}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                          payment.status === 'success'
                            ? 'bg-success/10 text-success'
                            : payment.status === 'pending'
                            ? 'bg-warning/10 text-warning'
                            : 'bg-destructive/10 text-destructive'
                        }`}>
                          {payment.status}
                        </span>
                        {payment.status === 'success' && (
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-border flex flex-wrap gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Payment Method: </span>
                      <span className="text-foreground capitalize">{payment.paymentMethod.replace('_', ' ')}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Time: </span>
                      <span className="text-foreground">{format(payment.transactionDate, 'HH:mm:ss')}</span>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="bg-card rounded-2xl border border-border p-12 text-center">
                <Filter className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold text-foreground mb-2">No Transactions Found</h3>
                <p className="text-sm text-muted-foreground">
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
