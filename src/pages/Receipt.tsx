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

// PDF Receipt Component - Optimized for A4 printing
export const ReceiptContent: React.FC<{ payment: ReceiptData }> = ({ payment }) => {
  return (
    <div
      className="bg-white"
      id="receipt-content"
      style={{
        fontFamily: "system-ui, -apple-system, sans-serif",
        width: "794px",
        minHeight: "1123px",
        padding: "40px",
        boxSizing: "border-box",
        margin: "0 auto",
      }}
    >
      {/* Header with Logos */}
      <div style={{ borderBottom: "2px solid #d1d5db", paddingBottom: "16px", marginBottom: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <img src={nacos} alt="NACOS" style={{ height: "48px", width: "48px", objectFit: "contain" }} />
            <div>
              <div style={{ fontSize: "14px", fontWeight: "700", color: "#111827", lineHeight: "1.2" }}>NACOS</div>
              <div style={{ fontSize: "11px", color: "#6b7280", lineHeight: "1.2" }}>KDU Chapter</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "14px", fontWeight: "700", color: "#111827", lineHeight: "1.2" }}>KOLADAISI</div>
              <div style={{ fontSize: "11px", color: "#6b7280", lineHeight: "1.2" }}>University</div>
            </div>
            <img src={KDU} alt="KDU" style={{ height: "48px", width: "48px", objectFit: "contain" }} />
          </div>
        </div>
        <div style={{ textAlign: "center", paddingTop: "12px", borderTop: "2px solid #e5e7eb" }}>
          <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#111827", margin: "0 0 8px 0" }}>PAYMENT RECEIPT</h1>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#16a34a", fontSize: "13px", fontWeight: "600" }}>
            <span>✓</span>
            <span>PAYMENT SUCCESSFUL</span>
          </div>
        </div>
      </div>

      {/* Amount */}
      <div style={{ textAlign: "center", marginBottom: "32px", paddingBottom: "24px", borderBottom: "2px dashed #d1d5db" }}>
        <div style={{ fontSize: "11px", fontWeight: "600", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>Amount Paid</div>
        <div style={{ fontSize: "36px", fontWeight: "700", color: "#111827" }}>₦{payment.total_amount.toLocaleString()}</div>
      </div>

      {/* Student Info */}
      <div style={{ marginBottom: "24px" }}>
        <h3 style={{ fontSize: "15px", fontWeight: "700", color: "#111827", margin: "0 0 16px 0", paddingBottom: "8px", borderBottom: "2px solid #d1d5db" }}>Student Information</h3>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <tbody>
            <tr>
              <td style={{ padding: "8px 0", fontSize: "13px", fontWeight: "600", color: "#6b7280", width: "40%" }}>Name</td>
              <td style={{ padding: "8px 0", fontSize: "13px", fontWeight: "600", color: "#111827", textAlign: "right" }}>{payment.student.full_name}</td>
            </tr>
            <tr>
              <td style={{ padding: "8px 0", fontSize: "13px", fontWeight: "600", color: "#6b7280" }}>Matric Number</td>
              <td style={{ padding: "8px 0", fontSize: "13px", fontWeight: "600", color: "#111827", textAlign: "right", fontFamily: "monospace" }}>{payment.student.matric_number}</td>
            </tr>
            <tr>
              <td style={{ padding: "8px 0", fontSize: "13px", fontWeight: "600", color: "#6b7280" }}>Level</td>
              <td style={{ padding: "8px 0", fontSize: "13px", fontWeight: "600", color: "#111827", textAlign: "right" }}>{payment.student.level}L</td>
            </tr>
            <tr>
              <td style={{ padding: "8px 0", fontSize: "13px", fontWeight: "600", color: "#6b7280" }}>Department</td>
              <td style={{ padding: "8px 0", fontSize: "13px", fontWeight: "600", color: "#111827", textAlign: "right" }}>{payment.student.department}</td>
            </tr>
            <tr>
              <td style={{ padding: "8px 0", fontSize: "13px", fontWeight: "600", color: "#6b7280" }}>Email</td>
              <td style={{ padding: "8px 0", fontSize: "13px", color: "#111827", textAlign: "right", wordBreak: "break-all" }}>{payment.student.email}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Transaction Details */}
      <div style={{ marginBottom: "24px" }}>
        <h3 style={{ fontSize: "15px", fontWeight: "700", color: "#111827", margin: "0 0 16px 0", paddingBottom: "8px", borderBottom: "2px solid #d1d5db" }}>Transaction Details</h3>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <tbody>
            <tr>
              <td style={{ padding: "8px 0", fontSize: "13px", fontWeight: "600", color: "#6b7280", width: "40%" }}>Payment For</td>
              <td style={{ padding: "8px 0", fontSize: "13px", fontWeight: "600", color: "#111827", textAlign: "right" }}>{payment.category.name}</td>
            </tr>
            <tr>
              <td colSpan={2} style={{ padding: "12px 0" }}>
                <div style={{ fontSize: "13px", fontWeight: "600", color: "#6b7280", marginBottom: "6px" }}>Payment Reference</div>
                <div style={{ fontSize: "11px", fontFamily: "monospace", backgroundColor: "#f3f4f6", padding: "10px 12px", borderRadius: "6px", border: "1px solid #d1d5db", color: "#111827", wordBreak: "break-all" }}>{payment.payment_reference}</div>
              </td>
            </tr>
            {payment.transaction_reference && (
              <tr>
                <td colSpan={2} style={{ padding: "12px 0" }}>
                  <div style={{ fontSize: "13px", fontWeight: "600", color: "#6b7280", marginBottom: "6px" }}>Transaction Reference</div>
                  <div style={{ fontSize: "11px", fontFamily: "monospace", backgroundColor: "#f3f4f6", padding: "10px 12px", borderRadius: "6px", border: "1px solid #d1d5db", color: "#111827", wordBreak: "break-all" }}>{payment.transaction_reference}</div>
                </td>
              </tr>
            )}
            <tr>
              <td style={{ padding: "8px 0", fontSize: "13px", fontWeight: "600", color: "#6b7280" }}>Payment Date</td>
              <td style={{ padding: "8px 0", fontSize: "13px", fontWeight: "600", color: "#111827", textAlign: "right" }}>{format(new Date(payment.created_at), "dd/MM/yyyy")}</td>
            </tr>
            <tr>
              <td style={{ padding: "8px 0", fontSize: "13px", fontWeight: "600", color: "#6b7280" }}>Payment Time</td>
              <td style={{ padding: "8px 0", fontSize: "13px", fontWeight: "600", color: "#111827", textAlign: "right" }}>{format(new Date(payment.created_at), "HH:mm:ss")}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Payment Summary */}
      <div style={{ backgroundColor: "#f3f4f6", borderRadius: "8px", border: "2px solid #d1d5db", padding: "20px", marginBottom: "24px" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <tbody>
            <tr>
              <td style={{ padding: "6px 0", fontSize: "13px", fontWeight: "600", color: "#6b7280" }}>Base Amount</td>
              <td style={{ padding: "6px 0", fontSize: "13px", fontWeight: "600", color: "#111827", textAlign: "right" }}>₦{payment.original_amount.toLocaleString()}</td>
            </tr>
            <tr>
              <td style={{ padding: "6px 0", fontSize: "13px", fontWeight: "600", color: "#6b7280" }}>Gateway Fee</td>
              <td style={{ padding: "6px 0", fontSize: "13px", fontWeight: "600", color: "#111827", textAlign: "right" }}>₦{payment.paystack_charge.toLocaleString()}</td>
            </tr>
            <tr>
              <td colSpan={2} style={{ paddingTop: "12px", paddingBottom: "12px" }}>
                <div style={{ height: "1px", backgroundColor: "#d1d5db" }}></div>
              </td>
            </tr>
            <tr>
              <td style={{ padding: "6px 0", fontSize: "15px", fontWeight: "700", color: "#111827" }}>Total Amount Paid</td>
              <td style={{ padding: "6px 0", fontSize: "22px", fontWeight: "700", color: "#16a34a", textAlign: "right" }}>₦{payment.total_amount.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div style={{ textAlign: "center", marginTop: "32px" }}>
        <div style={{ fontSize: "11px", color: "#6b7280", marginBottom: "6px" }}>This is an official payment receipt. Keep for your records.</div>
        <div style={{ fontSize: "10px", color: "#9ca3af" }}>Generated on {format(new Date(), "dd/MM/yyyy HH:mm:ss")}</div>
      </div>

      {/* Bottom Border */}
      <div style={{ height: "8px", backgroundColor: "#16a34a", marginTop: "32px", marginLeft: "-40px", marginRight: "-40px", marginBottom: "-40px" }}></div>
    </div>
  );
};

// Display Receipt Component - Responsive for screen
export const DisplayReceiptContent: React.FC<{ payment: ReceiptData }> = ({ payment }) => {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg overflow-hidden w-full max-w-3xl mx-auto shadow-lg border border-gray-300 dark:border-gray-700">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 px-4 sm:px-6 py-3 sm:py-4 border-b-2 border-gray-300 dark:border-gray-700">
        <div className="flex justify-between items-center gap-2 sm:gap-3 mb-3">
          <div className="flex items-center gap-1.5 sm:gap-3">
            <img src={nacos} alt="NACOS" className="h-8 w-8 sm:h-12 sm:w-12 object-contain" />
            <div>
              <p className="text-[10px] sm:text-sm font-bold text-gray-900 dark:text-gray-100 leading-tight">NACOS</p>
              <p className="text-[8px] sm:text-xs text-gray-600 dark:text-gray-400 leading-tight">KDU Chapter</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-3">
            <div className="text-right">
              <p className="text-[10px] sm:text-sm font-bold text-gray-900 dark:text-gray-100 leading-tight">KOLADAISI</p>
              <p className="text-[8px] sm:text-xs text-gray-600 dark:text-gray-400 leading-tight">University</p>
            </div>
            <img src={KDU} alt="University" className="h-8 w-8 sm:h-12 sm:w-12 object-contain" />
          </div>
        </div>
        <div className="text-center pt-3 border-t-2 border-gray-200 dark:border-gray-700">
          <h1 className="text-base sm:text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">PAYMENT RECEIPT</h1>
          <div className="inline-flex items-center gap-1 text-green-600 dark:text-green-500 text-[10px] sm:text-sm font-semibold">
            <CheckCircle2 className="w-3 h-3 sm:w-5 sm:h-5" />
            <span>PAYMENT SUCCESSFUL</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 py-4 sm:py-5">
        {/* Amount */}
        <div className="text-center mb-4 sm:mb-5 pb-4 border-b-2 border-dashed border-gray-300 dark:border-gray-700">
          <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">Amount Paid</p>
          <div className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100">₦{payment.total_amount.toLocaleString()}</div>
        </div>

        {/* Student Info - Grid Format */}
        <div className="mb-4 sm:mb-5">
          <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm sm:text-base mb-3 pb-2 border-b-2 border-gray-300 dark:border-gray-700">Student Information</h3>
          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            <div>
              <label className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 block mb-1">Name</label>
              <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100 break-words">{payment.student.full_name}</p>
            </div>
            <div>
              <label className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 block mb-1">Matric Number</label>
              <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100 font-mono break-words">{payment.student.matric_number}</p>
            </div>
            <div>
              <label className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 block mb-1">Level</label>
              <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100">{payment.student.level}L</p>
            </div>
            <div>
              <label className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 block mb-1">Department</label>
              <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100 break-words">{payment.student.department}</p>
            </div>
             <div className="col-span-2">
              <label className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 block mb-1">Email</label>
              <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100 break-words">{payment.student.email}</p>
            </div>
          </div>
        </div>

        {/* Transaction Details */}
        <div className="mb-4 sm:mb-5">
          <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm sm:text-base mb-3 pb-2 border-b-2 border-gray-300 dark:border-gray-700">Transaction Details</h3>
          <div className="space-y-2 sm:space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0">
              <label className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400">Payment For</label>
              <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100">{payment.category.name}</p>
            </div>
            <div>
              <label className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 block mb-1">Payment Reference</label>
              <p className="text-xs font-mono bg-gray-100 dark:bg-gray-800 px-2 sm:px-3 py-2 rounded border border-gray-300 dark:border-gray-700 break-all text-gray-900 dark:text-gray-100">{payment.payment_reference}</p>
            </div>
            {payment.transaction_reference && (
              <div>
                <label className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 block mb-1">Transaction Reference</label>
                <p className="text-xs font-mono bg-gray-100 dark:bg-gray-800 px-2 sm:px-3 py-2 rounded border border-gray-300 dark:border-gray-700 break-all text-gray-900 dark:text-gray-100">{payment.transaction_reference}</p>
              </div>
            )}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0">
              <label className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400">Payment Date</label>
              <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100">{format(new Date(payment.created_at), "dd/MM/yyyy")}</p>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0">
              <label className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400">Payment Time</label>
              <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100">{format(new Date(payment.created_at), "HH:mm:ss")}</p>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg border-2 border-gray-300 dark:border-gray-700 p-3 sm:p-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400">Base Amount</span>
              <span className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100">₦{payment.original_amount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400">Gateway Fee</span>
              <span className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100">₦{payment.paystack_charge.toLocaleString()}</span>
            </div>
            <div className="h-px bg-gray-300 dark:bg-gray-700"></div>
            <div className="flex justify-between items-center">
              <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-gray-100">Total Paid</h3>
              <span className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-500">₦{payment.total_amount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 sm:mt-5 text-center">
          <p className="text-xs text-gray-600 dark:text-gray-400">This is an official payment receipt. Keep for your records.</p>
          <p className="text-xs text-gray-500 mt-1">Generated on {format(new Date(), "dd/MM/yyyy HH:mm:ss")}</p>
        </div>
      </div>

      <div className="h-2 bg-green-600 dark:bg-green-500"></div>
    </div>
  );
};

// Main Component
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

      const container = document.createElement("div");
      container.style.position = "absolute";
      container.style.left = "-9999px";
      container.style.top = "0";
      document.body.appendChild(container);

      const root = createRoot(container);
      root.render(<ReceiptContent payment={payment} />);

      await new Promise((resolve) => setTimeout(resolve, 1500));

      const dataUrl = await domToPng(container.firstChild as HTMLElement, {
        quality: 1.0,
        backgroundColor: "#ffffff",
        scale: 2,
        features: {
          removeControlCharacter: true,
        },
      });

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgWidth = 210;
      const imgHeight = 297;

      pdf.addImage(dataUrl, "PNG", 0, 0, imgWidth, imgHeight, undefined, "FAST");
      pdf.save(`NACOS_Receipt_${payment.payment_reference}.pdf`);

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
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-background p-4">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center bg-card rounded-lg p-6 sm:p-8 shadow-lg border border-border">
            <Loader2 className="h-10 w-10 sm:h-12 sm:w-12 animate-spin text-green-600 mx-auto mb-3" />
            <h3 className="text-base sm:text-lg font-bold text-foreground mb-1">Loading Receipt</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">Please wait...</p>
          </motion.div>
        </div>
      </Layout>
    );
  }

  if (error || !payment) {
    return (
      <Layout>
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-background p-4">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center bg-card rounded-lg p-6 sm:p-8 shadow-lg border border-border max-w-md w-full">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-red-100 dark:bg-red-950/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="h-7 w-7 sm:h-8 sm:w-8 text-red-600 dark:text-red-500" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-foreground mb-2">Receipt Not Found</h2>
            <p className="text-xs sm:text-sm text-muted-foreground mb-4">{error || "Could not find payment details."}</p>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button asChild variant="outline" className="flex-1" size="sm">
                <Link to="/history">
                  <FileText className="mr-2 h-4 w-4" />
                  History
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
          /* Hide non-printable elements */
          .no-print { display: none !important; }
          body { margin: 0; padding: 0; background: white !important; }
          
          /* Force light mode styles for printing */
          * {
            background-color: white !important;
            color: black !important;
          }
          
          /* Override specific elements with their light mode colors */
          .bg-white, .dark\\:bg-gray-900 {
            background-color: white !important;
          }
          
          .dark\\:bg-gray-800 {
            background-color: white !important;
          }
          
          .dark\\:bg-gray-800 {
            background-color: #f3f4f6 !important;
          }
          
          .text-gray-900, .dark\\:text-gray-100 {
            color: #111827 !important;
          }
          
          .text-gray-600, .dark\\:text-gray-400 {
            color: #6b7280 !important;
          }
          
          .text-gray-500 {
            color: #9ca3af !important;
          }
          
          .text-green-600, .dark\\:text-green-500 {
            color: #16a34a !important;
          }
          
          .bg-gray-100, .dark\\:bg-gray-800 {
            background-color: #f3f4f6 !important;
          }
          
          /* Force light mode borders */
          .border-gray-300, .dark\\:border-gray-700 {
            border-color: #d1d5db !important;
          }
          
          .border-gray-200, .dark\\:border-gray-700 {
            border-color: #e5e7eb !important;
          }
          
          /* Maintain border thickness */
          .border-b-2 {
            border-bottom-width: 2px !important;
          }
          
          .border-t-2 {
            border-top-width: 2px !important;
          }
          
          .border-2 {
            border-width: 2px !important;
          }
          
          .border {
            border-width: 1px !important;
          }
          
          /* Green bottom bar */
          .bg-green-600, .dark\\:bg-green-500 {
            background-color: #16a34a !important;
          }
          
          @page { 
            size: A4; 
            margin: 0; 
          }
        }
      `}</style>
      <div className="min-h-[calc(100vh-4rem)] bg-gray-50 dark:bg-gray-950 py-4 sm:py-6 md:py-8 px-4">
        <div className="container max-w-4xl mx-auto">
          <AnimatePresence>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              {/* Actions */}
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="max-w-3xl mx-auto mb-3 sm:mb-4 no-print flex justify-between items-center">
                <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")} className="text-xs sm:text-sm">
                  <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Back to Dashboard</span>
                  <span className="sm:hidden">Back</span>
                </Button>
                <Button onClick={handleDownloadPDF} disabled={downloading} size="sm" className="bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm">
                  {downloading ? (
                    <>
                      <Loader2 className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                      <span className="hidden sm:inline">Generating...</span>
                      <span className="sm:hidden">Wait...</span>
                    </>
                  ) : (
                    <>
                      <Download className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">Download PDF</span>
                      <span className="sm:hidden">Download</span>
                    </>
                  )}
                </Button>
              </motion.div>

              {/* Display Receipt */}
              <div className="overflow-x-auto">
                <DisplayReceiptContent payment={payment} />
              </div>

              {/* Print Receipt - COMMENTED OUT TO PREVENT DOUBLE PRINTING */}
              {/* <div id="print-receipt" style={{ display: "none" }}>
                <ReceiptContent payment={payment} />
              </div> */}

              {/* Bottom Actions */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-4 sm:mt-6 max-w-3xl mx-auto no-print">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  <Button onClick={handlePrint} variant="outline" className="h-10 sm:h-11 text-xs sm:text-sm font-semibold border-2">
                    <Printer className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                    Print Receipt
                  </Button>
                  <Button asChild variant="outline" className="h-10 sm:h-11 text-xs sm:text-sm font-semibold border-2">
                    <Link to="/history">
                      <FileText className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                      All Receipts
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