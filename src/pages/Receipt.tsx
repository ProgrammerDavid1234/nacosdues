import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Download, Home, Printer, Share2 } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { format } from 'date-fns';

const Receipt: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [payment, setPayment] = useState<any>(null);

    useEffect(() => {
        // Retrieve payment from localStorage
        const savedPayments = JSON.parse(localStorage.getItem('nacos_payments') || '[]');
        const foundPayment = savedPayments.find((p: any) => p.id === id);
        setPayment(foundPayment);
    }, [id]);

    const handlePrint = () => {
        window.print();
    };

    if (!payment) {
        return (
            <Layout>
                <div className="min-h-[60vh] flex items-center justify-center">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold mb-2">Receipt Not Found</h2>
                        <p className="text-muted-foreground mb-6">Could not find payment details.</p>
                        <Button asChild>
                            <Link to="/">Go Home</Link>
                        </Button>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="min-h-[calc(100vh-4rem)] bg-muted/30 py-12 px-4">
                <div className="container max-w-2xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-card rounded-3xl border border-border shadow-card overflow-hidden"
                    >
                        {/* Success Header */}
                        <div className="bg-success/10 p-8 text-center border-b border-border">
                            <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-success/20 mb-6">
                                <CheckCircle2 className="h-10 w-10 text-success" />
                            </div>
                            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                                Payment Successful!
                            </h1>
                            <p className="text-muted-foreground">
                                Your transaction has been processed successfully.
                            </p>
                        </div>

                        {/* Receipt Details */}
                        <div className="p-8">
                            <div className="flex flex-col gap-6">
                                <div className="text-center pb-6 border-b border-border border-dashed">
                                    <p className="text-sm text-muted-foreground mb-1">Total Amount Paid</p>
                                    <p className="text-4xl font-bold text-foreground">
                                        ₦{Number(payment.amount).toLocaleString()}
                                    </p>
                                </div>

                                <div className="grid gap-4 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Reference</span>
                                        <span className="font-mono font-medium">{payment.reference}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Date</span>
                                        <span className="font-medium">
                                            {format(new Date(payment.date), 'MMMM dd, yyyy - HH:mm')}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Payment For</span>
                                        <span className="font-medium">{payment.categoryName}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Paid By</span>
                                        <span className="font-medium text-right">{payment.fullName}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Matric Number</span>
                                        <span className="font-medium">{payment.matricNumber}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Level</span>
                                        <span className="font-medium">{payment.level} Lvl</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Status</span>
                                        <span className="px-2 py-0.5 rounded-full bg-success/10 text-success text-xs font-semibold uppercase">
                                            Success
                                        </span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-col sm:flex-row gap-3 mt-4 pt-6 border-t border-border">
                                    <Button onClick={handlePrint} variant="outline" className="flex-1">
                                        <Printer className="mr-2 h-4 w-4" />
                                        Print Receipt
                                    </Button>
                                    <Button variant="outline" className="flex-1">
                                        <Download className="mr-2 h-4 w-4" />
                                        Download PDF
                                    </Button>
                                </div>
                                <div className="flex justify-center mt-2">
                                    <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
                                        <Link to="/">
                                            <Home className="mr-2 h-4 w-4" />
                                            Return Home
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Cutout decoration */}
                        <div className="relative h-4 bg-muted/30 -mt-2">
                            <div className="absolute top-0 left-0 w-full h-full flex justify-between">
                                {[...Array(20)].map((_, i) => (
                                    <div key={i} className="w-2 h-2 rounded-full bg-background -mt-1 mx-1"></div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </Layout>
    );
};

export default Receipt;
