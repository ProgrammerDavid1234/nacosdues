import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { mockPaymentCategories, generateReference } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';
import { 
  CreditCard, 
  Building, 
  Smartphone, 
  CheckCircle2, 
  Loader2,
  Shield,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import { format } from 'date-fns';

type PaymentStep = 'select' | 'details' | 'processing' | 'success';

const Payments: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState<PaymentStep>('select');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'bank' | 'ussd'>('card');
  const [reference, setReference] = useState('');

  const activeCategories = mockPaymentCategories.filter(c => c.isActive);
  const selected = activeCategories.find(c => c.id === selectedCategory);

  const handleSelectCategory = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setStep('details');
  };

  const handlePayment = async () => {
    setStep('processing');
    const ref = generateReference();
    setReference(ref);

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 3000));

    setStep('success');
    toast({
      title: 'Payment Successful!',
      description: `Your payment of ₦${selected?.amount.toLocaleString()} has been processed.`,
    });
  };

  const resetPayment = () => {
    setStep('select');
    setSelectedCategory(null);
    setReference('');
  };

  return (
    <Layout showFooter={false}>
      <div className="min-h-[calc(100vh-4rem)] bg-muted/30">
        <div className="container py-8 max-w-4xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            {step !== 'select' && step !== 'success' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep(step === 'details' ? 'select' : 'details')}
                className="mb-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            )}
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              {step === 'select' && 'Select Payment'}
              {step === 'details' && 'Payment Details'}
              {step === 'processing' && 'Processing Payment'}
              {step === 'success' && 'Payment Successful'}
            </h1>
            <p className="text-muted-foreground">
              {step === 'select' && 'Choose the payment you want to make'}
              {step === 'details' && 'Review and confirm your payment'}
              {step === 'processing' && 'Please wait while we process your payment'}
              {step === 'success' && 'Your payment has been successfully processed'}
            </p>
          </motion.div>

          <AnimatePresence mode="wait">
            {/* Step 1: Select Category */}
            {step === 'select' && (
              <motion.div
                key="select"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="grid gap-4 md:grid-cols-2"
              >
                {activeCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleSelectCategory(category.id)}
                    className="p-6 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-card-hover transition-all text-left group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                        <CreditCard className="h-6 w-6 text-primary-foreground" />
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">{category.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{category.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-primary">
                        ₦{category.amount.toLocaleString()}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Due: {format(category.deadline, 'MMM dd')}
                      </span>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}

            {/* Step 2: Payment Details */}
            {step === 'details' && selected && (
              <motion.div
                key="details"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="grid gap-8 lg:grid-cols-2"
              >
                {/* Payment Summary */}
                <div className="bg-card rounded-2xl border border-border p-6 shadow-card">
                  <h2 className="text-lg font-semibold text-foreground mb-6">Payment Summary</h2>
                  
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between py-3 border-b border-border">
                      <span className="text-muted-foreground">Payment For</span>
                      <span className="font-medium text-foreground">{selected.name}</span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-border">
                      <span className="text-muted-foreground">Student Name</span>
                      <span className="font-medium text-foreground">{user?.fullName}</span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-border">
                      <span className="text-muted-foreground">Matric Number</span>
                      <span className="font-medium text-foreground">{user?.matricNumber}</span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-border">
                      <span className="text-muted-foreground">Amount</span>
                      <span className="font-medium text-foreground">₦{selected.amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between py-3">
                      <span className="text-muted-foreground">Processing Fee</span>
                      <span className="font-medium text-foreground">₦0.00</span>
                    </div>
                  </div>

                  <div className="flex justify-between py-4 bg-primary/5 rounded-xl px-4">
                    <span className="font-semibold text-foreground">Total Amount</span>
                    <span className="text-xl font-bold text-primary">₦{selected.amount.toLocaleString()}</span>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="space-y-6">
                  <div className="bg-card rounded-2xl border border-border p-6 shadow-card">
                    <h2 className="text-lg font-semibold text-foreground mb-6">Select Payment Method</h2>
                    
                    <div className="space-y-3">
                      {[
                        { id: 'card', label: 'Debit Card', icon: CreditCard, desc: 'Visa, Mastercard, Verve' },
                        { id: 'bank', label: 'Bank Transfer', icon: Building, desc: 'Direct bank transfer' },
                        { id: 'ussd', label: 'USSD', icon: Smartphone, desc: 'Pay with USSD code' },
                      ].map((method) => (
                        <button
                          key={method.id}
                          onClick={() => setPaymentMethod(method.id as any)}
                          className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${
                            paymentMethod === method.id
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/30'
                          }`}
                        >
                          <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                            paymentMethod === method.id ? 'bg-primary/10' : 'bg-muted'
                          }`}>
                            <method.icon className={`h-5 w-5 ${
                              paymentMethod === method.id ? 'text-primary' : 'text-muted-foreground'
                            }`} />
                          </div>
                          <div className="text-left flex-1">
                            <p className="font-medium text-foreground">{method.label}</p>
                            <p className="text-sm text-muted-foreground">{method.desc}</p>
                          </div>
                          <div className={`h-5 w-5 rounded-full border-2 ${
                            paymentMethod === method.id
                              ? 'border-primary bg-primary'
                              : 'border-border'
                          }`}>
                            {paymentMethod === method.id && (
                              <CheckCircle2 className="h-full w-full text-primary-foreground" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {paymentMethod === 'card' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="bg-card rounded-2xl border border-border p-6 shadow-card"
                    >
                      <h3 className="font-semibold text-foreground mb-4">Card Details</h3>
                      <div className="space-y-4">
                        <div>
                          <Label>Card Number</Label>
                          <Input placeholder="0000 0000 0000 0000" className="h-12 mt-1" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Expiry Date</Label>
                            <Input placeholder="MM/YY" className="h-12 mt-1" />
                          </div>
                          <div>
                            <Label>CVV</Label>
                            <Input placeholder="123" type="password" className="h-12 mt-1" />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <Button variant="hero" size="xl" className="w-full" onClick={handlePayment}>
                    Pay ₦{selected.amount.toLocaleString()}
                    <Shield className="h-5 w-5 ml-2" />
                  </Button>

                  <p className="text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
                    <Shield className="h-4 w-4" />
                    Secured by Paystack. Your card details are encrypted.
                  </p>
                </div>
              </motion.div>
            )}

            {/* Step 3: Processing */}
            {step === 'processing' && (
              <motion.div
                key="processing"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="max-w-md mx-auto text-center py-16"
              >
                <div className="h-20 w-20 mx-auto mb-6 rounded-full gradient-primary flex items-center justify-center">
                  <Loader2 className="h-10 w-10 text-primary-foreground animate-spin" />
                </div>
                <h2 className="text-xl font-bold text-foreground mb-2">Processing Payment</h2>
                <p className="text-muted-foreground mb-8">
                  Please wait while we process your payment. Do not close this page.
                </p>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full gradient-primary"
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 3, ease: 'easeInOut' }}
                  />
                </div>
              </motion.div>
            )}

            {/* Step 4: Success */}
            {step === 'success' && selected && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="max-w-lg mx-auto"
              >
                <div className="bg-card rounded-2xl border border-border p-8 shadow-card text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.2 }}
                    className="h-20 w-20 mx-auto mb-6 rounded-full bg-success/10 flex items-center justify-center"
                  >
                    <CheckCircle2 className="h-10 w-10 text-success" />
                  </motion.div>
                  
                  <h2 className="text-2xl font-bold text-foreground mb-2">Payment Successful!</h2>
                  <p className="text-muted-foreground mb-8">
                    Your payment has been processed successfully
                  </p>

                  <div className="bg-muted/50 rounded-xl p-6 mb-8 text-left space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Reference</span>
                      <span className="font-mono text-sm font-medium text-foreground">{reference}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Payment For</span>
                      <span className="font-medium text-foreground">{selected.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Amount</span>
                      <span className="font-bold text-primary">₦{selected.amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date</span>
                      <span className="font-medium text-foreground">{format(new Date(), 'MMM dd, yyyy HH:mm')}</span>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button variant="outline" className="flex-1" onClick={resetPayment}>
                      Make Another Payment
                    </Button>
                    <Button variant="hero" className="flex-1">
                      Download Receipt
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
