import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Download,
  Home,
  Printer,
  Loader2,
  AlertCircle,
  FileText,
  ArrowLeft,
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import { format } from "date-fns";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { createRoot } from "react-dom/client";
import { domToPng } from "modern-screenshot";
import jsPDF from "jspdf";
import { useNavigate } from "react-router-dom";
import nacos from "@/components/assets/nacos2.png";
import KDU from "@/components/assets/kdu-removebg-preview.png";
import { API_BASE_URL } from '@/components/api/api';

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

// Professional Receipt Content Component - Always white for PDF/Print with thin light borders
export const ReceiptContent: React.FC<{ payment: ReceiptData }> = ({
  payment,
}) => {
  return (
    <div
      className="bg-white rounded-lg overflow-hidden max-w-3xl mx-auto shadow-sm border border-gray-300"
      id="receipt-content"
      style={{
        fontFamily: "system-ui, -apple-system, sans-serif",
        width: "798px",
        margin: "0 auto",
        boxSizing: "border-box",
      }}
    >
      {/* Header with Logos */}
      <div className="bg-white px-6 py-3 border-b-2 border-gray-300">
        <div className="flex justify-between items-center mb-2">
          {/* NACOS Logo - Left */}
          <div className="flex items-center gap-2">
            <img
              src={nacos}
              alt="NACOS Logo"
              className="h-12 w-12 object-contain"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
            <div>
              <p className="text-sm font-bold text-gray-900 leading-tight">
                NACOS
              </p>
              <p className="text-xs text-gray-600 leading-tight">KDU Chapter</p>
            </div>
          </div>

          {/* University Logo - Right */}
          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className="text-sm font-bold text-gray-900 leading-tight">
                KOLADAISI
              </p>
              <p className="text-xs text-gray-600 leading-tight">University</p>
            </div>
            <img
              src={KDU}
              alt="University Logo"
              className="h-12 w-12 object-contain"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          </div>
        </div>

        {/* Title */}
        <div className="text-center pt-2 border-t-2 border-gray-200">
          <h1 className="text-xl font-bold text-gray-900 mb-1">
            PAYMENT RECEIPT
          </h1>
          <div className="inline-flex items-center gap-1 text-green-600 text-sm font-semibold">
            <CheckCircle2 className="w-5 h-5" />
            <span>PAYMENT SUCCESSFUL</span>
          </div>
        </div>
      </div>

      {/* Receipt Content */}
      <div className="px-6 py-5">
        {/* Amount Section */}
        <div className="text-center mb-5 pb-4 border-b-2 border-dashed border-gray-300">
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
            Amount Paid
          </p>
          <div className="text-4xl font-bold text-gray-900">
            ₦{payment.total_amount.toLocaleString()}
          </div>
        </div>

        {/* Student Information */}
        <div className="mb-5">
          <h3 className="font-bold text-gray-900 text-base mb-3 pb-2 border-b-2 border-gray-300">
            Student Information
          </h3>
          <div className="space-y-2.5">
            <div className="flex justify-between items-center">
              <label className="text-sm font-semibold text-gray-600">
                Name
              </label>
              <p className="text-sm font-semibold text-gray-900">
                {payment.student.full_name}
              </p>
            </div>
            <div className="flex justify-between items-center">
              <label className="text-sm font-semibold text-gray-600">
                Matric Number
              </label>
              <p className="text-sm font-mono font-semibold text-gray-900">
                {payment.student.matric_number}
              </p>
            </div>
            <div className="flex justify-between items-center">
              <label className="text-sm font-semibold text-gray-600">
                Email
              </label>
              <p className="text-sm text-gray-900">{payment.student.email}</p>
            </div>
            <div className="flex justify-between items-center">
              <label className="text-sm font-semibold text-gray-600">
                Level
              </label>
              <p className="text-sm font-semibold text-gray-900">
                {payment.student.level}L
              </p>
            </div>
            <div className="flex justify-between items-center">
              <label className="text-sm font-semibold text-gray-600">
                Department
              </label>
              <p className="text-sm font-semibold text-gray-900">
                {payment.student.department}
              </p>
            </div>
          </div>
        </div>

        {/* Transaction Details */}
        <div className="mb-5">
          <h3 className="font-bold text-gray-900 text-base mb-3 pb-2 border-b-2 border-gray-300">
            Transaction Details
          </h3>
          <div className="space-y-2.5">
            <div className="flex justify-between items-center">
              <label className="text-sm font-semibold text-gray-600">
                Payment For
              </label>
              <p className="text-sm font-semibold text-gray-900">
                {payment.category.name}
              </p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600 block mb-1">
                Payment Reference
              </label>
              <p className="text-xs font-mono bg-gray-100 px-3 py-2 rounded border border-gray-300 break-all text-gray-900">
                {payment.payment_reference}
              </p>
            </div>
            {payment.transaction_reference && (
              <div>
                <label className="text-sm font-semibold text-gray-600 block mb-1">
                  Transaction Reference
                </label>
                <p className="text-xs font-mono bg-gray-100 px-3 py-2 rounded border border-gray-300 break-all text-gray-900">
                  {payment.transaction_reference}
                </p>
              </div>
            )}
            <div className="flex justify-between items-center">
              <label className="text-sm font-semibold text-gray-600">
                Payment Date
              </label>
              <p className="text-sm font-semibold text-gray-900">
                {format(new Date(payment.created_at), "dd/MM/yyyy")}
              </p>
            </div>
            <div className="flex justify-between items-center">
              <label className="text-sm font-semibold text-gray-600">
                Payment Time
              </label>
              <p className="text-sm font-semibold text-gray-900">
                {format(new Date(payment.created_at), "HH:mm:ss")}
              </p>
            </div>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="bg-gray-100 rounded-lg border-2 border-gray-300 p-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-gray-600">
                Base Amount
              </span>
              <span className="text-sm font-semibold text-gray-900">
                ₦{payment.original_amount.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-gray-600">
                Gateway Fee
              </span>
              <span className="text-sm font-semibold text-gray-900">
                ₦{payment.paystack_charge.toLocaleString()}
              </span>
            </div>
            <div className="h-px bg-gray-300"></div>
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-gray-900">
                Total Amount Paid
              </h3>
              <span className="text-2xl font-bold text-green-600">
                ₦{payment.total_amount.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-5 text-center">
          <p className="text-xs text-gray-600">
            This is an official payment receipt. Keep for your records.
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Generated on {format(new Date(), "dd/MM/yyyy HH:mm:ss")}
          </p>
        </div>
      </div>

      {/* Bottom Border */}
      <div className="h-2 bg-green-600"></div>
    </div>
  );
};

// Display Receipt Component - Dark mode support for screen only
export const DisplayReceiptContent: React.FC<{ payment: ReceiptData }> = ({
  payment,
}) => {
  return (
    <div
      className="bg-white dark:bg-gray-900 rounded-lg overflow-hidden max-w-3xl mx-auto shadow-sm border border-gray-300 dark:border-gray-700"
      id="display-receipt"
      style={{
        fontFamily: "system-ui, -apple-system, sans-serif",
        width: "798px",
        margin: "0 auto",
        boxSizing: "border-box",
      }}
    >
      {/* Header with Logos */}
      <div className="bg-white dark:bg-gray-800 px-6 py-3 border-b-2 border-gray-300 dark:border-gray-700">
        <div className="flex justify-between items-center mb-2">
          {/* NACOS Logo - Left */}
          <div className="flex items-center gap-2">
            <img
              src={nacos}
              alt="NACOS Logo"
              className="h-12 w-12 object-contain"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
            <div>
              <p className="text-sm font-bold text-gray-900 dark:text-gray-100 leading-tight">
                NACOS
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-tight">
                KDU Chapter
              </p>
            </div>
          </div>

          {/* University Logo - Right */}
          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className="text-sm font-bold text-gray-900 dark:text-gray-100 leading-tight">
                KOLADAISI
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-tight">
                University
              </p>
            </div>
            <img
              src={KDU}
              alt="University Logo"
              className="h-12 w-12 object-contain"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          </div>
        </div>

        {/* Title */}
        <div className="text-center pt-2 border-t-2 border-gray-200 dark:border-gray-700">
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">
            PAYMENT RECEIPT
          </h1>
          <div className="inline-flex items-center gap-1 text-green-600 dark:text-green-500 text-sm font-semibold">
            <CheckCircle2 className="w-5 h-5" />
            <span>PAYMENT SUCCESSFUL</span>
          </div>
        </div>
      </div>

      {/* Receipt Content */}
      <div className="px-6 py-5">
        {/* Amount Section */}
        <div className="text-center mb-5 pb-4 border-b-2 border-dashed border-gray-300 dark:border-gray-700">
          <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">
            Amount Paid
          </p>
          <div className="text-4xl font-bold text-gray-900 dark:text-gray-100">
            ₦{payment.total_amount.toLocaleString()}
          </div>
        </div>

        {/* Student Information */}
        <div className="mb-5">
          <h3 className="font-bold text-gray-900 dark:text-gray-100 text-base mb-3 pb-2 border-b-2 border-gray-300 dark:border-gray-700">
            Student Information
          </h3>
          <div className="space-y-2.5">
            <div className="flex justify-between items-center">
              <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                Name
              </label>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {payment.student.full_name}
              </p>
            </div>
            <div className="flex justify-between items-center">
              <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                Matric Number
              </label>
              <p className="text-sm font-mono font-semibold text-gray-900 dark:text-gray-100">
                {payment.student.matric_number}
              </p>
            </div>
            <div className="flex justify-between items-center">
              <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                Email
              </label>
              <p className="text-sm text-gray-900 dark:text-gray-100">
                {payment.student.email}
              </p>
            </div>
            <div className="flex justify-between items-center">
              <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                Level
              </label>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {payment.student.level}L
              </p>
            </div>
            <div className="flex justify-between items-center">
              <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                Department
              </label>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {payment.student.department}
              </p>
            </div>
          </div>
        </div>

        {/* Transaction Details */}
        <div className="mb-5">
          <h3 className="font-bold text-gray-900 dark:text-gray-100 text-base mb-3 pb-2 border-b-2 border-gray-300 dark:border-gray-700">
            Transaction Details
          </h3>
          <div className="space-y-2.5">
            <div className="flex justify-between items-center">
              <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                Payment For
              </label>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {payment.category.name}
              </p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 block mb-1">
                Payment Reference
              </label>
              <p className="text-xs font-mono bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded border border-gray-300 dark:border-gray-700 break-all text-gray-900 dark:text-gray-100">
                {payment.payment_reference}
              </p>
            </div>
            {payment.transaction_reference && (
              <div>
                <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 block mb-1">
                  Transaction Reference
                </label>
                <p className="text-xs font-mono bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded border border-gray-300 dark:border-gray-700 break-all text-gray-900 dark:text-gray-100">
                  {payment.transaction_reference}
                </p>
              </div>
            )}
            <div className="flex justify-between items-center">
              <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                Payment Date
              </label>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {format(new Date(payment.created_at), "dd/MM/yyyy")}
              </p>
            </div>
            <div className="flex justify-between items-center">
              <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                Payment Time
              </label>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {format(new Date(payment.created_at), "HH:mm:ss")}
              </p>
            </div>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg border-2 border-gray-300 dark:border-gray-700 p-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                Base Amount
              </span>
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                ₦{payment.original_amount.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                Gateway Fee
              </span>
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                ₦{payment.paystack_charge.toLocaleString()}
              </span>
            </div>
            <div className="h-px bg-gray-300 dark:bg-gray-700"></div>
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
                Total Amount Paid
              </h3>
              <span className="text-2xl font-bold text-green-600 dark:text-green-500">
                ₦{payment.total_amount.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-5 text-center">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            This is an official payment receipt. Keep for your records.
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            Generated on {format(new Date(), "dd/MM/yyyy HH:mm:ss")}
          </p>
        </div>
      </div>

      {/* Bottom Border */}
      <div className="h-2 bg-green-600 dark:bg-green-500"></div>
    </div>
  );
};

// Main Receipt Component
const Receipt: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [payment, setPayment] = useState<ReceiptData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetchReceiptData();
  }, [id]);

  const fetchReceiptData = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication required");
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const response = await axios.get<ReceiptData>(
        `${API_BASE_URL}/receipt/${id}`,
        { headers }
      );

      setPayment(response.data);
    } catch (err: any) {
      console.error("Error fetching receipt:", err);
      if (err.response?.status === 404) {
        setError("Receipt not found");
      } else if (err.response?.status === 400) {
        setError("Receipt is only available for completed payments");
      } else if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError("Failed to load receipt. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!payment) return;

    try {
      setDownloading(true);

      // Create hidden container
      const container = document.createElement("div");
      container.style.position = "absolute";
      container.style.left = "-9999px";
      container.style.top = "0";
      container.style.width = "798px";
      document.body.appendChild(container);

      // Render receipt (always white version for PDF)
      const root = createRoot(container);
      root.render(<ReceiptContent payment={payment} />);

      // Wait for images to load
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Convert to PNG
      const dataUrl = await domToPng(container.firstChild as HTMLElement, {
        quality: 1.0,
        backgroundColor: "#ffffff",
        scale: 2,
        features: {
          removeControlCharacter: true,
        },
      });

      // Create PDF
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true,
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth - 20;
      const receiptElement = container.firstChild as HTMLElement;
      const imgHeight =
        imgWidth * (receiptElement.offsetHeight / receiptElement.offsetWidth);

      // Center vertically if receipt is smaller than page
      const yPos = imgHeight < pdfHeight ? (pdfHeight - imgHeight) / 2 : 10;

      pdf.addImage(
        dataUrl,
        "PNG",
        10,
        yPos,
        imgWidth,
        imgHeight,
        undefined,
        "FAST"
      );
      pdf.save(`NACOS_Receipt_${payment.payment_reference}.pdf`);

      // Cleanup
      root.unmount();
      document.body.removeChild(container);
    } catch (err) {
      console.error("Error downloading PDF:", err);
      alert("Failed to download receipt. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-background">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center bg-card rounded-lg p-8 shadow-lg border border-border"
          >
            <Loader2 className="h-12 w-12 animate-spin text-green-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-foreground mb-1">
              Loading Receipt
            </h3>
            <p className="text-sm text-muted-foreground">Please wait...</p>
          </motion.div>
        </div>
      </Layout>
    );
  }

  if (error || !payment) {
    return (
      <Layout>
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-background">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center bg-card rounded-lg p-8 shadow-lg border border-border max-w-md"
          >
            <div className="w-16 h-16 bg-red-100 dark:bg-red-950/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">
              Receipt Not Found
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              {error || "Could not find payment details."}
            </p>
            <div className="flex gap-2">
              <Button asChild variant="outline" className="flex-1" size="sm">
                <Link to="/history">
                  <FileText className="mr-2 h-4 w-4" />
                  Payment History
                </Link>
              </Button>
              <Button asChild className="flex-1" size="sm">
                <Link to="/dashboard">
                  <Home className="mr-2 h-4 w-4" />
                  Dashboard
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <style>{`
    @media print {
        .no-print {
            display: none !important;
        }
        body {
            margin: 0;
            padding: 0;
            background: white !important;
        }
        
        /* Hide the display receipt and show print receipt */
        #display-receipt {
            display: none !important;
        }
        
        #print-receipt {
            display: block !important;
            box-shadow: none !important;
            page-break-after: avoid;
            width: 100% !important;
            max-width: 798px !important;
            margin: 0 auto !important;
            box-sizing: border-box !important;
        }
        
        #print-receipt > div {
            width: 100% !important;
            max-width: 798px !important;
            box-sizing: border-box !important;
        }
        
        /* Force light colors when printing */
        #print-receipt,
        #print-receipt * {
            background-color: white !important;
            color: black !important;
        }
        
        /* Keep green elements */
        #print-receipt .text-green-600 {
            color: #16a34a !important;
        }
        
        #print-receipt .bg-green-600 {
            background-color: #16a34a !important;
        }
        
        /* Keep gray backgrounds */
        #print-receipt .bg-gray-100 {
            background-color: #f3f4f6 !important;
        }
        
        /* Keep borders light and visible */
        #print-receipt .border-gray-300 {
            border-color: #d1d5db !important;
        }
        
        #print-receipt .border {
            border-width: 1px !important;
            border-style: solid !important;
        }
        
        @page {
            size: A4;
            margin: 10mm;
        }
    }
    
    /* Hide print receipt on screen */
    #print-receipt {
        display: none;
    }
`}</style>
      <div className="min-h-[calc(100vh-4rem)] bg-gray-50 dark:bg-gray-950 py-8 px-4">
        <div className="container max-w-4xl mx-auto">
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="relative"
            >
              {/* Back Button */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="max-w-3xl mx-auto mb-4 no-print"
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/dashboard")}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </motion.div>

              {/* Download Button - Top Right */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="max-w-3xl mx-auto flex justify-end mb-4 no-print"
              >
                <Button
                  onClick={handleDownloadPDF}
                  disabled={downloading}
                  className="h-11 text-sm font-semibold bg-green-600 hover:bg-green-700 text-white"
                >
                  {downloading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating PDF...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Download PDF
                    </>
                  )}
                </Button>
              </motion.div>

              {/* Display Receipt - Visible on screen with dark mode support */}
              <div className="overflow-x-auto">
                <DisplayReceiptContent payment={payment} />
              </div>

              {/* Print Receipt - Hidden on screen, visible when printing (always white with thin light borders) */}
              <div id="print-receipt" style={{ display: "none" }}>
                <ReceiptContent payment={payment} />
              </div>

              {/* Action Buttons - Bottom */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-6 max-w-3xl mx-auto no-print"
              >
                <div className="grid sm:grid-cols-2 gap-3">
                  <Button
                    onClick={handlePrint}
                    variant="outline"
                    className="h-11 text-sm font-semibold border-2"
                  >
                    <Printer className="mr-2 h-4 w-4" />
                    Print Receipt
                  </Button>

                  <Button
                    asChild
                    variant="outline"
                    className="h-11 text-sm font-semibold border-2"
                  >
                    <Link to="/history">
                      <FileText className="mr-2 h-4 w-4" />
                      View All Receipts
                    </Link>
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </Layout>
  );
};

export default Receipt;
