import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CreditCard, User, GraduationCap, Building2, Mail, Phone } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { mockPaymentCategories } from '@/data/mockData';

const StudentPayment: React.FC = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        fullName: '',
        matricNumber: '',
        email: '',
        phone: '',
        level: '',
        department: '',
        categoryId: '',
    });

    const selectedCategory = mockPaymentCategories.find(c => c.id === formData.categoryId);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulate validation
        if (!formData.fullName || !formData.matricNumber || !formData.email || !formData.categoryId || !formData.department) {
            toast({
                title: "Validation Error",
                description: "Please fill in all required fields.",
                variant: "destructive"
            });
            setIsLoading(false);
            return;
        }

        // Simulate API call / Payment processing
        setTimeout(() => {
            // Create a mock payment record
            const paymentRecord = {
                id: Math.random().toString(36).substr(2, 9),
                ...formData,
                amount: selectedCategory?.amount || 0,
                categoryName: selectedCategory?.name || 'Unknown',
                reference: `NACOS-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                status: 'success',
                date: new Date().toISOString(),
            };

            // Save to localStorage
            const existingPayments = JSON.parse(localStorage.getItem('nacos_payments') || '[]');
            localStorage.setItem('nacos_payments', JSON.stringify([paymentRecord, ...existingPayments]));

            // Redirect to receipt
            toast({
                title: "Payment Successful",
                description: "Your receipt uses being generated.",
            });
            navigate(`/receipt/${paymentRecord.id}`);
        }, 2000);
    };

    return (
        <Layout>
            <div className="min-h-[calc(100vh-4rem)] bg-muted/30 py-12 px-4">
                <div className="container max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-10"
                    >
                        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                            Pay Your Dues & Levies
                        </h1>
                        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                            Securely pay your NACOS departmental dues without logging in. fill the details below to proceed.
                        </p>
                    </motion.div>

                    <div className="grid gap-8 md:grid-cols-3">
                        {/* Form Section */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="md:col-span-2 bg-card rounded-2xl border border-border p-6 md:p-8 shadow-card"
                        >
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid gap-6 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="fullName">Full Name</Label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="fullName"
                                                name="fullName"
                                                placeholder="e.g. John Doe"
                                                value={formData.fullName}
                                                onChange={handleInputChange}
                                                className="pl-10"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="matricNumber">Matric Number</Label>
                                        <div className="relative">
                                            <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="matricNumber"
                                                name="matricNumber"
                                                placeholder="CSC/2021/..."
                                                value={formData.matricNumber}
                                                onChange={handleInputChange}
                                                className="pl-10"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email Address</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="email"
                                                name="email"
                                                type="email"
                                                placeholder="student@example.com"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                className="pl-10"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone Number</Label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="phone"
                                                name="phone"
                                                type="tel"
                                                placeholder="08012345678"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                className="pl-10"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="level">Level</Label>
                                        <Select onValueChange={(val) => handleSelectChange('level', val)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Level" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="100">100 Level</SelectItem>
                                                <SelectItem value="200">200 Level</SelectItem>
                                                <SelectItem value="300">300 Level</SelectItem>
                                                <SelectItem value="400">400 Level</SelectItem>
                                                <SelectItem value="500">500 Level</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="department">Department</Label>
                                        <Select onValueChange={(val) => handleSelectChange('department', val)} required>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Department" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Computer Science">Computer Science</SelectItem>
                                                <SelectItem value="Software Engineering">Software Engineering</SelectItem>
                                                <SelectItem value="Information Technology">Information Technology</SelectItem>
                                                <SelectItem value="Cyber Security">Cyber Security</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="categoryId">Payment For</Label>
                                    <Select onValueChange={(val) => handleSelectChange('categoryId', val)} required>
                                        <SelectTrigger className="h-12">
                                            <SelectValue placeholder="Select what you are paying for" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {mockPaymentCategories.filter(c => c.isActive).map((category) => (
                                                <SelectItem key={category.id} value={category.id}>
                                                    {category.name} - ₦{category.amount.toLocaleString()}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="pt-4">
                                    <Button
                                        type="submit"
                                        variant="hero"
                                        size="lg"
                                        className="w-full text-lg font-semibold h-14"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                Pay Now <span className="ml-1 text-primary-foreground/80">- {selectedCategory ? `₦${selectedCategory.amount.toLocaleString()}` : "₦0.00"}</span>
                                            </>
                                        )}
                                    </Button>
                                    <p className="text-center text-xs text-muted-foreground mt-4">
                                        By clicking "Pay Now", you agree to our terms and conditions.
                                        <br />Secured by Paystack.
                                    </p>
                                </div>
                            </form>
                        </motion.div>

                        {/* Summary Section */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="space-y-6"
                        >
                            <div className="bg-primary/5 rounded-2xl border border-primary/10 p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                                        <CreditCard className="h-5 w-5 text-primary" />
                                    </div>
                                    <h3 className="font-semibold text-foreground">Payment Summary</h3>
                                </div>

                                <div className="space-y-4 text-sm">
                                    <div className="flex justify-between py-2 border-b border-border/50">
                                        <span className="text-muted-foreground">Item</span>
                                        <span className="font-medium">{selectedCategory?.name || '-'}</span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b border-border/50">
                                        <span className="text-muted-foreground">Amount</span>
                                        <span className="font-medium">{selectedCategory ? `₦${selectedCategory.amount.toLocaleString()}` : '₦0'}</span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b border-border/50">
                                        <span className="text-muted-foreground">Transaction Fee</span>
                                        <span className="font-medium">₦0.00</span>
                                    </div>
                                    <div className="flex justify-between pt-2">
                                        <span className="text-lg font-bold text-foreground">Total</span>
                                        <span className="text-lg font-bold text-primary">
                                            {selectedCategory ? `₦${selectedCategory.amount.toLocaleString()}` : '₦0.00'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
                                <h3 className="font-semibold text-foreground mb-4">Need Help?</h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    If you have issues with your payment, please contact the financial secretary.
                                </p>
                                <Button variant="outline" className="w-full">
                                    Contact Support
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default StudentPayment;
