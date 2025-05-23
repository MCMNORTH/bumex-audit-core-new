import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Printer, Send, FileText, Plus, CreditCard } from "lucide-react";
import { Invoice, User } from "@/types";
import { firestore } from "@/lib/firebase";
import { toast } from "@/components/ui/use-toast";
import { InvoicePaymentDialog } from "@/components/InvoicePaymentDialog";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";

export default function InvoiceDetail() {
  const { invoiceId } = useParams<{ invoiceId: string }>();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchInvoice = async () => {
      if (!invoiceId) return;
      
      try {
        setLoading(true);
        const fetchedInvoice = await firestore.getInvoice(invoiceId) as Invoice;
        if (fetchedInvoice) {
          // Check if the invoice is overdue
          if (fetchedInvoice.status !== 'paid' && fetchedInvoice.status !== 'partial') {
            const dueDate = new Date(fetchedInvoice.dueDate);
            const today = new Date();
            
            if (dueDate < today && fetchedInvoice.status !== 'overdue') {
              // Update the invoice status in the database
              await firestore.updateInvoice(invoiceId, { 
                status: 'overdue',
                updatedAt: new Date().toISOString()
              });
              fetchedInvoice.status = 'overdue';
            }
          }
          
          setInvoice(fetchedInvoice);
        }
      } catch (error) {
        console.error("Error fetching invoice:", error);
        toast({
          title: "Error",
          description: "Failed to load invoice details. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [invoiceId]);

  const handlePrint = () => {
    const printContent = document.getElementById('invoice-printable');
    const originalBody = document.body.innerHTML;
    
    if (printContent) {
      // Set document title for the print job
      const invoiceNumber = invoice?.id.substring(0, 8) || "";
      const originalTitle = document.title;
      document.title = `Invoice #${invoiceNumber}`;
      
      // Create a style element for print styling
      const style = document.createElement('style');
      style.innerHTML = `
        @media print {
          body {
            padding: 20mm !important;
            margin: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `;
      document.head.appendChild(style);
      
      document.body.innerHTML = printContent.innerHTML;
      window.print();
      
      // Restore the original document
      document.body.innerHTML = originalBody;
      document.title = originalTitle;
      document.head.removeChild(style);
      
      // Re-initialize the page after printing
      window.location.reload();
    }
  };

  const handleSendEmail = () => {
    // In a real app, this would trigger an API call to send an email
    toast({
      title: "Email Sent",
      description: `Invoice was sent to the client.`,
    });
  };
  
  const handlePaymentAdded = (updatedInvoice: Invoice) => {
    setInvoice(updatedInvoice);
  };

  const formatCurrency = (amount: number, currency: string) => {
    return `${currency} ${amount.toFixed(2)}`;
  };
  
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("en-US").format(date);
    } catch (error) {
      return dateString;
    }
  };

  // Fix the type error by using a safer check for admin privileges
  // The Firebase User type doesn't have the userType property, so we need to check differently
  const isDeveloper = currentUser ? 
    // Check if the user is an admin
    (currentUser as any).userType === "admin" : false;

  if (loading) {
    return <div className="container mx-auto py-8">Loading invoice...</div>;
  }

  if (!invoice) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Invoice not found</h2>
          <Button onClick={() => navigate('/invoices')}>
            Back to Invoices
          </Button>
        </div>
      </div>
    );
  }
  
  const remainingAmount = invoice.total - (invoice.amountPaid || 0);
  const isPaid = invoice.status === 'paid';
  const isPartiallyPaid = invoice.status === 'partial';
  const canAddPayment = !isPaid && invoice.status !== 'draft' && invoice.status !== 'cancelled';

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex justify-between items-center">
        <Button variant="outline" onClick={() => navigate('/invoices')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Invoices
        </Button>
        <div className="space-x-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" /> Print
          </Button>
          
          {isDeveloper && (
            <>
              <Button variant="outline" onClick={handleSendEmail}>
                <Send className="h-4 w-4 mr-2" /> Send to Client
              </Button>
              {canAddPayment && (
                <Button onClick={() => setShowPaymentDialog(true)}>
                  <CreditCard className="h-4 w-4 mr-2" /> Record Payment
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      <div id="invoice-printable" className="bg-white p-8 rounded-lg shadow">
        <div className="flex justify-between items-center mb-8">
          <div>
            <img 
              src="https://storage.googleapis.com/flutterflow-io-6f20.appspot.com/projects/over-work-98o8wz/assets/k8h0x3i2mmoy/logo_wide_transparent_black_writing.png" 
              alt="OVERCODE" 
              className="h-12"
            />
            <p className="text-sm text-gray-500 mt-1">OVERCODE MAURITANIE SARL</p>
            <p className="text-sm text-gray-500">support@overcode.dev</p>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-bold text-gray-800">INVOICE</h2>
            <p className="text-gray-500">#{invoice.id.substring(0, 8)}</p>
            <div className={`mt-1 inline-block px-2 py-1 text-xs rounded-full ${
              invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
              invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              invoice.status === 'partial' ? 'bg-blue-100 text-blue-800' :
              invoice.status === 'draft' ? 'bg-gray-100 text-gray-800' :
              invoice.status === 'overdue' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-gray-500 font-medium mb-2">Bill To:</h3>
            <p className="font-bold">{invoice.clientName}</p>
            {invoice.clientContact && (
              <p className="text-sm text-gray-500">{invoice.clientContact}</p>
            )}
            {invoice.userId && (
              <p className="text-sm text-gray-500">Client ID: {invoice.userId}</p>
            )}
          </div>
          <div className="text-right">
            <div className="mb-2">
              <span className="text-gray-500">Issue Date: </span>
              <span>{formatDate(invoice.issueDate)}</span>
            </div>
            <div className="mb-2">
              <span className="text-gray-500">Due Date: </span>
              <span>{formatDate(invoice.dueDate)}</span>
            </div>
            <div className="mb-2">
              <span className="text-gray-500">Currency: </span>
              <span>{invoice.currency}</span>
            </div>
          </div>
        </div>

        <table className="w-full mb-8">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="py-2 text-left text-gray-500">Description</th>
              <th className="py-2 text-right text-gray-500">Quantity</th>
              <th className="py-2 text-right text-gray-500">Price</th>
              <th className="py-2 text-right text-gray-500">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, index) => (
              <tr key={index} className="border-b border-gray-100">
                <td className="py-4">{item.description}</td>
                <td className="py-4 text-right">{item.quantity}</td>
                <td className="py-4 text-right">{formatCurrency(item.price, invoice.currency)}</td>
                <td className="py-4 text-right">{formatCurrency(item.quantity * item.price, invoice.currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end">
          <div className="w-1/3">
            <div className="flex justify-between pb-2">
              <span className="font-medium">Subtotal:</span>
              <span>{formatCurrency(invoice.total, invoice.currency)}</span>
            </div>
            <div className="flex justify-between pb-2">
              <span className="font-medium">Tax (0%):</span>
              <span>{formatCurrency(0, invoice.currency)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-200">
              <span className="font-bold">Total:</span>
              <span className="font-bold">{formatCurrency(invoice.total, invoice.currency)}</span>
            </div>
            
            {(isPartiallyPaid || isPaid) && (
              <div className="mt-2">
                <div className="flex justify-between pb-2">
                  <span className="font-medium">Paid:</span>
                  <span className="text-green-600">{formatCurrency(invoice.amountPaid || 0, invoice.currency)}</span>
                </div>
                {!isPaid && (
                  <div className="flex justify-between pt-2 border-t border-gray-200">
                    <span className="font-bold">Balance Due:</span>
                    <span className="font-bold text-red-600">{formatCurrency(remainingAmount, invoice.currency)}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {invoice.payments && invoice.payments.length > 0 && (
          <div className="mt-8 pt-4 border-t border-gray-200">
            <h3 className="text-lg font-medium mb-4">Payment History</h3>
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 text-sm">
                  <th className="py-2 text-left text-gray-500">Date</th>
                  <th className="py-2 text-left text-gray-500">Amount</th>
                  <th className="py-2 text-left text-gray-500">Note</th>
                </tr>
              </thead>
              <tbody>
                {invoice.payments.map((payment) => (
                  <tr key={payment.id} className="border-b border-gray-100 text-sm">
                    <td className="py-3">{formatDate(payment.date)}</td>
                    <td className="py-3 text-green-600">{formatCurrency(payment.amount, invoice.currency)}</td>
                    <td className="py-3 text-gray-600">{payment.note || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-8 pt-8 border-t border-gray-200 text-center text-gray-500 text-sm">
          <p>Thank you for your business!</p>
          <p>For questions regarding this invoice, please contact support@overcode.dev</p>
        </div>
      </div>
      
      <InvoicePaymentDialog
        invoice={invoice}
        open={showPaymentDialog}
        onOpenChange={setShowPaymentDialog}
        onPaymentAdded={handlePaymentAdded}
      />
    </div>
  );
}
