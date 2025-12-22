import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Layout from '@/components/layout/Layout';
import { 
  Shield, 
  CreditCard, 
  Receipt, 
  Users, 
  ChevronRight, 
  CheckCircle2,
  Smartphone,
  Clock,
  Lock
} from 'lucide-react';

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const Index: React.FC = () => {
  const features = [
    {
      icon: CreditCard,
      title: 'Multiple Payment Options',
      description: 'Pay with debit cards, bank transfers, or USSD - whatever works best for you.'
    },
    {
      icon: Receipt,
      title: 'Instant Receipts',
      description: 'Get automatic digital receipts immediately after every successful payment.'
    },
    {
      icon: Shield,
      title: 'Secure Transactions',
      description: 'Your payment data is protected with bank-grade encryption technology.'
    },
    {
      icon: Smartphone,
      title: 'Mobile Friendly',
      description: 'Make payments anytime, anywhere from your phone or computer.'
    },
    {
      icon: Clock,
      title: 'Real-time Tracking',
      description: 'Track your payment status and history in real-time from your dashboard.'
    },
    {
      icon: Lock,
      title: 'Verified Payments',
      description: 'Every transaction is verified and recorded for transparency.'
    }
  ];

  const steps = [
    { step: '01', title: 'Register', description: 'Create your account with your matric number' },
    { step: '02', title: 'Select Payment', description: 'Choose the dues or levy you want to pay' },
    { step: '03', title: 'Make Payment', description: 'Pay securely via your preferred method' },
    { step: '04', title: 'Get Receipt', description: 'Download your payment receipt instantly' }
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden gradient-hero min-h-[90vh] flex items-center">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        
        <div className="container relative z-10 py-20">
          <motion.div
            initial="initial"
            animate="animate"
            variants={staggerContainer}
            className="max-w-3xl"
          >
            <motion.div
              variants={fadeUp}
              className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/10 px-4 py-2 text-sm text-primary-foreground mb-6"
            >
              <span className="animate-pulse-soft h-2 w-2 rounded-full bg-secondary" />
              Now accepting payments online
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground leading-tight mb-6"
            >
              Pay Your KDU NACOS Dues{' '}
              <span className="text-secondary">Seamlessly</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="text-lg md:text-xl text-primary-foreground/80 mb-8 max-w-2xl"
            >
              A secure, fast, and convenient way to pay your departmental dues, levies, and fees. 
              No more queues, no more cash handling - just simple online payments.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-wrap gap-4">
              <Button asChild variant="gold" size="xl">
                <Link to="/register">
                  Get Started
                  <ChevronRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="xl" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
                <Link to="/login">
                  Student Login
                </Link>
              </Button>
            </motion.div>

            <motion.div
              variants={fadeUp}
              className="mt-12 flex items-center gap-8"
            >
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-10 w-10 rounded-full border-2 border-primary bg-primary-foreground/20 flex items-center justify-center"
                  >
                    <Users className="h-4 w-4 text-primary-foreground/70" />
                  </div>
                ))}
              </div>
              <div className="text-primary-foreground/80">
                <span className="font-bold text-primary-foreground">500+</span> students already registered
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-1/4 right-10 w-64 h-64 bg-secondary/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-primary-foreground/5 rounded-full blur-2xl" />
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <span className="inline-block px-4 py-1 rounded-full bg-accent text-accent-foreground text-sm font-medium mb-4">
              Features
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Use KDU NACOS Pay?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We've designed the payment experience to be as smooth and secure as possible for all KDU NACOS members.
            </p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-card-hover transition-all duration-300"
              >
                <div className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-muted/50">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <span className="inline-block px-4 py-1 rounded-full bg-accent text-accent-foreground text-sm font-medium mb-4">
              How It Works
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Simple 4-Step Process
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Making payments has never been easier. Follow these simple steps to complete your payment.
            </p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative"
              >
                <div className="text-6xl font-bold text-primary/10 mb-4">{item.step}</div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-primary/20 to-transparent" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-background">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative overflow-hidden rounded-3xl gradient-hero p-8 md:p-16 text-center"
          >
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
            
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
                Ready to Make Your Payment?
              </h2>
              <p className="text-lg text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
                Join hundreds of students who have already made their payments online. 
                It's fast, secure, and hassle-free.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button asChild variant="gold" size="lg">
                  <Link to="/register">
                    Create Account
                    <ChevronRight className="h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
                  <Link to="/login">
                    Sign In
                  </Link>
                </Button>
              </div>
            </div>

            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-secondary/30 rounded-full blur-2xl" />
            <div className="absolute -top-10 -left-10 w-32 h-32 bg-primary-foreground/10 rounded-full blur-xl" />
          </motion.div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-12 border-t border-border">
        <div className="container">
          <div className="flex flex-wrap justify-center items-center gap-8">
            <div className="flex items-center gap-2 text-muted-foreground">
              <CheckCircle2 className="h-5 w-5 text-success" />
              <span className="text-sm">SSL Secured</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <CheckCircle2 className="h-5 w-5 text-success" />
              <span className="text-sm">PCI Compliant</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <CheckCircle2 className="h-5 w-5 text-success" />
              <span className="text-sm">Paystack Verified</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <CheckCircle2 className="h-5 w-5 text-success" />
              <span className="text-sm">24/7 Support</span>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
