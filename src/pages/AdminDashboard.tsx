import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { mockPayments, mockPaymentCategories, mockUsers } from '@/data/mockData';
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
  Eye
} from 'lucide-react';
import { format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const AdminDashboard: React.FC = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'transactions' | 'categories' | 'students'>('transactions');

  const allPayments = mockPayments;
  const successfulPayments = allPayments.filter(p => p.status === 'success');
  const pendingPayments = allPayments.filter(p => p.status === 'pending');
  const failedPayments = allPayments.filter(p => p.status === 'failed');

  const totalRevenue = successfulPayments.reduce((sum, p) => sum + p.amount, 0);
  const studentCount = mockUsers.filter(u => u.role === 'student').length;

  const stats = [
    {
      label: 'Total Revenue',
      value: `₦${totalRevenue.toLocaleString()}`,
      icon: TrendingUp,
      color: 'text-success',
      bgColor: 'bg-success/10',
      change: '+12.5%',
    },
    {
      label: 'Total Transactions',
      value: allPayments.length.toString(),
      icon: CreditCard,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      change: '+8 this week',
    },
    {
      label: 'Successful',
      value: successfulPayments.length.toString(),
      icon: CheckCircle2,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      label: 'Registered Students',
      value: studentCount.toString(),
      icon: Users,
      color: 'text-secondary',
      bgColor: 'bg-secondary/10',
    },
  ];

  const filteredPayments = allPayments.filter(p =>
    p.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.userMatric.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.reference.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleExport = () => {
    toast({
      title: 'Export Started',
      description: 'Your report is being generated...',
    });
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
              <Button variant="outline" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="hero">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Category
                  </Button>
                </DialogTrigger>
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
                      <Input placeholder="e.g., NACOS Dues" className="mt-1" />
                    </div>
                    <div>
                      <Label>Amount (₦)</Label>
                      <Input type="number" placeholder="5000" className="mt-1" />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Input placeholder="Brief description..." className="mt-1" />
                    </div>
                    <div>
                      <Label>Deadline</Label>
                      <Input type="date" className="mt-1" />
                    </div>
                    <Button variant="hero" className="w-full">
                      Create Category
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
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
                  {stat.change && (
                    <span className="text-xs text-success bg-success/10 px-2 py-1 rounded-full">
                      {stat.change}
                    </span>
                  )}
                </div>
                <p className="text-2xl font-bold text-foreground mb-1">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {[
              { id: 'transactions', label: 'Transactions', count: allPayments.length },
              { id: 'categories', label: 'Payment Categories', count: mockPaymentCategories.length },
              { id: 'students', label: 'Students', count: studentCount },
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
                    placeholder="Search transactions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">All</Button>
                  <Button variant="ghost" size="sm">Success</Button>
                  <Button variant="ghost" size="sm">Pending</Button>
                  <Button variant="ghost" size="sm">Failed</Button>
                </div>
              </div>
            </div>

            {/* Transactions Table */}
            {activeTab === 'transactions' && (
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
                    {filteredPayments.map((payment) => (
                      <tr key={payment.id} className="hover:bg-muted/50 transition-colors">
                        <td className="px-6 py-4">
                          <span className="font-mono text-sm">{payment.reference}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-foreground">{payment.userName}</p>
                            <p className="text-sm text-muted-foreground">{payment.userMatric}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-foreground">{payment.categoryName}</td>
                        <td className="px-6 py-4 font-semibold text-foreground">
                          ₦{payment.amount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                            payment.status === 'success'
                              ? 'bg-success/10 text-success'
                              : payment.status === 'pending'
                              ? 'bg-warning/10 text-warning'
                              : 'bg-destructive/10 text-destructive'
                          }`}>
                            {payment.status === 'success' && <CheckCircle2 className="h-3 w-3" />}
                            {payment.status === 'pending' && <Clock className="h-3 w-3" />}
                            {payment.status === 'failed' && <AlertCircle className="h-3 w-3" />}
                            {payment.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground text-sm">
                          {format(payment.transactionDate, 'MMM dd, yyyy')}
                        </td>
                        <td className="px-6 py-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-card">
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Download className="h-4 w-4 mr-2" />
                                Download Receipt
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Categories Tab */}
            {activeTab === 'categories' && (
              <div className="p-6">
                <div className="grid gap-4 md:grid-cols-2">
                  {mockPaymentCategories.map((category) => (
                    <div
                      key={category.id}
                      className={`p-6 rounded-xl border-2 ${
                        category.isActive ? 'border-primary/20 bg-primary/5' : 'border-border bg-muted/30'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-foreground">{category.name}</h3>
                          <p className="text-sm text-muted-foreground">{category.description}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          category.isActive
                            ? 'bg-success/10 text-success'
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {category.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-primary">
                          ₦{category.amount.toLocaleString()}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          Due: {format(category.deadline, 'MMM dd, yyyy')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Students Tab */}
            {activeTab === 'students' && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-4">Student</th>
                      <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-4">Matric Number</th>
                      <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-4">Level</th>
                      <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-4">Email</th>
                      <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-4">Registered</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {mockUsers.filter(u => u.role === 'student').map((student) => (
                      <tr key={student.id} className="hover:bg-muted/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="font-semibold text-primary">
                                {student.fullName.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <span className="font-medium text-foreground">{student.fullName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-mono text-sm text-foreground">{student.matricNumber}</td>
                        <td className="px-6 py-4 text-foreground">{student.level} Level</td>
                        <td className="px-6 py-4 text-muted-foreground">{student.email}</td>
                        <td className="px-6 py-4 text-muted-foreground text-sm">
                          {format(student.createdAt, 'MMM dd, yyyy')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
